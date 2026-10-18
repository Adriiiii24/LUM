'use client';
import { useReactFlow } from '@xyflow/react';
import { useWorkbench } from '@/lib/state/workbench';
import { zoneOf, zonesFor } from '@/lib/graph/layout';
import type { Segment } from '@/lib/chat/citations';
import type { NodeId } from '@/lib/graph/schema';

/** Nota de cita: el número en mono sobre la marca lima. Pasar por ella enfoca su nodo; pulsarla lo centra. */
function CitationChip({ id, index, inContext }: { id: NodeId; index: number; inContext: boolean }) {
  const name = useWorkbench((s) => s.graph?.entities.find((e) => e.id === id)?.name ?? id);
  const position = useWorkbench((s) => s.layout?.positions[id]);
  const bounds = useWorkbench((s) => s.layout?.bounds);
  // La zona de la lámina, como las referencias cruzadas de un plano.
  const zone = position && bounds ? `, zona ${zoneOf(position, zonesFor(bounds))}` : '';
  const setFocus = useWorkbench((s) => s.setFocus);
  const select = useWorkbench((s) => s.select);
  const setMobilePanel = useWorkbench((s) => s.setMobilePanel);
  const flow = useReactFlow();

  return (
    <button
      type="button"
      data-node-id={id}
      title={inContext ? `${name}${zone}` : `${name}${zone}: no estaba en el contexto recuperado`}
      aria-label={inContext ? `Cita ${index}: ${name}${zone}` : `Cita ${index}: ${name}${zone}, fuera del contexto recuperado`}
      onMouseEnter={() => setFocus(id)}
      onMouseLeave={() => setFocus(null)}
      onFocus={() => setFocus(id)}
      onBlur={() => setFocus(null)}
      onClick={() => {
        select(id);
        setMobilePanel('sheet');
        if (position) void flow.setCenter(position.x, position.y, { zoom: Math.max(flow.getZoom(), 1.1), duration: 400 });
      }}
      className={`mx-[0.15em] inline-flex h-[1.2rem] min-w-[1.2rem] items-center justify-center rounded-xs px-1 align-[0.08em] font-mono text-[11px] font-semibold leading-none tabular transition-transform duration-150 hover:-translate-y-px ${
        inContext ? 'bg-markup text-on-markup' : 'border border-dashed border-ink text-ink'
      }`}
    >
      {index}
      {!inContext && '?'}
    </button>
  );
}

/** La respuesta con sus citas convertidas en notas. Varias citas seguidas se agrupan sin repetir número. */
export function AnswerText({ segments }: { segments: Segment[] }) {
  const out: Segment[] = [];
  for (const s of segments) {
    const prev = out.at(-1);
    if (s.kind === 'cite' && prev?.kind === 'cite' && prev.id === s.id) continue;
    if (s.kind === 'text' && /^\s*$/.test(s.text) && prev?.kind === 'cite') continue;
    out.push(s);
  }
  return (
    <p className="text-[14px] leading-[1.65] text-ink">
      {out.map((s, i) =>
        s.kind === 'text' ? <span key={i}>{s.text}</span> : <CitationChip key={i} id={s.id} index={s.index} inContext={s.inContext} />,
      )}
    </p>
  );
}
