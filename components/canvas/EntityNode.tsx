'use client';
import { memo, type KeyboardEvent } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'motion/react';
import { useWorkbench } from '@/lib/state/workbench';
import { EntitySymbol, TYPE_LABEL } from './EntitySymbol';
import { FADED, NODE_BOX, symbolSize, type EntityFlowNode } from './flow-types';

const EASE = [0.16, 1, 0.3, 1] as const;
const ARROW_STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const hidden = { opacity: 0, width: 1, height: 1, minWidth: 0, minHeight: 0, border: 0, top: '50%', left: '50%' } as const;

/** Mueve el foco de teclado al nodo con ese orden de lectura (zonas de izquierda a derecha y de arriba abajo). */
function focusOrder(from: HTMLElement, order: number) {
  const root = from.closest('.react-flow');
  const target = root?.querySelector<HTMLElement>(`[data-node-order="${order}"]`);
  target?.focus();
}

function EntityNodeView({ data }: NodeProps<EntityFlowNode>) {
  const { entity, zone, order } = data;
  // El id tipado sale de la entidad: React Flow solo sabe que es un string.
  const id = entity.id;
  const visual = useWorkbench((s) => s.nodeVisual[id] ?? 'idle');
  const index = useWorkbench((s) => s.citationIndex[id]);
  const focused = useWorkbench((s) => s.focusNode === id);
  const selected = useWorkbench((s) => s.selectedNode === id);
  const isTabStop = useWorkbench((s) => (s.focusNode ?? s.selectedNode) === id || ((s.focusNode ?? s.selectedNode) === null && order === 0));
  const count = useWorkbench((s) => s.graph?.entities.length ?? 0);
  const setFocus = useWorkbench((s) => s.setFocus);
  const select = useWorkbench((s) => s.select);
  const tracing = useWorkbench((s) => s.tracing);
  // Con un nodo en foco, lo que no es su vecindario se aparta para que se lea qué toca.
  const away = useWorkbench((s) => s.hood !== null && !s.hood[id]);

  const size = symbolSize(entity);
  const r = size / 2;
  const dim = visual === 'dim';
  const visited = visual === 'seed' || visual === 'traversed' || visual === 'cited';
  // La lima marca lo visitado mientras se recorre; en reposo, solo lo citado.
  const lit = visual === 'cited' || (tracing && visited);
  const active = focused || selected;
  // Los anillos caen dentro del halo: sobre lima, tinta fija (en el tema oscuro la tinta es hueso).
  const ring = lit ? 'var(--color-on-markup)' : 'var(--color-ink)';
  // Los rótulos viven en LabelLayer, por encima de todos los símbolos y con control de colisiones.

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = ARROW_STEP[event.key];
    if (step !== undefined) {
      event.preventDefault();
      focusOrder(event.currentTarget, (order + step + count) % count);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOrder(event.currentTarget, event.key === 'Home' ? 0 : count - 1);
    } else if (event.key === 'Escape') {
      select(null);
    }
  };

  const state = { idle: '', dim: '', seed: ', semilla del recorrido', traversed: ', recorrida', cited: `, citada (${index ?? ''})` }[visual];

  return (
    <div className="relative transition-opacity duration-200" style={{ width: NODE_BOX, height: NODE_BOX, opacity: away ? FADED : 1 }}>
      <svg
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={NODE_BOX}
        height={NODE_BOX}
        viewBox={`${-NODE_BOX / 2} ${-NODE_BOX / 2} ${NODE_BOX} ${NODE_BOX}`}
        aria-hidden="true"
      >
        {lit && (
          <motion.circle
            key={`halo-${visual}`}
            r={r + 9}
            fill="var(--color-markup)"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22, ease: EASE }}
          />
        )}
        {visual === 'seed' && (
          <g fill="none" stroke={ring} strokeWidth={1}>
            <circle r={r + 4.5} />
            <circle r={r + 7.5} />
          </g>
        )}
        {visual === 'traversed' && (
          <circle r={r + 5.5} fill="none" stroke={ring} strokeWidth={1.25} strokeDasharray="2.5 2" />
        )}
        {visual === 'cited' && <circle r={r + 5.5} fill="none" stroke={ring} strokeWidth={2} />}
        <EntitySymbol entity={entity} size={size} opacity={dim && !away ? FADED : 1} lit={lit} />
        {active && (
          <g fill="var(--color-ink)">
            {[-1, 1].flatMap((sx) => [-1, 1].map((sy) => (
              <rect key={`${sx}${sy}`} x={sx * (r + 10) - 2} y={sy * (r + 10) - 2} width={4} height={4} />
            )))}
          </g>
        )}
      </svg>

      <button
        type="button"
        data-node-order={order}
        data-node-id={id}
        tabIndex={isTabStop ? 0 : -1}
        aria-label={`${entity.name}, ${TYPE_LABEL[entity.type].toLowerCase()}, ${entity.degree} ${entity.degree === 1 ? 'conexión' : 'conexiones'}, zona ${zone}${state}`}
        aria-pressed={selected}
        className="absolute inset-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed focus-visible:outline-ink"
        onMouseEnter={() => setFocus(id)}
        onMouseLeave={() => setFocus(null)}
        onFocus={() => setFocus(id)}
        onBlur={() => setFocus(null)}
        onClick={() => select(selected ? null : id)}
        onKeyDown={onKeyDown}
      >
      </button>

      <Handle type="target" position={Position.Top} isConnectable={false} style={hidden} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={hidden} />
    </div>
  );
}

export const EntityNode = memo(EntityNodeView);
