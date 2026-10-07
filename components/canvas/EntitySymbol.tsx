import type { EntityType } from '@/lib/graph/schema';

export const TYPE_LABEL: Record<EntityType, string> = {
  persona: 'Persona',
  organizacion: 'Organización',
  lugar: 'Lugar',
  artefacto: 'Artefacto',
  concepto: 'Concepto',
  evento: 'Evento',
  otro: 'Otro',
};

/**
 * Símbolo de tipo, dibujado en tinta y centrado en (0, 0). El tipo se distingue por la forma,
 * nunca por el color: llenos para lo concreto (persona, organización, lugar, evento),
 * huecos para lo construido o abstracto (artefacto, concepto) y una cruz para el resto.
 */
export function EntitySymbol({ type, size, opacity = 1 }: { type: EntityType; size: number; opacity?: number }) {
  const h = size / 2;
  const ink = 'var(--color-ink)';
  const common = { fill: ink, fillOpacity: opacity } as const;
  const hollow = { fill: 'var(--color-paper)', stroke: ink, strokeOpacity: opacity, strokeWidth: 1.5 } as const;
  switch (type) {
    case 'persona':
      return <circle r={h} {...common} />;
    case 'organizacion':
      return <rect x={-h * 0.92} y={-h * 0.92} width={h * 1.84} height={h * 1.84} {...common} />;
    case 'lugar':
      return <polygon points={`0,${-h * 1.12} ${h * 1.05},${h * 0.8} ${-h * 1.05},${h * 0.8}`} {...common} />;
    case 'evento':
      return <polygon points={`0,${-h * 1.2} ${h * 1.2},0 0,${h * 1.2} ${-h * 1.2},0`} {...common} />;
    case 'artefacto':
      return <rect x={-h * 0.82} y={-h * 0.82} width={h * 1.64} height={h * 1.64} {...hollow} />;
    case 'concepto':
      return <circle r={h * 0.86} {...hollow} />;
    case 'otro':
      return (
        <g stroke={ink} strokeOpacity={opacity} strokeWidth={1.75} strokeLinecap="square">
          <line x1={-h} y1={0} x2={h} y2={0} />
          <line x1={0} y1={-h} x2={0} y2={h} />
        </g>
      );
  }
}

/** El símbolo suelto, para la leyenda, la lista y la ficha. */
export function SymbolGlyph({ type, size = 11, className }: { type: EntityType; size?: number; className?: string }) {
  const box = size + 6;
  return (
    <svg width={box} height={box} viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`} className={className} aria-hidden="true">
      <EntitySymbol type={type} size={size} />
    </svg>
  );
}
