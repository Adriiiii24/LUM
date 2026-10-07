import type { ReactNode } from 'react';

/** Banda de título de cada sección de la segunda lámina: el título manda, sin etiquetas encima. */
export function SectionHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="px-5 pb-8 pt-16 md:px-6 md:pt-20">
      <h2 id={id} className="text-4xl font-semibold uppercase leading-none tracking-[-0.02em] text-ink md:text-6xl">
        {title}
      </h2>
      {children}
    </div>
  );
}
