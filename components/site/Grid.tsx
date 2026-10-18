import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

/** Lienzo de puntos fijo al fondo de toda la página, como la trama de una pizarra de grafos. */
export function BackgroundGrid() {
  return <div aria-hidden="true" className="dot-grid pointer-events-none fixed inset-0 -z-10" />;
}

/** La palabra clave de un titular, marcada en lima como una frase de evidencia. */
export function Mark({ children }: { children: ReactNode }) {
  return <span className="mark">{children}</span>;
}

/**
 * Cabecera de sección, como el encabezado de un apartado de un informe: a la izquierda el índice
 * en lima y el nombre; a la derecha, el titular en una frase con su palabra clave marcada.
 */
export function SectionHead({ id, index, label, intro, children }: { id: string; index: string; label: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <header className="grid grid-cols-4 border-t border-line-strong md:grid-cols-12">
      <div className="col-span-4 flex items-center gap-3 border-b border-line-strong px-4 py-3 md:col-span-3 md:items-start md:border-b-0 md:border-r md:p-6">
        <span className="bg-markup px-1.5 py-0.5 font-mono text-xs font-semibold tabular text-on-markup">{index}</span>
        <span className="eyebrow pt-px">{label}</span>
      </div>
      <div className="col-span-4 px-4 pb-12 pt-8 md:col-span-9 md:px-6 md:pb-20 md:pt-6">
        {/* Admite el foco por código: ahí lo deja el menú del móvil al saltar a la sección. */}
        <h2 id={id} tabIndex={-1} className="max-w-[17ch] text-[2.6rem] font-semibold leading-[1] tracking-[-0.045em] md:text-6xl lg:text-7xl">
          <Reveal>{children}</Reveal>
        </h2>
        {intro && <p className="mt-6 max-w-[56ch] text-lg leading-snug tracking-[0.005em] text-ink-2 md:text-xl">{intro}</p>}
      </div>
    </header>
  );
}
