'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { useWorkbench } from '@/lib/state/workbench';
import type { Span } from '@/lib/graph/schema';

type Mark = Span & { strong: boolean };
type Piece = { text: string; mark: 'none' | 'cited' | 'focus' };

/** Parte un párrafo en trozos según las marcas que lo tocan; la de foco gana a la de cita. */
function piecesOf(text: string, offset: number, marks: Mark[]): Piece[] {
  const end = offset + text.length;
  const cuts = new Set([offset, end]);
  for (const m of marks) {
    if (m.end <= offset || m.start >= end) continue;
    cuts.add(Math.max(m.start, offset));
    cuts.add(Math.min(m.end, end));
  }
  const points = [...cuts].sort((a, b) => a - b);
  const pieces: Piece[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i] ?? offset;
    const b = points[i + 1] ?? end;
    const covering = marks.filter((m) => m.start <= a && m.end >= b);
    const mark = covering.some((m) => m.strong) ? 'focus' : covering.length > 0 ? 'cited' : 'none';
    pieces.push({ text: text.slice(a - offset, b - offset), mark });
  }
  return pieces;
}

/**
 * El texto fuente con sus marcas: en lima las frases de origen de lo citado en la revisión
 * activa, y con recuadro de tinta la del nodo con el foco. Todo remite a su origen.
 */
export function SourceText() {
  const text = useWorkbench((s) => s.source?.text ?? '');
  const graph = useWorkbench((s) => s.graph);
  const cited = useWorkbench((s) => s.highlight?.cited);
  const focus = useWorkbench((s) => s.focusNode ?? s.selectedNode);
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const marks = useMemo<Mark[]>(() => {
    if (!graph) return [];
    const out: Mark[] = [];
    for (const e of graph.entities) {
      if (!e.evidence) continue;
      const strong = e.id === focus;
      if (strong || cited?.includes(e.id)) out.push({ ...e.evidence, strong });
    }
    return out;
  }, [graph, cited, focus]);

  const paragraphs = useMemo(
    () =>
      text.split('\n').reduce<Array<{ at: number; p: string }>>((acc, p) => {
        const prev = acc.at(-1);
        acc.push({ at: prev ? prev.at + prev.p.length + 1 : 0, p });
        return acc;
      }, []),
    [text],
  );

  useEffect(() => {
    if (!focus) return;
    container.current
      ?.querySelector('mark[data-focus]')
      ?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }, [focus, reduced]);

  return (
    <div ref={container} className="space-y-3 text-[14px] leading-[1.65] text-ink">
      {paragraphs.map(({ at, p }) =>
        p.trim() === '' ? null : (
          <p key={at} className="max-w-[65ch]">
            {piecesOf(p, at, marks).map((piece, i) =>
              piece.mark === 'none' ? (
                <span key={i}>{piece.text}</span>
              ) : (
                <mark
                  key={i}
                  data-focus={piece.mark === 'focus' ? '' : undefined}
                  className={`bg-markup text-ink [box-decoration-break:clone] ${piece.mark === 'focus' ? 'outline outline-ink' : ''}`}
                >
                  {piece.text}
                </mark>
              ),
            )}
          </p>
        ),
      )}
    </div>
  );
}
