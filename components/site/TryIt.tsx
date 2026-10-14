import type { SampleFile } from '@/lib/sample/types';
import { SITE } from '@/lib/site';
import { Mark, SectionHead } from './Grid';
import { LinkButton } from './LinkButton';

/** Cierre antes del pie: qué cuesta probarlo y, en un bloque lima, las cifras de la muestra. */
export function TryIt({ sample }: { sample: SampleFile }) {
  const stats: Array<[number, string]> = [
    [sample.graph.entities.length, 'entidades en la muestra'],
    [sample.graph.relations.length, 'relaciones con su frase de origen'],
    [sample.replays.length, 'respuestas grabadas de Gemini'],
  ];
  return (
    <section id="probar" aria-labelledby="probar-titulo" className="pt-20 md:pt-32">
      <SectionHead id="probar-titulo" index="05" label="Pruébalo">
        Pega un texto y <Mark>compruébalo</Mark>.
      </SectionHead>
      <div className="grid border-t border-line-strong md:grid-cols-12">
        <div className="flex flex-col items-start gap-8 p-4 py-12 md:col-span-6 md:border-r md:border-line-strong md:p-6 md:py-16">
          <p className="max-w-[36ch] text-lg leading-relaxed md:text-xl">
            La muestra responde al momento y no gasta cuota. Con un texto propio, Gemini tarda entre 10 y 40 segundos en extraer el grafo.
          </p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="#herramienta" variant="primary">
              Abrir el lienzo
            </LinkButton>
            <LinkButton href={SITE.repoUrl} external>
              Ver el código
            </LinkButton>
          </div>
        </div>
        <dl className="grid bg-markup text-on-markup md:col-span-6">
          {stats.map(([n, label], i) => (
            <div key={label} className={`flex items-end justify-between gap-6 p-4 py-6 md:p-6 ${i > 0 ? 'border-t border-on-markup/25' : ''}`}>
              <dt className="caps max-w-[22ch]">{label}</dt>
              <dd className="text-7xl font-bold leading-[0.8] tabular tracking-[-0.06em] md:text-8xl">{String(n).padStart(2, '0')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
