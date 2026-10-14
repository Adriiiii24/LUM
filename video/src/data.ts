import raw from '../../data/sample/sample.json';

/**
 * Todo lo que enseña el vídeo sale de la muestra grabada (data/sample/sample.json): el texto,
 * el grafo con su layout, el recorrido y la respuesta con sus citas. Nada está inventado.
 */
type EntityType = 'persona' | 'organizacion' | 'lugar' | 'artefacto' | 'concepto' | 'evento' | 'otro';
type Entity = { id: string; name: string; type: EntityType; degree: number; description: string | null };
type Relation = { id: string; source: string; target: string; predicate: string };
type TraceStep = { step: number; kind: 'seed' | 'hop'; nodes: string[]; edges: string[]; reason: string };
type Chunk = { t: number; chunk: { type: string; data?: TraceStep; delta?: string } };
type Sample = {
  title: string;
  text: string;
  graph: { entities: Entity[]; relations: Relation[]; meta: { model: string } };
  layout: { positions: Record<string, { x: number; y: number }>; bounds: { minX: number; minY: number; maxX: number; maxY: number } };
  replays: { question: string; chunks: Chunk[] }[];
};

const sample = raw as unknown as Sample;
const replay = sample.replays[0]!;

export const MODEL = sample.graph.meta.model;
export const ENTITIES = sample.graph.entities;
export const RELATIONS = sample.graph.relations;
export const QUESTION = replay.question;

/** Las dos primeras frases del texto, con las entidades que nombran marcadas. */
const cut = sample.text.indexOf(';');
export const EXCERPT = sample.text.slice(0, cut > 0 ? cut + 1 : 360);

export type Span = { text: string; entity: boolean };
export const EXCERPT_SPANS: Span[] = (() => {
  const hits: { start: number; end: number }[] = [];
  for (const e of ENTITIES) {
    const at = EXCERPT.indexOf(e.name);
    if (at < 0) continue;
    const end = at + e.name.length;
    if (hits.some((h) => at < h.end && end > h.start)) continue;
    hits.push({ start: at, end });
  }
  hits.sort((a, b) => a.start - b.start);
  const spans: Span[] = [];
  let i = 0;
  for (const h of hits) {
    if (h.start > i) spans.push({ text: EXCERPT.slice(i, h.start), entity: false });
    spans.push({ text: EXCERPT.slice(h.start, h.end), entity: true });
    i = h.end;
  }
  if (i < EXCERPT.length) spans.push({ text: EXCERPT.slice(i), entity: false });
  return spans;
})();

/** Mismos tamaños de símbolo que la lámina (lib/graph/layout.ts), por grado. */
export const symbolSize = (degree: number) => (degree >= 5 ? 26 : degree >= 2 ? 22 : 18);

/** El layout grabado, escalado y centrado en el área del grafo del vídeo. */
export const GRAPH_SCALE = 1.42;
const CENTER = { x: 1190, y: 618 };
const b = sample.layout.bounds;
export const pos = (id: string) => {
  const p = sample.layout.positions[id] ?? { x: 0, y: 0 };
  return {
    x: CENTER.x + (p.x - (b.minX + b.maxX) / 2) * GRAPH_SCALE,
    y: CENTER.y + (p.y - (b.minY + b.maxY) / 2) * GRAPH_SCALE,
  };
};

/**
 * Sitio de cada rótulo: a la derecha si cabe; si no, a la izquierda, encima o debajo. Voraz por
 * grado, como LabelLayer en la lámina: los nodos con más conexiones eligen primero.
 */
export type LabelPlace = { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' };
export const LABEL_FONT = 18;
export const LABELS: Record<string, LabelPlace> = (() => {
  type Box = { x0: number; y0: number; x1: number; y1: number };
  const hit = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  const symbols: Box[] = ENTITIES.map((e) => {
    const p = pos(e.id);
    const r = (symbolSize(e.degree) / 2) * GRAPH_SCALE + 9;
    return { x0: p.x - r, y0: p.y - r, x1: p.x + r, y1: p.y + r };
  });
  // La columna izquierda es de la pregunta y la respuesta: ningún rótulo entra en ella.
  const placed: Box[] = [{ x0: 0, y0: 300, x1: 770, y1: 1000 }];
  const out: Record<string, LabelPlace> = {};
  for (const e of [...ENTITIES].sort((a, b) => b.degree - a.degree)) {
    const p = pos(e.id);
    const r = (symbolSize(e.degree) / 2) * GRAPH_SCALE;
    const w = e.name.length * LABEL_FONT * 0.54;
    const h = LABEL_FONT * 1.2;
    const options: Array<[LabelPlace, Box]> = [
      [{ dx: r + 16, dy: 6, anchor: 'start' }, { x0: p.x + r + 14, y0: p.y - h / 2, x1: p.x + r + 18 + w, y1: p.y + h / 2 }],
      [{ dx: -r - 16, dy: 6, anchor: 'end' }, { x0: p.x - r - 18 - w, y0: p.y - h / 2, x1: p.x - r - 14, y1: p.y + h / 2 }],
      [{ dx: 0, dy: -r - 18, anchor: 'middle' }, { x0: p.x - w / 2, y0: p.y - r - 18 - h, x1: p.x + w / 2, y1: p.y - r - 14 }],
      [{ dx: 0, dy: r + 30, anchor: 'middle' }, { x0: p.x - w / 2, y0: p.y + r + 14, x1: p.x + w / 2, y1: p.y + r + 16 + h }],
    ];
    const free = options.find(([, box]) => !placed.some((b) => hit(b, box)) && !symbols.some((s) => hit(s, box)));
    const [place, box] = free ?? options[0]!;
    placed.push(box);
    out[e.id] = place;
  }
  return out;
})();

export const STEPS: TraceStep[] = replay.chunks.flatMap((c) => (c.chunk.type === 'data-trace' && c.chunk.data ? [c.chunk.data] : []));

/** Respuesta en piezas: texto y notas de cita numeradas por orden de aparición, como en el chat. */
export type AnswerPiece = { kind: 'text'; text: string } | { kind: 'cite'; id: string; n: number };
export const ANSWER: AnswerPiece[] = (() => {
  const full = replay.chunks.flatMap((c) => (c.chunk.type === 'text-delta' && c.chunk.delta ? [c.chunk.delta] : [])).join('');
  const order: string[] = [];
  const pieces: AnswerPiece[] = [];
  for (const part of full.split(/(\[\[n\d+\]\])/)) {
    const m = /^\[\[(n\d+)\]\]$/.exec(part);
    if (m) {
      const id = m[1]!;
      if (!order.includes(id)) order.push(id);
      pieces.push({ kind: 'cite', id, n: order.indexOf(id) + 1 });
    } else if (part) {
      pieces.push({ kind: 'text', text: part });
    }
  }
  // Los espacios ante una nota sobran: va pegada a la palabra, como en el chat.
  return pieces.flatMap((p, i) => {
    if (p.kind !== 'text' || pieces[i + 1]?.kind !== 'cite') return [p];
    const text = p.text.trimEnd();
    return text ? [{ kind: 'text' as const, text }] : [];
  });
})();
export const CITED = [...new Set(ANSWER.flatMap((p) => (p.kind === 'cite' ? [p.id] : [])))];

/**
 * La respuesta en fichas para escribirla: texto suelto, o una palabra con sus notas detrás. La
 * palabra y sus notas no se separan al cortar la línea.
 */
export type AnswerToken = { kind: 'text'; text: string } | { kind: 'anchor'; word: string; cites: { id: string; n: number }[] };
export const ANSWER_TOKENS: AnswerToken[] = (() => {
  const tokens: AnswerToken[] = [];
  for (const p of ANSWER) {
    if (p.kind === 'text') {
      tokens.push({ kind: 'text', text: p.text });
      continue;
    }
    const last = tokens.at(-1);
    if (last?.kind === 'anchor') {
      last.cites.push({ id: p.id, n: p.n });
      continue;
    }
    const text = last?.kind === 'text' ? last.text : '';
    const word = /\S+$/.exec(text)?.[0] ?? '';
    if (last?.kind === 'text') last.text = text.slice(0, text.length - word.length);
    tokens.push({ kind: 'anchor', word, cites: [{ id: p.id, n: p.n }] });
  }
  return tokens.filter((t) => t.kind !== 'text' || t.text);
})();
export const tokenLength = (t: AnswerToken) => (t.kind === 'text' ? t.text.length : t.word.length + t.cites.length);
