import type { EdgeId, Entity, KnowledgeGraph, NodeId, Relation, Span } from './schema.ts';
import { normalizeText, tokenize } from './text.ts';

/** Un paso del recorrido. Viaja al cliente como parte de datos `data-trace` antes que el texto. */
export type TraceStep = {
  /** 0 = semillas; 1..n = saltos. */
  step: number;
  kind: 'seed' | 'hop';
  nodes: NodeId[];
  /** Aristas recorridas en este paso. Vacío en las semillas. */
  edges: EdgeId[];
  /** Frase legible para la bitácora y el lector de pantalla. */
  reason: string;
};

export type Retrieval = {
  steps: TraceStep[];
  /** Todo lo que entra en el contexto del modelo, en orden de llegada. */
  nodes: NodeId[];
  edges: EdgeId[];
  /** true si nada coincidió con la pregunta y se partió de los nodos más conectados. */
  fallback: boolean;
};

export type RetrieveOptions = { maxSeeds: number; maxHops: number; maxNodes: number; maxEdges: number };
const DEFAULTS: RetrieveOptions = { maxSeeds: 3, maxHops: 2, maxNodes: 24, maxEdges: 40 };
const SEED_THRESHOLD = 0.5;

const namesOf = (e: Entity): string[] => [e.name, ...e.aliases].map(normalizeText).filter((n) => n.length > 2);

/** Nombre o alias completo dentro de la pregunta: señal fuerte, más fuerte cuanto más largo. */
function fullMatchScore(entity: Entity, question: string): number {
  let score = 0;
  for (const n of namesOf(entity)) {
    if (new RegExp(`(^|[^\\p{L}\\p{N}])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'u').test(question)) {
      score = Math.max(score, 3 + n.split(' ').length);
    }
  }
  return score;
}

/** Solapamiento parcial con las palabras que no consumió una coincidencia completa: «Curie» encuentra a «Marie Curie». */
function partialMatchScore(entity: Entity, free: ReadonlySet<string>): number {
  const nameTokens = new Set(namesOf(entity).flatMap(tokenize));
  if (nameTokens.size === 0) return 0;
  let overlap = 0;
  for (const t of nameTokens) if (free.has(t)) overlap++;
  return (overlap / nameTokens.size) * 2;
}

/** Cuántas palabras de la intención (la pregunta sin los nombres de las semillas) toca esta arista. */
function edgeRelevance(rel: Relation, other: Entity, intent: ReadonlySet<string>): number {
  let hits = 0;
  for (const t of new Set(tokenize(`${rel.predicate} ${other.name} ${other.description}`))) if (intent.has(t)) hits++;
  return hits;
}

/**
 * Recuperación determinista sobre el grafo, sin llamadas al modelo.
 * Semillas: primero los nombres completos que aparecen en la pregunta, que consumen sus palabras;
 * después, coincidencias parciales con las palabras libres. Expansión en anchura por saltos,
 * con los vecinos ordenados por relevancia frente a la intención (la pregunta sin los nombres
 * de las semillas) y, a igualdad, por grado. Los presupuestos acotan el contexto del modelo.
 */
export function retrieve(graph: KnowledgeGraph, rawQuestion: string, options: Partial<RetrieveOptions> = {}): Retrieval {
  const opts = { ...DEFAULTS, ...options };
  const question = normalizeText(rawQuestion);
  const qTokens = new Set(tokenize(rawQuestion));
  const byId = new Map(graph.entities.map((e) => [e.id, e] as const));

  const adjacency = new Map<NodeId, Array<{ rel: Relation; other: NodeId }>>();
  for (const rel of graph.relations) {
    adjacency.set(rel.source, [...(adjacency.get(rel.source) ?? []), { rel, other: rel.target }]);
    adjacency.set(rel.target, [...(adjacency.get(rel.target) ?? []), { rel, other: rel.source }]);
  }

  const full = graph.entities
    .map((e) => ({ e, score: fullMatchScore(e, question) }))
    .filter((s) => s.score > 0);
  const consumed = new Set(full.flatMap((s) => namesOf(s.e).flatMap(tokenize)));
  const free = new Set([...qTokens].filter((t) => !consumed.has(t)));
  const partial = graph.entities
    .filter((e) => !full.some((s) => s.e.id === e.id))
    .map((e) => ({ e, score: partialMatchScore(e, free) }))
    .filter((s) => s.score >= SEED_THRESHOLD);

  const scored = [...full, ...partial]
    .sort((a, b) => b.score - a.score || b.e.degree - a.e.degree)
    .slice(0, opts.maxSeeds);

  const fallback = scored.length === 0;
  const seeds = fallback
    ? [...graph.entities].sort((a, b) => b.degree - a.degree).slice(0, opts.maxSeeds)
    : scored.map((s) => s.e);
  const seedNames = new Set(seeds.flatMap((e) => namesOf(e).flatMap(tokenize)));
  const intent = new Set([...qTokens].filter((t) => !seedNames.has(t)));

  const visited = new Set<NodeId>(seeds.map((e) => e.id));
  const usedEdges = new Set<EdgeId>();
  const steps: TraceStep[] = [
    {
      step: 0,
      kind: 'seed',
      nodes: seeds.map((e) => e.id),
      edges: [],
      reason: fallback
        ? 'Nada de la pregunta coincide con el grafo: se parte de las entidades más conectadas.'
        : `Coinciden con la pregunta: ${seeds.map((e) => e.name).join(', ')}.`,
    },
  ];

  let frontier = seeds.map((e) => e.id);
  for (let hop = 1; hop <= opts.maxHops && frontier.length > 0; hop++) {
    const candidates: Array<{ node: NodeId; rel: Relation; score: number; degree: number }> = [];
    for (const from of frontier) {
      for (const { rel, other } of adjacency.get(from) ?? []) {
        const entity = byId.get(other);
        if (!entity || usedEdges.has(rel.id)) continue;
        candidates.push({ node: other, rel, score: edgeRelevance(rel, entity, intent), degree: entity.degree });
      }
    }
    candidates.sort((a, b) => b.score - a.score || b.degree - a.degree);

    const stepNodes: NodeId[] = [];
    const stepEdges: EdgeId[] = [];
    for (const c of candidates) {
      if (usedEdges.size >= opts.maxEdges) break;
      if (usedEdges.has(c.rel.id)) continue;
      if (!visited.has(c.node)) {
        if (visited.size >= opts.maxNodes) continue;
        visited.add(c.node);
        stepNodes.push(c.node);
      }
      // Una arista entre dos nodos ya visitados también entra: conecta el contexto.
      usedEdges.add(c.rel.id);
      stepEdges.push(c.rel.id);
    }
    if (stepNodes.length === 0 && stepEdges.length === 0) break;

    const predicates = [...new Set(stepEdges.map((id) => graph.relations.find((r) => r.id === id)?.predicate))]
      .filter((p): p is string => typeof p === 'string')
      .slice(0, 3);
    steps.push({
      step: hop,
      kind: 'hop',
      nodes: stepNodes,
      edges: stepEdges,
      reason: stepNodes.length > 0
        ? `Salto ${hop}: ${stepNodes.length} ${stepNodes.length === 1 ? 'entidad nueva' : 'entidades nuevas'} por ${predicates.map((p) => `«${p}»`).join(', ')}.`
        : `Salto ${hop}: relaciones entre entidades ya recorridas.`,
    });
    frontier = stepNodes;
  }

  return { steps, nodes: [...visited], edges: [...usedEdges], fallback };
}

/** Contexto en texto plano para el modelo: solo lo recuperado, con su cita de origen. */
export function buildContext(graph: KnowledgeGraph, source: string, retrieval: Retrieval): string {
  const nodes = new Set(retrieval.nodes);
  const edges = new Set(retrieval.edges);
  const quote = (span: Span | null) => (span ? `«${source.slice(span.start, span.end)}»` : '(sin cita verificada)');

  const entityLines = graph.entities
    .filter((e) => nodes.has(e.id))
    .map((e) => `[${e.id}] ${e.name} (${e.type}): ${e.description} | cita: ${quote(e.evidence)}`);
  const relationLines = graph.relations
    .filter((r) => edges.has(r.id))
    .map((r) => `[${r.source}] -${r.predicate}-> [${r.target}] | cita: ${quote(r.evidence)}`);

  return `ENTIDADES\n${entityLines.join('\n')}\n\nRELACIONES\n${relationLines.join('\n')}`;
}
