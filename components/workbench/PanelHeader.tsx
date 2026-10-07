import type { ReactNode } from 'react';

/** Banda de cabecera de cada celda de la lámina: título, dato en mono y herramientas. */
export function PanelHeader({ id, title, meta, children }: { id: string; title: string; meta?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b border-line bg-paper-2 pl-3 pr-1.5">
      <h2 id={id} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
        {title}
      </h2>
      {meta !== undefined && <p className="min-w-0 truncate font-mono text-[11px] tabular text-ink-3 max-sm:hidden">{meta}</p>}
      <div className="ml-auto flex shrink-0 items-center gap-0.5">{children}</div>
    </div>
  );
}
