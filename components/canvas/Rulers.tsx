'use client';
import { ViewportPortal, useStore as useFlowStore } from '@xyflow/react';
import { ZONE_COLUMNS, ZONE_ROWS, type Zones } from '@/lib/graph/layout';

export const RULER = 20;

/**
 * Reglas de la lámina, como el borde de un plano: columnas A-H y filas 1-6 sobre el espacio
 * del layout. Siguen el pan y el zoom, así que la zona que dice la lista de entidades es la
 * que se ve aquí.
 */
export function Rulers({ zones }: { zones: Zones }) {
  const [tx, ty, zoom] = useFlowStore((s) => s.transform);
  const col = (i: number) => zones.x0 * zoom + tx + (i + 0.5) * zones.cellW * zoom;
  const row = (i: number) => zones.y0 * zoom + ty + (i + 0.5) * zones.cellH * zoom;
  const tick = 'absolute bg-ink/40';

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden font-mono text-[10px] text-ink-3">
      <div className="absolute inset-x-0 top-0 border-b border-line bg-paper" style={{ height: RULER }}>
        {ZONE_COLUMNS.map((letter, i) => (
          <span key={letter} className="absolute top-0 -translate-x-1/2 leading-5" style={{ left: col(i) }}>
            {letter}
          </span>
        ))}
        {Array.from({ length: ZONE_COLUMNS.length + 1 }, (_, i) => (
          <span key={i} className={tick} style={{ left: zones.x0 * zoom + tx + i * zones.cellW * zoom, bottom: 0, width: 1, height: 5 }} />
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 border-r border-line bg-paper" style={{ width: RULER }}>
        {Array.from({ length: ZONE_ROWS }, (_, i) => (
          <span key={i} className="absolute left-0 w-full -translate-y-1/2 text-center leading-none" style={{ top: row(i) }}>
            {i + 1}
          </span>
        ))}
        {Array.from({ length: ZONE_ROWS + 1 }, (_, i) => (
          <span key={i} className={tick} style={{ top: zones.y0 * zoom + ty + i * zones.cellH * zoom, right: 0, height: 1, width: 5 }} />
        ))}
      </div>
      <div className="absolute left-0 top-0 border-b border-r border-line bg-paper" style={{ width: RULER, height: RULER }} />
    </div>
  );
}

/** Retícula de zonas dentro de la lámina: filetes muy tenues que se mueven con el grafo. */
export function ZoneGrid({ zones }: { zones: Zones }) {
  const width = zones.cellW * ZONE_COLUMNS.length;
  const height = zones.cellH * ZONE_ROWS;
  return (
    <ViewportPortal>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute overflow-visible"
        style={{ left: zones.x0, top: zones.y0, width, height }}
        width={width}
        height={height}
      >
        <g stroke="var(--color-ink)" strokeOpacity={0.08} vectorEffect="non-scaling-stroke">
          {Array.from({ length: ZONE_COLUMNS.length + 1 }, (_, i) => (
            <line key={`c${i}`} x1={i * zones.cellW} y1={0} x2={i * zones.cellW} y2={height} vectorEffect="non-scaling-stroke" />
          ))}
          {Array.from({ length: ZONE_ROWS + 1 }, (_, i) => (
            <line key={`r${i}`} x1={0} y1={i * zones.cellH} x2={width} y2={i * zones.cellH} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
    </ViewportPortal>
  );
}
