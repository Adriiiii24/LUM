import raw from '@/evals/results/latest.json';
import type { EvalResults, PRF } from '@/lib/evals/types';
import { SectionHead } from './SectionHead';

const results = raw as EvalResults;
const pct = (n: number) => `${(n * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`;
const prf = (m: PRF) => `${pct(m.precision)} / ${pct(m.recall)} / ${pct(m.f1)}`;

const METRICS: Array<[string, string]> = [
  ['Entidades', 'precisión, exhaustividad y F1, alineando nombres y alias'],
  ['Relaciones', 'las mismas métricas, por extremos y por predicado'],
  ['Anclaje', 'proporción de citas que existen literalmente en el texto'],
  ['Esquema', 'proporción de salidas que lo cumplen'],
];

/**
 * Solo publica números que salen del banco de evals y con la referencia revisada por una
 * persona. Mientras tanto, lo dice.
 */
export function Evals() {
  const ready = results.status === 'ok' && results.runs.length > 0 && results.goldReviewed;
  return (
    <section id="evals" aria-labelledby="evals-titulo" className="border-t border-line-strong">
      <SectionHead id="evals-titulo" title="Lo que se mide" />
      <div className="grid gap-px border-t border-line bg-line lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-4 bg-paper px-5 py-6 text-[15px] leading-relaxed text-ink-2 md:px-6">
          <p className="max-w-[58ch]">
            La extracción se compara con textos anotados a mano. Se mide si salen las entidades y las relaciones correctas, si cada
            cita existe de verdad en el texto y si el esquema se cumple.
          </p>
          <p className="max-w-[58ch]">
            Las salidas del modelo se graban con el mismo código que usa la web y se puntúan en CI con un banco de pruebas en Python,
            sin volver a llamar al modelo. Así cada número se puede reproducir.
          </p>
        </div>

        {ready ? (
          <div className="overflow-x-auto bg-paper">
            <table className="w-full border-collapse text-left text-[13px]">
              <caption className="border-b border-line px-5 py-3 text-left text-xs text-ink-3">
                {results.documents} textos de referencia. Precisión, exhaustividad y F1.
              </caption>
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.08em] text-ink-3">
                  <th scope="col" className="px-5 py-2 font-normal">Configuración</th>
                  <th scope="col" className="px-5 py-2 font-normal">Entidades</th>
                  <th scope="col" className="px-5 py-2 font-normal">Relaciones</th>
                  <th scope="col" className="px-5 py-2 font-normal">Citas ancladas</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular text-ink">
                {results.runs.map((r) => (
                  <tr key={r.label} className="border-t border-line">
                    <th scope="row" className="px-5 py-2.5 font-sans font-medium">{r.label}</th>
                    <td className="px-5 py-2.5">{prf(r.entities)}</td>
                    <td className="px-5 py-2.5">{prf(r.relationsLenient)}</td>
                    <td className="px-5 py-2.5">{pct(r.grounding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-px bg-line">
            <div className="bg-paper px-5 py-6 md:px-6">
              <p className="text-2xl font-semibold uppercase tracking-[-0.01em] text-ink">Resultados pendientes</p>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
                El banco de pruebas está listo, pero los textos de referencia aún no tienen la anotación revisada a mano. Hasta entonces,
                esta sección no publica ningún número.
              </p>
            </div>
            <dl className="grid gap-px bg-line sm:grid-cols-2">
              {METRICS.map(([term, detail]) => (
                <div key={term} className="bg-paper px-5 py-3 md:px-6">
                  <dt className="text-[13px] font-semibold text-ink">{term}</dt>
                  <dd className="text-[13px] text-ink-2">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
