'use client';
import { memo } from 'react';
import { EdgeLabelRenderer, useInternalNode, type EdgeProps, type InternalNode } from '@xyflow/react';
import { motion, useReducedMotion } from 'motion/react';
import { useWorkbench } from '@/lib/state/workbench';
import { symbolSize, type EntityFlowNode, type RelationFlowEdge } from './flow-types';
import type { EdgeId, NodeId } from '@/lib/graph/schema';

const EASE = [0.16, 1, 0.3, 1] as const;

function centerOf(node: InternalNode<EntityFlowNode>): [number, number] {
  const { x, y } = node.internals.positionAbsolute;
  return [x + (node.measured.width ?? 0) / 2, y + (node.measured.height ?? 0) / 2];
}

/**
 * Arista recta de borde a borde del símbolo, como una línea de plano.
 * Recorrida: discontinua sobre una banda lima que se traza desde el nodo que llegó antes.
 * Citada (los dos extremos citados): continua sobre la banda.
 */
function RelationEdgeView(props: EdgeProps<RelationFlowEdge>) {
  // Los ids de React Flow se crearon a partir de los nuestros (e1, n3): se recuperan tipados.
  const id = props.id as EdgeId;
  const source = props.source as NodeId;
  const target = props.target as NodeId;
  const data = props.data;
  const from = useInternalNode<EntityFlowNode>(source);
  const to = useInternalNode<EntityFlowNode>(target);
  const visual = useWorkbench((s) => s.edgeVisual[id] ?? 'idle');
  const reverse = useWorkbench((s) => (s.nodeStep[target] ?? Infinity) < (s.nodeStep[source] ?? Infinity));
  const touched = useWorkbench((s) => {
    const f = s.focusNode ?? s.selectedNode;
    return f === source || f === target;
  });
  const tracing = useWorkbench((s) => s.tracing);
  const reduced = useReducedMotion();
  if (!from || !to) return null;

  const [sx, sy] = centerOf(from);
  const [tx, ty] = centerOf(to);
  const angle = Math.atan2(ty - sy, tx - sx);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const gapStart = symbolSize(from.data.entity) / 2 + 9;
  const gapEnd = symbolSize(to.data.entity) / 2 + 11;
  if (Math.hypot(tx - sx, ty - sy) < gapStart + gapEnd + 4) return null;

  const x1 = sx + cos * gapStart;
  const y1 = sy + sin * gapStart;
  const x2 = tx - cos * gapEnd;
  const y2 = ty - sin * gapEnd;
  const path = `M ${x1} ${y1} L ${x2} ${y2}`;
  const drawPath = reverse ? `M ${x2} ${y2} L ${x1} ${y1}` : path;

  const visited = visual === 'traversed' || visual === 'cited';
  // Banda lima: todo lo recorrido mientras se recorre; en reposo, solo lo que une entidades citadas.
  const band = visual === 'cited' || (tracing && visual === 'traversed');
  const inkOpacity = visited || touched ? 1 : visual === 'dim' ? 0.14 : 0.42;
  const head = `${x2 + cos * 1},${y2 + sin * 1} ${x2 - cos * 6.5 - sin * 3.2},${y2 - sin * 6.5 + cos * 3.2} ${x2 - cos * 6.5 + sin * 3.2},${y2 - sin * 6.5 - cos * 3.2}`;
  const showLabel = touched;
  const lit = visited;

  return (
    <>
      {band && (
        <motion.path
          d={drawPath}
          fill="none"
          stroke="var(--color-markup)"
          strokeWidth={7}
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 0.28, ease: EASE }}
        />
      )}
      <path
        d={path}
        fill="none"
        stroke="var(--color-ink)"
        strokeOpacity={inkOpacity}
        strokeWidth={visual === 'cited' ? 1.6 : lit ? 1.25 : 1}
        strokeDasharray={visual === 'traversed' ? '4 3' : undefined}
      />
      <polygon points={head} fill="var(--color-ink)" fillOpacity={inkOpacity} />
      {showLabel && data && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute bg-paper px-1 font-mono text-[10px] leading-4 text-ink-2"
            style={{ transform: `translate(-50%, -50%) translate(${(x1 + x2) / 2}px, ${(y1 + y2) / 2}px)` }}
          >
            {data.relation.predicate}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const RelationEdge = memo(RelationEdgeView);
