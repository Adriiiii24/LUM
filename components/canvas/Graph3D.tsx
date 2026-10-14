'use client';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowCounterClockwise, MagnifyingGlassMinus, MagnifyingGlassPlus, Pause, Play } from '@phosphor-icons/react/dist/ssr';
import { useWorkbench } from '@/lib/state/workbench';
import { layout3D } from '@/lib/graph/layout3d';
import { iconFor } from '@/lib/graph/icons';
import type { NodeId } from '@/lib/graph/schema';
import { EntitySymbol } from './EntitySymbol';
import { symbolSize } from './flow-types';

const START = { yaw: -0.55, pitch: 0.32 };
/** Distancia de la cámara en radios del grafo: más cerca, más perspectiva. */
const CAMERA = 3.2;
const LABEL_FONT = 12;

type Projected = { id: NodeId; x: number; y: number; depth: number; f: number };

/** Gira (guiñada y cabeceo) y proyecta en perspectiva. depth: 0 delante, 1 detrás. */
function project(p: { x: number; y: number; z: number }, yaw: number, pitch: number, cx: number, cy: number, scale: number) {
  const x1 = p.x * Math.cos(yaw) + p.z * Math.sin(yaw);
  const z1 = -p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
  const y2 = p.y * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = p.y * Math.sin(pitch) + z1 * Math.cos(pitch);
  const f = CAMERA / (CAMERA + z2);
  return { x: cx + x1 * f * scale, y: cy + y2 * f * scale, depth: (z2 + 1) / 2, f };
}

/** Anillo guía del espacio (ecuador o meridiano) como polilínea proyectada. */
function ring(axis: 'y' | 'x', yaw: number, pitch: number, cx: number, cy: number, scale: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const p = axis === 'y' ? { x: Math.cos(a), y: 0, z: Math.sin(a) } : { x: 0, y: Math.cos(a), z: Math.sin(a) };
    const q = project(p, yaw, pitch, cx, cy, scale);
    pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/**
 * Vista 3D del grafo: el mismo grafo, los mismos símbolos y la misma gramática de estado (halo
 * lima, anillos, bandas en las aristas recorridas), en un espacio que se gira arrastrando o con
 * las flechas. Gira sola despacio salvo con movimiento reducido, mientras se arrastra o con un
 * nodo en foco. Es una vista para mirar; para recorrer nodo a nodo con teclado están la lámina y
 * la lista.
 */
export function Graph3D() {
  const graph = useWorkbench((s) => s.graph);
  const layout = useWorkbench((s) => s.layout);
  const nodeVisual = useWorkbench((s) => s.nodeVisual);
  const edgeVisual = useWorkbench((s) => s.edgeVisual);
  const tracing = useWorkbench((s) => s.tracing);
  const citation = useWorkbench((s) => s.citationIndex);
  const focus = useWorkbench((s) => s.focusNode ?? s.selectedNode);
  const selected = useWorkbench((s) => s.selectedNode);
  const hood = useWorkbench((s) => s.hood);
  const setFocus = useWorkbench((s) => s.setFocus);
  const select = useWorkbench((s) => s.select);
  const reduced = useReducedMotion();

  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [angle, setAngle] = useState(START);
  const [zoom, setZoom] = useState(1);
  const [spin, setSpin] = useState(true);
  const drag = useRef<{ x: number; y: number; moved: number; captured: boolean } | null>(null);

  const points = useMemo(() => (graph && layout ? layout3D(graph, layout) : null), [graph, layout]);
  const icons = useMemo(() => Object.fromEntries((graph?.entities ?? []).map((e) => [e.id, iconFor(e)])), [graph]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Giro automático lento; se para al arrastrar, con foco o con movimiento reducido.
  const turning = spin && !reduced && focus === null;
  useEffect(() => {
    if (!turning) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag.current) setAngle((a) => ({ ...a, yaw: a.yaw + dt * 0.18 }));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [turning]);

  if (!graph || !points) return null;

  const { w, h } = size;
  const scale = Math.min(w, h) * 0.46 * zoom;
  const cx = w / 2;
  const cy = h / 2 + 8;
  const proj: Record<string, Projected> = {};
  for (const e of graph.entities) {
    const p = points[e.id];
    if (p) proj[e.id] = { id: e.id, ...project(p, angle.yaw, angle.pitch, cx, cy, scale) };
  }
  const near = (d: number) => 1 - d;

  const edges = graph.relations
    .map((r) => ({ r, a: proj[r.source], b: proj[r.target] }))
    .filter((e): e is { r: (typeof graph.relations)[number]; a: Projected; b: Projected } => !!e.a && !!e.b)
    .sort((p, q) => (q.a.depth + q.b.depth) - (p.a.depth + p.b.depth));
  const nodes = graph.entities
    .map((e) => ({ e, p: proj[e.id] }))
    .filter((n): n is { e: (typeof graph.entities)[number]; p: Projected } => !!n.p)
    .sort((p, q) => q.p.depth - p.p.depth);

  // Rótulos: vecindario en foco, lo que está en juego y los hubs que quedan delante, sin pisarse.
  const hubs = new Set([...graph.entities].sort((a, b) => b.degree - a.degree).slice(0, 7).map((e) => e.id));
  // Los símbolos también son obstáculos: un rótulo encima de otro nodo parece suyo.
  type Box = { id: NodeId | null; x1: number; y1: number; x2: number; y2: number };
  const placed: Box[] = nodes.map(({ e, p }) => {
    const r = (symbolSize(e) / 2) * p.f + 3;
    return { id: e.id, x1: p.x - r, y1: p.y - r, x2: p.x + r, y2: p.y + r };
  });
  const labels: Array<{ id: NodeId; x: number; y: number; anchor: 'start' | 'end' | 'middle'; text: string; strong: boolean }> = [];
  for (const { e, p } of [...nodes].reverse()) {
    const v = nodeVisual[e.id] ?? 'idle';
    const inPlay = v === 'cited' || v === 'seed' || (tracing && v === 'traversed');
    const wanted = hood ? !!hood[e.id] : inPlay || (hubs.has(e.id) && near(p.depth) > 0.35);
    if (!wanted) continue;
    const r = (symbolSize(e) / 2) * p.f;
    const n = citation[e.id];
    const text = n ? `${n} ${e.name}` : e.name;
    const width = text.length * LABEL_FONT * 0.56;
    // Cuatro sitios, como en la lámina: derecha, izquierda, debajo y encima. Lo citado y el foco se rotulan siempre.
    const options = [
      { x: p.x + r + 6, y: p.y + 4, anchor: 'start' as const },
      { x: p.x - r - 6, y: p.y + 4, anchor: 'end' as const },
      { x: p.x, y: p.y + r + 16, anchor: 'middle' as const },
      { x: p.x, y: p.y - r - 8, anchor: 'middle' as const },
    ].map((o) => {
      const x1 = o.anchor === 'start' ? o.x - 2 : o.anchor === 'end' ? o.x - width - 2 : o.x - width / 2 - 2;
      return { ...o, rect: { id: null, x1, y1: o.y - 12, x2: x1 + width + 4, y2: o.y + 4 } as Box };
    });
    const free = options.find((o) => !placed.some((q) => q.id !== e.id && o.rect.x1 < q.x2 && q.x1 < o.rect.x2 && o.rect.y1 < q.y2 && q.y1 < o.rect.y2));
    const forced = v === 'cited' || v === 'seed' || (hood !== null && e.id === focus);
    const chosen = free ?? (forced ? options[0] : undefined);
    if (!chosen) continue;
    placed.push(chosen.rect);
    labels.push({ id: e.id, x: chosen.x, y: chosen.y, anchor: chosen.anchor, text, strong: e.id === focus || v === 'cited' });
  }

  const onDown = (ev: PointerEvent<HTMLDivElement>) => {
    if ((ev.target as Element).closest('button')) return;
    // Sin capturar todavía: si no se arrastra, el clic tiene que llegar al nodo.
    drag.current = { x: ev.clientX, y: ev.clientY, moved: 0, captured: false };
  };
  const onMove = (ev: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (ev.buttons === 0) {
      drag.current = null;
      return;
    }
    const dx = ev.clientX - d.x;
    const dy = ev.clientY - d.y;
    d.x = ev.clientX;
    d.y = ev.clientY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    if (!d.captured && d.moved > 3) {
      ev.currentTarget.setPointerCapture(ev.pointerId);
      d.captured = true;
    }
    setAngle((a) => ({ yaw: a.yaw + dx * 0.008, pitch: Math.max(-1.3, Math.min(1.3, a.pitch + dy * 0.008)) }));
  };
  const onUp = () => {
    // Un arrastre deja de contar como clic en lo que haya debajo.
    setTimeout(() => (drag.current = null), 0);
  };
  const onWheel = (ev: WheelEvent<HTMLDivElement>) => {
    if (!ev.ctrlKey) return;
    ev.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(2.4, z * (ev.deltaY < 0 ? 1.1 : 0.9))));
  };
  const onKey = (ev: KeyboardEvent<HTMLDivElement>) => {
    const step = 0.15;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => setAngle((a) => ({ ...a, yaw: a.yaw - step })),
      ArrowRight: () => setAngle((a) => ({ ...a, yaw: a.yaw + step })),
      ArrowUp: () => setAngle((a) => ({ ...a, pitch: Math.max(-1.3, a.pitch - step) })),
      ArrowDown: () => setAngle((a) => ({ ...a, pitch: Math.min(1.3, a.pitch + step) })),
      '+': () => setZoom((z) => Math.min(2.4, z * 1.15)),
      '-': () => setZoom((z) => Math.max(0.5, z / 1.15)),
      ' ': () => setSpin((s) => !s),
    };
    const run = moves[ev.key];
    if (!run) return;
    ev.preventDefault();
    run();
  };
  const tool =
    'grid size-8 place-items-center border-l border-line-strong text-ink-2 first:border-l-0 hover:bg-paper-2 hover:text-ink';

  return (
    <div
      ref={box}
      data-graph3d=""
      role="application"
      aria-roledescription="vista 3D"
      aria-label="Grafo en 3D. Arrastra o usa las flechas para girarlo, más y menos para acercar, espacio para parar el giro. Para recorrer los nodos con el teclado, usa la lámina o la lista."
      tabIndex={0}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onWheel={onWheel}
      onKeyDown={onKey}
      onClick={(ev) => {
        // Un clic en el vacío (no en un nodo ni tras arrastrar) suelta la selección, como en la lámina.
        if ((drag.current?.moved ?? 0) > 4) return;
        if (ev.target === canvas.current || ev.target === ev.currentTarget) select(null);
      }}
      className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing focus-visible:outline-offset-[-2px]"
    >
      {w > 0 && (
        <svg ref={canvas} width={w} height={h} className="absolute inset-0" aria-hidden="true">
          <g fill="none" stroke="var(--color-ink)" strokeOpacity={0.12} strokeDasharray="3 4">
            <polyline points={ring('y', angle.yaw, angle.pitch, cx, cy, scale)} />
            <polyline points={ring('x', angle.yaw, angle.pitch, cx, cy, scale)} />
          </g>
          {edges.map(({ r, a, b }) => {
            const v = edgeVisual[r.id] ?? 'idle';
            const touched = focus !== null && (r.source === focus || r.target === focus);
            const away = hood !== null && !touched;
            const band = v === 'cited' || (tracing && v === 'traversed');
            const depth = near((a.depth + b.depth) / 2);
            const opacity = away ? 0.05 : v === 'cited' || v === 'traversed' || touched ? 1 : v === 'dim' ? 0.14 : 0.32 + 0.4 * depth;
            return (
              <g key={r.id}>
                {band && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-markup)" strokeWidth={7 * ((a.f + b.f) / 2)} opacity={away ? 0.25 : 1} />}
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={band ? 'var(--color-on-markup)' : 'var(--color-ink)'}
                  strokeOpacity={opacity}
                  strokeWidth={touched || v === 'cited' ? 1.6 : 1}
                  strokeDasharray={v === 'traversed' ? '4 3' : undefined}
                />
              </g>
            );
          })}
          {nodes.map(({ e, p }) => {
            const v = nodeVisual[e.id] ?? 'idle';
            const visited = v === 'seed' || v === 'traversed' || v === 'cited';
            const lit = v === 'cited' || (tracing && visited);
            const away = hood !== null && !hood[e.id];
            const s = symbolSize(e) * p.f * Math.max(0.8, Math.min(1.4, zoom));
            const r = s / 2;
            const ring = lit ? 'var(--color-on-markup)' : 'var(--color-ink)';
            const fade = away ? 0.14 : v === 'dim' ? 0.45 : 0.7 + 0.3 * near(p.depth);
            return (
              <g
                key={e.id}
                transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                opacity={fade}
                className="cursor-pointer"
                onPointerEnter={() => setFocus(e.id)}
                onPointerLeave={() => setFocus(null)}
                onClick={() => {
                  if ((drag.current?.moved ?? 0) > 4) return;
                  select(selected === e.id ? null : e.id);
                }}
              >
                <circle r={r + 12} fill="transparent" />
                {lit && <circle r={r + 8} fill="var(--color-markup)" />}
                {v === 'seed' && (
                  <g fill="none" stroke={ring} strokeWidth={1}>
                    <circle r={r + 4} />
                    <circle r={r + 7} />
                  </g>
                )}
                {v === 'traversed' && <circle r={r + 5} fill="none" stroke={ring} strokeWidth={1.25} strokeDasharray="2.5 2" />}
                {v === 'cited' && <circle r={r + 5} fill="none" stroke={ring} strokeWidth={2} />}
                <EntitySymbol entity={e} icon={icons[e.id]} size={s} lit={lit} />
                {e.id === focus && (
                  <g fill="var(--color-ink)">
                    {[-1, 1].flatMap((sx) => [-1, 1].map((sy) => <rect key={`${sx}${sy}`} x={sx * (r + 9) - 2} y={sy * (r + 9) - 2} width={4} height={4} />))}
                  </g>
                )}
              </g>
            );
          })}
          <g className="pointer-events-none" fontSize={LABEL_FONT} fontFamily="var(--font-sans)">
            {labels.map((l) => {
              return (
                <text
                  key={l.id}
                  x={l.x}
                  y={l.y}
                  textAnchor={l.anchor}
                  fill="var(--color-ink)"
                  stroke="var(--color-paper)"
                  strokeWidth={4}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  fontWeight={l.strong ? 600 : 500}
                >
                  {l.text}
                </text>
              );
            })}
          </g>
        </svg>
      )}
      <div className="absolute right-3 top-3 z-10 flex border border-line-strong bg-paper" onPointerDown={(ev) => ev.stopPropagation()}>
        <button type="button" className={tool} aria-label={spin ? 'Parar el giro' : 'Girar sola'} aria-pressed={spin} onClick={() => setSpin(!spin)}>
          {spin && !reduced ? <Pause size={14} weight="bold" aria-hidden="true" /> : <Play size={14} weight="bold" aria-hidden="true" />}
        </button>
        <button type="button" className={tool} aria-label="Alejar" onClick={() => setZoom((z) => Math.max(0.5, z / 1.15))}>
          <MagnifyingGlassMinus size={15} aria-hidden="true" />
        </button>
        <button type="button" className={tool} aria-label="Acercar" onClick={() => setZoom((z) => Math.min(2.4, z * 1.15))}>
          <MagnifyingGlassPlus size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={tool}
          aria-label="Volver a la vista inicial"
          onClick={() => {
            setAngle(START);
            setZoom(1);
          }}
        >
          <ArrowCounterClockwise size={15} aria-hidden="true" />
        </button>
      </div>
      <p className="caps pointer-events-none absolute right-3 top-14 text-right text-ink-3 max-sm:hidden">
        Arrastra para girar
        <br />
        Ctrl y rueda para acercar
      </p>
    </div>
  );
}
