'use client';
import { useId, useState } from 'react';
import { CaretDown, CaretUp } from '@phosphor-icons/react/dist/ssr';
import { ENTITY_TYPES } from '@/lib/graph/schema';
import { SymbolGlyph, TYPE_LABEL } from './EntitySymbol';

/** Muestra de anillo para la leyenda: la misma geometría que en los nodos; en reposo solo lo citado lleva lima. */
function RingSample({ kind }: { kind: 'seed' | 'traversed' | 'cited' }) {
  return (
    <svg width={26} height={26} viewBox="-13 -13 26 26" aria-hidden="true">
      {kind === 'cited' && <circle r={12} fill="var(--color-markup)" />}
      {kind === 'seed' && (
        <g fill="none" stroke="var(--color-ink)" strokeWidth={1}>
          <circle r={7} />
          <circle r={10} />
        </g>
      )}
      {kind === 'traversed' && <circle r={8.5} fill="none" stroke="var(--color-ink)" strokeWidth={1.25} strokeDasharray="2.5 2" />}
      {kind === 'cited' && <circle r={8.5} fill="none" stroke="var(--color-ink)" strokeWidth={2} />}
      <circle r={3.5} fill="var(--color-ink)" />
    </svg>
  );
}

/**
 * Leyenda plegada por defecto para no tapar el grafo; se despliega hacia arriba sobre la lámina.
 * Existe en todos los anchos: sin ella, los símbolos y los anillos no se explican.
 */
export function Legend() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <section aria-label="Leyenda" className="pointer-events-auto relative">
      {open && (
        <div id={panelId} className="absolute bottom-full left-0 mb-1 w-[17.5rem] border border-line-strong bg-paper px-2 pb-2 pt-1.5 shadow-float">
          <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-ink-2">
            {ENTITY_TYPES.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <SymbolGlyph type={t} size={9} />
                {TYPE_LABEL[t]}
              </li>
            ))}
          </ul>
          <ul className="mt-2 grid grid-cols-3 gap-1 border-t border-line pt-2 text-[11px] leading-tight text-ink-2">
            <li className="flex flex-col items-start gap-0.5">
              <RingSample kind="seed" />
              Semilla
            </li>
            <li className="flex flex-col items-start gap-0.5">
              <RingSample kind="traversed" />
              Recorrida
            </li>
            <li className="flex flex-col items-start gap-0.5">
              <RingSample kind="cited" />
              Citada
            </li>
          </ul>
          <p className="mt-2 border-t border-line pt-1.5 text-[11px] leading-snug text-ink-3">
            En lima: lo visitado mientras se recorre y, al terminar, solo lo citado. Tamaño: conexiones. Zoom: Ctrl y rueda.
          </p>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-1.5 border border-line-strong bg-paper px-2.5 text-[10px] uppercase tracking-[0.08em] text-ink-2 hover:bg-paper-2 hover:text-ink"
      >
        Leyenda
        {open ? <CaretDown size={11} weight="bold" aria-hidden="true" /> : <CaretUp size={11} weight="bold" aria-hidden="true" />}
      </button>
    </section>
  );
}
