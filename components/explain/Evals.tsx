import raw from '@/evals/results/latest.json';
import type { EvalResults, EvalRun } from '@/lib/evals/types';
import { SITE } from '@/lib/site';
import { Mark, SectionHead } from '@/components/site/Grid';
import { LinkButton } from '@/components/site/LinkButton';

const results = raw as EvalResults;
const pct = (n: number) => `${(n * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`;

const METRICS: Array<{ name: string; detail: string; tags: string[]; value: (r: EvalRun) => number }> = [
  {
    name: 'Entidades',
    detail: 'Si salen las entidades correctas: se alinean nombres y alias con la anotación hecha a mano.',
    tags: ['precisión', 'exhaustividad', 'F1'],
    value: (r) => r.entities.f1,
  },
  {
    name: 'Relaciones',
    detail: 'Las mismas métricas para las relaciones, comparando los dos extremos y el predicado.',
    tags: ['extremos', 'predicado', 'F1'],
    value: (r) => r.relationsLenient.f1,
  },
  {
    name: 'Anclaje',
    detail: 'Qué proporción de las citas que devuelve el modelo existe literalmente en el texto de origen.',
    tags: ['citas literales', 'texto de origen'],
    value: (r) => r.grounding,
  },
  {
    name: 'Esquema',
    detail: 'Qué proporción de las salidas del modelo cumple el esquema Zod sin retoques.',
    tags: ['Zod', 'validez'],
    value: (r) => r.schemaValid,
  },
];

/**
 * Solo publica números que salen del banco de evals y con la referencia revisada por una
 * persona. Mientras tanto, lo dice: a la izquierda en qué punto está el banco; a la derecha, las
 * cuatro métricas con su hueco.
 */
export function Evals() {
  const ready = results.status === 'ok' && results.runs.length > 0 && results.goldReviewed;
  const reviewed = results.goldReviewed ? results.documents : 0;
  const facts: Array<[string, string]> = [
    [String(results.documents).padStart(2, '0'), 'textos de referencia, escritos para el banco'],
    [String(reviewed).padStart(2, '0'), 'revisados a mano: hasta entonces no se publica ningún número'],
    ['CI', 'puntúa salidas grabadas con el mismo código de la web, sin volver a llamar al modelo'],
  ];

  return (
    <section id="evals" aria-labelledby="evals-titulo" className="pt-20 md:pt-32">
      <SectionHead
        id="evals-titulo"
        index="03"
        label="Lo que se mide"
        intro="La extracción se compara con textos anotados a mano y se puntúa en CI con un banco de pruebas en Python. Cada número se podrá reproducir."
      >
        La calidad se <Mark>mide</Mark>, no se afirma.
      </SectionHead>
      <div className="grid border-t border-line-strong md:grid-cols-12">
        <aside aria-label="Estado del banco" className="flex flex-col gap-8 border-b border-line-strong p-4 py-8 md:col-span-4 md:border-b-0 md:border-r md:p-6 lg:col-span-3">
          <p className="eyebrow">Estado del banco</p>
          <dl className="grid gap-6">
            {facts.map(([n, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-6xl font-bold leading-[0.85] tabular tracking-[-0.06em]">{n}</dd>
                <dd className="caps mt-2 max-w-[30ch] text-ink-3">{label}</dd>
              </div>
            ))}
          </dl>
          <LinkButton href={`${SITE.repoUrl}/tree/main/evals`} external className="mt-auto self-start">
            Ver el banco
          </LinkButton>
        </aside>
        <ul className="grid sm:grid-cols-2 md:col-span-8 lg:col-span-9">
          {METRICS.map((m, i) => (
            <li
              key={m.name}
              className={`flex flex-col gap-4 border-line-strong p-4 py-8 md:p-6 ${i < 2 ? 'border-b' : 'max-sm:border-b'} ${i % 2 === 0 ? 'sm:border-r' : ''}`}
            >
              <span aria-hidden="true" className="h-1.5 w-12 bg-markup" />
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">{m.name}</h3>
                <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="max-w-[44ch] text-[15px] leading-relaxed text-ink-2">{m.detail}</p>
              <ul aria-label="Qué mide" className="flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <li key={t} className="caps border border-line-strong px-2 py-0.5">
                    {t}
                  </li>
                ))}
              </ul>
              {ready ? (
                <dl className="mt-auto grid gap-1">
                  {results.runs.map((r) => (
                    <div key={r.label} className="flex items-baseline justify-between gap-4 border-t border-line-strong pt-2">
                      <dt className="font-mono text-xs text-ink-2">{r.label}</dt>
                      <dd className="text-3xl font-bold tabular tracking-[-0.05em]">{pct(m.value(r))}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="mt-auto flex items-end justify-between gap-4 border-t border-line-strong pt-4">
                  <p className="text-5xl font-bold leading-[0.85] tracking-[-0.06em]">
                    <span aria-hidden="true">— %</span>
                    <span className="sr-only">Sin número publicado</span>
                  </p>
                  <p className="caps max-w-[16ch] text-right text-ink-3">pendiente de revisión humana</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
