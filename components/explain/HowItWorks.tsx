import type { SampleFile } from '@/lib/sample/types';
import { Anchor, FileText, Path, Quotes } from '@phosphor-icons/react/dist/ssr';
import { Mark, SectionHead } from '@/components/site/Grid';

type Step = { title: string; body: string; tags: string[]; artifact: string; caption: string };

/** Los artefactos salen de la muestra grabada: nada de lo que se enseña aquí está inventado. */
function stepsFrom(sample: SampleFile): Step[] {
  const { graph, text } = sample;
  const entity =
    graph.entities.find((e) => e.type === 'persona' && e.evidence && e.degree >= 2) ??
    graph.entities.find((e) => e.evidence) ??
    graph.entities[0];
  const quote = entity?.evidence ? text.slice(entity.evidence.start, entity.evidence.end) : '';
  const replay = sample.replays[0];
  const steps = replay?.chunks.flatMap((c) => (c.chunk.type === 'data-trace' ? [c.chunk.data] : [])) ?? [];
  const answer = replay?.chunks.flatMap((c) => (c.chunk.type === 'text-delta' ? [c.chunk.delta] : [])).join('') ?? '';
  const name = (id: string) => graph.entities.find((e) => e.id === id)?.name ?? id;
  const firstSentence = answer.split(/(?<=\.)\s/)[0] ?? answer;
  // `evidence` es la posición confirmada en el texto (null si la cita no aparece): cuenta anclajes, no citas.
  const anchored = graph.entities.filter((e) => e.evidence).length;

  return [
    {
      title: 'Extraer',
      body: 'Gemini lee el texto y devuelve entidades y relaciones con un esquema Zod estricto. Cada una trae la frase que la justifica.',
      tags: [graph.meta.model, 'salida estructurada', 'esquema Zod', 'lib/graph/schema.ts'],
      artifact: entity ? JSON.stringify({ name: entity.name, type: entity.type, evidence: quote }, null, 2) : '',
      caption: 'Una entidad de la muestra, tal como la devolvió el modelo.',
    },
    {
      title: 'Anclar',
      body: 'Cada cita se busca en el texto original. Si no aparece, la entidad queda marcada como sin anclaje y se ve.',
      tags: ['sin modelo', 'tolera espacios y comillas', 'lib/graph/normalize.ts'],
      artifact: entity?.evidence ? `«${quote}»\n→ caracteres ${entity.evidence.start} a ${entity.evidence.end}` : 'Sin anclaje',
      caption: `${anchored} de ${graph.entities.length} entidades ancladas en la muestra.`,
    },
    {
      title: 'Recorrer',
      body: 'El recuperador parte de lo que nombra la pregunta y salta por las relaciones que tocan su intención. Es un algoritmo, sin modelo, y la lámina lo dibuja paso a paso.',
      tags: ['sin modelo', 'hasta dos saltos', 'determinista', 'lib/graph/retrieve.ts'],
      artifact: steps
        .map((s) => (s.kind === 'seed' ? `S  ${s.nodes.map(name).join(', ')}` : `${s.step}  +${s.nodes.length} por ${s.reason.split(' por ')[1] ?? ''}`))
        .join('\n'),
      caption: replay ? `Recorrido de «${replay.question}»` : '',
    },
    {
      title: 'Citar',
      body: 'Gemini responde solo con lo recorrido y cita cada afirmación con el id de su entidad. Cada cita enciende su nodo según se escribe.',
      tags: ['una llamada por pregunta', 'streaming', 'lib/chat/citations.ts'],
      artifact: firstSentence,
      caption: 'La respuesta grabada, en crudo, antes de convertir las citas en notas.',
    },
  ];
}

const ICONS = [FileText, Anchor, Path, Quotes];

/**
 * El pipeline en cuatro columnas unidas por una línea, como los nodos de un recorrido: al pasar
 * por un paso, su nodo se enciende en lima. Cada paso enseña su artefacto real de la muestra.
 */
export function HowItWorks({ sample }: { sample: SampleFile }) {
  const steps = stepsFrom(sample);
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="pt-20 md:pt-32">
      <SectionHead
        id="como-funciona-titulo"
        index="02"
        label="Cómo funciona"
        intro="Los dos pasos centrales no usan ningún modelo, y por eso lo que se ilumina en la lámina se puede comprobar."
      >
        Cuatro pasos. Dos, <Mark>sin modelo</Mark>.
      </SectionHead>
      <ol className="grid border-t border-line-strong md:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => {
          const Icon = ICONS[i] ?? FileText;
          return (
            <li key={s.title} className="group flex flex-col border-b border-line-strong md:odd:border-r xl:border-r xl:last:border-r-0">
              <div className="relative flex items-center px-4 pt-8 md:px-6">
                <span aria-hidden="true" className="absolute inset-x-0 top-[calc(2rem+1.375rem)] h-px bg-line-strong transition-colors group-hover:h-[3px] group-hover:bg-markup" />
                <span className="relative grid size-11 place-items-center rounded-full border-2 border-ink bg-paper transition-colors duration-300 group-hover:bg-markup group-hover:text-on-markup">
                  <Icon size={20} weight="bold" aria-hidden="true" />
                </span>
                <span className="relative ml-3 bg-paper px-1.5 font-mono text-xs tabular text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="px-4 pt-5 md:px-6">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">{s.title}</h3>
                <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <li key={t} className={`border border-line-strong px-2 py-0.5 ${t.includes('/') ? 'font-mono text-[11px]' : 'caps'}`}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <figure className="m-4 mt-6 flex flex-1 flex-col border border-line-strong bg-paper-2 p-3 md:m-6">
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-ink">{s.artifact}</pre>
                <figcaption className="caps mt-auto pt-3 text-ink-3">{s.caption}</figcaption>
              </figure>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
