import type { SampleFile } from '@/lib/sample/types';
import { SectionHead } from './SectionHead';

type Step = { title: string; body: string; artifact: string; caption: string };

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
      artifact: entity ? JSON.stringify({ name: entity.name, type: entity.type, evidence: quote }, null, 2) : '',
      caption: 'Una entidad de la muestra, tal como la devolvió el modelo.',
    },
    {
      title: 'Anclar',
      body: 'Cada cita se busca en el texto original. Si no aparece, la entidad queda marcada como sin anclaje y se ve.',
      artifact: entity?.evidence ? `«${quote}»\n→ caracteres ${entity.evidence.start} a ${entity.evidence.end}` : 'Sin anclaje',
      caption: `${anchored} de ${graph.entities.length} entidades ancladas en la muestra.`,
    },
    {
      title: 'Recorrer',
      body: 'El recuperador parte de lo que nombra la pregunta y salta por las relaciones que tocan su intención. Es un algoritmo, sin modelo, y la lámina lo dibuja paso a paso.',
      artifact: steps
        .map((s) => (s.kind === 'seed' ? `S  ${s.nodes.map(name).join(', ')}` : `${s.step}  +${s.nodes.length} por ${s.reason.split(' por ')[1] ?? ''}`))
        .join('\n'),
      caption: replay ? `Recorrido de «${replay.question}»` : '',
    },
    {
      title: 'Citar',
      body: 'Gemini responde solo con lo recorrido y cita cada afirmación con el id de su entidad. Cada cita enciende su nodo según se escribe.',
      artifact: firstSentence,
      caption: 'La respuesta grabada, en crudo, antes de convertir las citas en notas.',
    },
  ];
}

export function HowItWorks({ sample }: { sample: SampleFile }) {
  const steps = stepsFrom(sample);
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="scroll-mt-4">
      <SectionHead id="como-funciona-titulo" title="Cómo funciona">
        <p className="mt-5 max-w-[60ch] text-lg leading-snug text-ink-2">
          Cuatro pasos. Los dos centrales no usan ningún modelo, y por eso lo que se ilumina en la lámina se puede comprobar.
        </p>
      </SectionHead>
      {/* Subrejilla: los artefactos de las cuatro celdas empiezan a la misma altura. */}
      <ol className="grid gap-px border-t border-line bg-line md:grid-cols-2 xl:grid-cols-4">
        {steps.map((s) => (
          <li key={s.title} className="grid grid-rows-[auto_1fr] bg-paper md:row-span-2 md:grid-rows-subgrid md:gap-0">
            <div className="px-5 py-5">
              <h3 className="text-[15px] font-semibold uppercase tracking-[0.02em] text-ink">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{s.body}</p>
            </div>
            <figure className="flex flex-col border-t border-line bg-paper-2 px-5 py-4">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-ink">{s.artifact}</pre>
              <figcaption className="mt-auto pt-3 text-xs text-ink-3">{s.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}
