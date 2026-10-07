'use client';
import { memo, useMemo } from 'react';
import { ViewportPortal, useStore as useFlowStore } from '@xyflow/react';
import { useWorkbench, type NodeVisual } from '@/lib/state/workbench';
import type { NodeId } from '@/lib/graph/schema';
import { RULER } from './Rulers';
import { symbolSize, type EntityFlowNode } from './flow-types';

const CHAR_W = 6.4;
const MAX_W = 120;
const LINE_H = 15;
/** Por debajo de este zoom solo se rotulan los nodos con más conexiones y los que están en juego. */
const FULL_LABELS_ZOOM = 0.75;

type Rect = { x1: number; y1: number; x2: number; y2: number };
type Position = 'below' | 'above' | 'right' | 'left' | 'below-right' | 'below-left' | 'above-right' | 'above-left';
type Planned = {
  id: NodeId;
  name: string;
  left: number;
  top: number;
  pos: Position;
  scale: number;
  kind: 'cited' | 'active' | 'dim' | 'normal';
  index: number | undefined;
};

/** Ocho sitios por rótulo, en orden de preferencia: los cuatro lados y después las diagonales. */
const POSITIONS: Position[] = ['below', 'above', 'right', 'left', 'below-right', 'below-left', 'above-right', 'above-left'];
const PLACEMENT: Record<Position, { translate: string; origin: string }> = {
  below: { translate: '-50% 0', origin: 'top center' },
  above: { translate: '-50% -100%', origin: 'bottom center' },
  right: { translate: '0 -50%', origin: 'center left' },
  left: { translate: '-100% -50%', origin: 'center right' },
  'below-right': { translate: '0 0', origin: 'top left' },
  'below-left': { translate: '-100% 0', origin: 'top right' },
  'above-right': { translate: '0 -100%', origin: 'bottom left' },
  'above-left': { translate: '-100% -100%', origin: 'bottom right' },
};

function candidate(pos: Position, x: number, y: number, r: number, w: number, h: number): { rect: Rect; left: number; top: number } {
  const d = r * 0.75 + 3;
  switch (pos) {
    case 'below':
      return { rect: { x1: x - w / 2 - 2, y1: y + r + 6, x2: x + w / 2 + 2, y2: y + r + 8 + h }, left: x, top: y + r + 7 };
    case 'above':
      return { rect: { x1: x - w / 2 - 2, y1: y - r - 8 - h, x2: x + w / 2 + 2, y2: y - r - 6 }, left: x, top: y - r - 7 };
    case 'right':
      return { rect: { x1: x + r + 6, y1: y - h / 2 - 1, x2: x + r + 10 + w, y2: y + h / 2 + 1 }, left: x + r + 8, top: y };
    case 'left':
      return { rect: { x1: x - r - 10 - w, y1: y - h / 2 - 1, x2: x - r - 6, y2: y + h / 2 + 1 }, left: x - r - 8, top: y };
    case 'below-right':
      return { rect: { x1: x + d - 1, y1: y + d - 1, x2: x + d + w + 1, y2: y + d + h + 1 }, left: x + d, top: y + d };
    case 'below-left':
      return { rect: { x1: x - d - w - 1, y1: y + d - 1, x2: x - d + 1, y2: y + d + h + 1 }, left: x - d, top: y + d };
    case 'above-right':
      return { rect: { x1: x + d - 1, y1: y - d - h - 1, x2: x + d + w + 1, y2: y - d + 1 }, left: x + d, top: y - d };
    case 'above-left':
      return { rect: { x1: x - d - w - 1, y1: y - d - h - 1, x2: x - d + 1, y2: y - d + 1 }, left: x - d, top: y - d };
  }
}

const overlaps = (a: Rect, b: Rect) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
const overlapArea = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)) * Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));

/**
 * Plan de rótulos en coordenadas de la lámina, con colisiones. Orden de prioridad: citados, foco,
 * semillas, el nodo con más conexiones, recorridos, el resto por conexiones y lo atenuado al final.
 * Cada rótulo prueba ocho sitios con el nombre completo y, si no cabe, con su alias más corto
 * («Aldrin» por «Edwin «Buzz» Aldrin»), como abrevia un cartógrafo; se queda con el primer sitio
 * libre (sin pisar rótulos, símbolos ajenos ni las reglas). Los obligatorios (citados, foco,
 * semillas y el nodo principal) se pintan siempre: si no hay sitio libre, en el que menos pisa,
 * y pisar un símbolo cuesta mucho más que pisar otro rótulo. Ningún rótulo opcional toca el
 * símbolo de otro nodo (con su halo si está en juego, y un margen para que no parezca suyo).
 */
function planLabels(
  nodes: EntityFlowNode[],
  zoom: number,
  view: Rect,
  visual: Partial<Record<NodeId, NodeVisual>>,
  citation: Partial<Record<NodeId, number>>,
  focus: NodeId | null,
): Planned[] {
  const scale = Math.max(1, 0.9 / zoom);
  // Obstáculos: cada símbolo con su anillo y, si está en juego, con su halo; más 4 px de margen
  // para que un rótulo pegado a un símbolo ajeno no se lea como suyo.
  const symbols: Array<{ id: NodeId; rect: Rect }> = nodes.map((n) => {
    const v = visual[n.data.entity.id] ?? 'idle';
    const inPlay = v === 'cited' || v === 'seed' || v === 'traversed' || n.data.entity.id === focus;
    const r = symbolSize(n.data.entity) / 2 + (inPlay ? 10 : 6) + 4;
    return { id: n.data.entity.id, rect: { x1: n.position.x - r, y1: n.position.y - r, x2: n.position.x + r, y2: n.position.y + r } };
  });
  const hub = nodes.reduce<EntityFlowNode | undefined>((best, n) => (!best || n.data.entity.degree > best.data.entity.degree ? n : best), undefined)
    ?.data.entity.id;

  const rank = (n: EntityFlowNode) => {
    const id = n.data.entity.id;
    const v = visual[id] ?? 'idle';
    if (v === 'cited') return 0;
    if (id === focus) return 1;
    if (v === 'seed') return 2;
    if (id === hub) return 3;
    if (v === 'traversed') return 4;
    if (v === 'dim') return 6;
    return 5;
  };
  const ordered = [...nodes].sort((a, b) => rank(a) - rank(b) || b.data.entity.degree - a.data.entity.degree);

  const placed: Rect[] = [];
  const out: Planned[] = [];
  for (const n of ordered) {
    const { entity } = n.data;
    const v = visual[entity.id] ?? 'idle';
    const forced = v === 'cited' || v === 'seed' || entity.id === focus || entity.id === hub;
    const inPlay = forced || v === 'traversed';
    if (!inPlay && zoom < FULL_LABELS_ZOOM && entity.degree < 3) continue;

    const r = symbolSize(entity) / 2;
    const inside = (rect: Rect) => rect.x1 >= view.x1 && rect.x2 <= view.x2 && rect.y1 >= view.y1 && rect.y2 <= view.y2;
    const others = symbols.filter((sym) => sym.id !== entity.id);
    const free = (rect: Rect) => inside(rect) && !placed.some((p) => overlaps(p, rect)) && !others.some((sym) => overlaps(sym.rect, rect));
    const cost = (rect: Rect) =>
      placed.reduce((sum, p) => sum + overlapArea(p, rect), 0) +
      10 * others.reduce((sum, sym) => sum + overlapArea(sym.rect, rect), 0) +
      (inside(rect) ? 0 : (rect.x2 - rect.x1) * (rect.y2 - rect.y1));

    // El nombre completo primero; después el alias más corto, si lo hay.
    const shortest = [...entity.aliases].filter((a) => a.length >= 3 && a.length < entity.name.length).sort((a, b) => a.length - b.length)[0];
    const variants = shortest ? [entity.name, shortest] : [entity.name];
    const options = variants.flatMap((text) => {
      const textW = Math.min(MAX_W, text.length * CHAR_W + (v === 'cited' ? 18 : 4));
      const lines = Math.max(1, Math.ceil((text.length * CHAR_W) / MAX_W));
      const w = textW * scale;
      const h = (lines * LINE_H + 2) * scale;
      return POSITIONS.map((pos) => ({ text, pos, area: w * h, ...candidate(pos, n.position.x, n.position.y, r, w, h) }));
    });
    const cheapest = () => [...options].sort((a, b) => cost(a.rect) / a.area - cost(b.rect) / b.area)[0];
    const chosen = options.find((o) => free(o.rect)) ?? (forced ? cheapest() : undefined);
    if (!chosen) continue;
    placed.push(chosen.rect);
    out.push({
      id: entity.id,
      name: chosen.text,
      left: chosen.left,
      top: chosen.top,
      pos: chosen.pos,
      scale,
      kind: v === 'cited' ? 'cited' : entity.id === focus ? 'active' : v === 'dim' ? 'dim' : 'normal',
      index: citation[entity.id],
    });
  }
  return out;
}

/**
 * Capa de rótulos por encima de todos los símbolos y aristas: el fondo de papel interrumpe las
 * líneas bajo el texto, como una cota en un plano, y ningún símbolo vecino tapa un rótulo.
 */
function LabelLayerView({ nodes }: { nodes: EntityFlowNode[] }) {
  // Zoom en pasos de 0,05: el plan se rehace al cambiar de escala, no en cada fotograma.
  const zoom = useFlowStore((s) => Math.round(s.transform[2] * 20) / 20);
  // Zona visible de la lámina (sin las reglas) en coordenadas del grafo, en pasos de 12 px al desplazar.
  const tx = useFlowStore((s) => Math.round(s.transform[0] / 12) * 12);
  const ty = useFlowStore((s) => Math.round(s.transform[1] / 12) * 12);
  const width = useFlowStore((s) => s.width);
  const height = useFlowStore((s) => s.height);
  const visual = useWorkbench((s) => s.nodeVisual);
  const citation = useWorkbench((s) => s.citationIndex);
  const focus = useWorkbench((s) => s.focusNode ?? s.selectedNode);
  const plan = useMemo(() => {
    const view: Rect = width > 0
      ? { x1: (RULER - tx) / zoom, y1: (RULER - ty) / zoom, x2: (width - tx) / zoom, y2: (height - ty) / zoom }
      : { x1: -Infinity, y1: -Infinity, x2: Infinity, y2: Infinity };
    return planLabels(nodes, zoom, view, visual, citation, focus);
  }, [nodes, zoom, tx, ty, width, height, visual, citation, focus]);

  return (
    <ViewportPortal>
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ zIndex: 5 }}>
        {plan.map((l) => (
          <span
            key={l.id}
            className={[
              'absolute w-max max-w-[120px] text-center text-xs leading-tight',
              l.kind === 'cited'
                ? 'rounded-xs bg-markup px-1 py-px font-medium text-ink'
                : l.kind === 'active'
                  ? 'bg-paper px-0.5 font-medium text-ink'
                  : l.kind === 'dim'
                    ? 'bg-paper px-0.5 text-ink-3'
                    : 'bg-paper px-0.5 text-ink-2',
            ].join(' ')}
            style={{ left: l.left, top: l.top, translate: PLACEMENT[l.pos].translate, scale: String(l.scale), transformOrigin: PLACEMENT[l.pos].origin }}
          >
            {l.kind === 'cited' && l.index !== undefined && <span className="mr-1 font-mono tabular">{l.index}</span>}
            {l.name}
          </span>
        ))}
      </div>
    </ViewportPortal>
  );
}

export const LabelLayer = memo(LabelLayerView);

