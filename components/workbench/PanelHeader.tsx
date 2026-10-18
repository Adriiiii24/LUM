import type { ReactNode } from 'react';

/**
 * Banda de cabecera de cada celda: título en versal espaciada, dato en mono y herramientas.
 * El título es un h3 (las celdas viven dentro de la sección del lienzo) y admite el foco por
 * código: ahí vuelve el foco cuando desaparece el control que lo tenía.
 */
export function PanelHeader({ id, title, meta, children }: { id: string; title: string; meta?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b border-line-strong bg-paper pl-3 pr-1.5 md:pl-4">
      <h3 id={id} tabIndex={-1} className="eyebrow text-ink">
        {title}
      </h3>
      {meta !== undefined && <p className="min-w-0 truncate font-mono text-[11px] tabular text-ink-3 max-sm:hidden">{meta}</p>}
      <div className="ml-auto flex shrink-0 items-center gap-0.5">{children}</div>
    </div>
  );
}
