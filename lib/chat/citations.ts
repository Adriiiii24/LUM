import type { NodeId } from '../graph/schema.ts';

export type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'cite'; id: NodeId; index: number; inContext: boolean };

export type SegmentedAnswer = { segments: Segment[]; cited: NodeId[]; outOfContext: NodeId[] };

/** Acepta [[n3]] y también [[n3, n7]], que los modelos escriben a veces. */
const CITATION = /\[\[\s*(n\d+(?:\s*,\s*n\d+)*)\s*\]\]/g;
/** Posible cita a medio llegar al final del stream: «[», «[[», «[[n1», «[[n1, n», «[[n1]». */
const PARTIAL_TAIL = /\[(?:\[\s*(?:n\d*(?:\s*,\s*n?\d*)*)?\s*\]?)?$/;

/**
 * Parte la respuesta en texto y citas. Mientras el stream sigue abierto (final = false),
 * retiene una cita incompleta del final para no pintar «[[n1» a medias.
 * La numeración sigue el orden de primera aparición, como las notas de un plano.
 */
export function segmentAnswer(text: string, context: ReadonlySet<NodeId>, final: boolean): SegmentedAnswer {
  const body = final ? text : text.replace(PARTIAL_TAIL, '');
  const segments: Segment[] = [];
  const order = new Map<NodeId, number>();
  const outOfContext = new Set<NodeId>();
  let last = 0;

  for (const match of body.matchAll(CITATION)) {
    const start = match.index;
    if (start > last) segments.push({ kind: 'text', text: body.slice(last, start) });
    for (const raw of (match[1] ?? '').split(',')) {
      const id = raw.trim() as NodeId;
      if (!order.has(id)) order.set(id, order.size + 1);
      const inContext = context.has(id);
      if (!inContext) outOfContext.add(id);
      segments.push({ kind: 'cite', id, index: order.get(id) ?? 0, inContext });
    }
    last = start + match[0].length;
  }
  if (last < body.length) segments.push({ kind: 'text', text: body.slice(last) });

  return { segments, cited: [...order.keys()], outOfContext: [...outOfContext] };
}
