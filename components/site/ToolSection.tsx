import { ChatCircleText, ClipboardText, Path } from '@phosphor-icons/react/dist/ssr';
import { Workbench } from '@/components/workbench/Workbench';
import { Mark, SectionHead } from './Grid';

const HOW = [
  { Icon: ChatCircleText, title: 'Pregunta a la muestra', body: 'Tres preguntas grabadas sobre el Apolo 11. Responden al momento y no gastan cuota.' },
  { Icon: ClipboardText, title: 'Pega tu texto', body: 'Hasta 12.000 caracteres, o suelta un .txt o un .md. Gemini lo convierte en grafo en 10 a 40 segundos.' },
  { Icon: Path, title: 'Sigue el recorrido', body: 'En lima, lo que el recuperador visita mientras recorre. Al terminar, solo queda lo que la respuesta cita. También en 3D.' },
];

/** El lienzo: cómo se usa en tres pasos y la herramienta a sangre, con la altura de la ventana. */
export function ToolSection() {
  return (
    <section id="lienzo" aria-labelledby="lienzo-titulo" className="pt-20 md:pt-32">
      <SectionHead id="lienzo-titulo" index="01" label="Lienzo">
        Pregunta y mira qué se <Mark>ilumina</Mark>.
      </SectionHead>
      <ol className="grid border-t border-line-strong md:grid-cols-3">
        {HOW.map(({ Icon, title, body }, i) => (
          <li key={title} className={`flex gap-4 p-4 py-6 md:p-6 ${i > 0 ? 'border-t border-line-strong md:border-l md:border-t-0' : ''}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink">
              <Icon size={18} weight="bold" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.02em] md:text-xl">{title}</h3>
              <p className="mt-1.5 max-w-[42ch] text-[15px] leading-relaxed text-ink-2">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div id="herramienta" className="border-y border-line-strong">
        <Workbench />
      </div>
    </section>
  );
}
