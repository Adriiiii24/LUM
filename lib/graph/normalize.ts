import { MAX_ENTITIES, MAX_RELATIONS, type Entity, type Extraction, type KnowledgeGraph, type NodeId, type Relation, type Span } from './schema.ts';
import { slug } from './text.ts';

type FoldedText = { folded: string; map: number[] };

/**
 * Normaliza el texto para buscar citas: espacios colapsados, comillas unificadas y
 * minúsculas, guardando para cada carácter normalizado su posición en el original.
 */
export function foldWithMap(text: string): FoldedText {
  let folded = '';
  const map: number[] = [];
  let lastWasSpace = false;
  for (let i = 0; i < text.length; i++) {
    let ch = text[i] ?? '';
    if (/\s/.test(ch)) {
      if (lastWasSpace) continue;
      ch = ' ';
      lastWasSpace = true;
    } else {
      lastWasSpace = false;
      if ('“”«»„"'.includes(ch)) ch = '"';
      else if ('‘’´`'.includes(ch)) ch = "'";
    }
    // Algún carácter crece al pasar a minúsculas («İ» son dos unidades): cada unidad apunta al mismo original.
    const lower = ch.toLowerCase();
    folded += lower;
    for (let k = 0; k < lower.length; k++) map.push(i);
  }
  return { folded, map };
}

/** Busca la cita en el texto fuente. null si no aparece: esa entidad o relación queda «sin anclaje». */
export function locateEvidence(source: FoldedText, quote: string): Span | null {
  const needle = foldWithMap(quote.trim().replace(/^["'«“]+|["'»”.]+$/g, '')).folded.trim();
  if (needle.length < 4) return null;
  const at = source.folded.indexOf(needle);
  if (at < 0) return null;
  const start = source.map[at];
  const end = source.map[at + needle.length - 1];
  return start === undefined || end === undefined ? null : { start, end: end + 1 };
}

/**
 * De la salida del modelo al grafo de dominio:
 * fusiona entidades duplicadas (misma clave o mismo nombre o alias normalizado),
 * asigna ids compactos, descarta aristas colgantes, bucles y duplicadas,
 * ancla cada cita en el texto y calcula el grado.
 */
export function normalizeExtraction(
  raw: Extraction,
  sourceText: string,
  meta: { model: string; createdAt: string },
): KnowledgeGraph {
  const source = foldWithMap(sourceText);
  const canonical = new Map<string, NodeId>();
  const entities: Entity[] = [];

  for (const e of raw.entities) {
    const name = e.name.trim();
    if (!name) continue;
    const names = [e.key, name, ...e.aliases].map(slug).filter(Boolean);
    const existing = names.map((n) => canonical.get(n)).find((id) => id !== undefined);
    if (existing) {
      const target = entities.find((x) => x.id === existing);
      if (target) {
        target.aliases = [...new Set([...target.aliases, name, ...e.aliases.map((a) => a.trim())])]
          .filter((a) => a && a !== target.name)
          .slice(0, 12);
        target.evidence ??= locateEvidence(source, e.evidence);
      }
      for (const n of names) canonical.set(n, existing);
      continue;
    }
    if (entities.length >= MAX_ENTITIES) continue;
    const id: NodeId = `n${entities.length + 1}`;
    for (const n of names) canonical.set(n, id);
    entities.push({
      id,
      key: slug(e.key) || slug(name),
      name: name.slice(0, 120),
      type: e.type,
      aliases: [...new Set(e.aliases.map((a) => a.trim()).filter((a) => a && a !== name))].slice(0, 12),
      description: e.description.trim().slice(0, 400),
      evidence: locateEvidence(source, e.evidence),
      degree: 0,
    });
  }

  const relations: Relation[] = [];
  const seen = new Set<string>();
  for (const r of raw.relations) {
    const from = canonical.get(slug(r.source));
    const to = canonical.get(slug(r.target));
    const predicate = r.predicate.trim().toLowerCase().slice(0, 80);
    if (!from || !to || from === to || !predicate) continue;
    const signature = `${from}|${predicate}|${to}`;
    if (seen.has(signature) || relations.length >= MAX_RELATIONS) continue;
    seen.add(signature);
    relations.push({ id: `e${relations.length + 1}`, source: from, target: to, predicate, evidence: locateEvidence(source, r.evidence) });
  }

  const degree = new Map<NodeId, number>();
  for (const r of relations) {
    degree.set(r.source, (degree.get(r.source) ?? 0) + 1);
    degree.set(r.target, (degree.get(r.target) ?? 0) + 1);
  }
  for (const e of entities) e.degree = degree.get(e.id) ?? 0;

  return { entities, relations, meta: { ...meta, sourceChars: sourceText.length } };
}
