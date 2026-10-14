import { SITE } from '@/lib/site';
import { IntroVideo } from './IntroVideo';
import { LinkButton } from './LinkButton';
import { Mark } from './Grid';
import { Wordmark } from './Wordmark';

/**
 * Portada en dos columnas: a la izquierda la marca, la promesa con su palabra marcada en lima y
 * las acciones; a la derecha, el vídeo de introducción entero (sin recortar sus lados cuando la
 * columna es más alta que el vídeo: el hueco lleva la misma trama).
 */
export function Hero() {
  return (
    <section id="inicio" aria-labelledby="marca" className="grid grid-cols-4 border-b border-line-strong md:min-h-[calc(100svh-4rem)] md:grid-cols-12">
      <div className="col-span-4 flex flex-col justify-between gap-12 px-4 py-8 md:col-span-5 md:border-r md:border-line-strong md:px-6 md:py-10 lg:px-8">
        <div>
          <p className="caps flex items-center gap-2 text-ink-2">
            <span aria-hidden="true" className="inline-block size-2 rounded-full bg-markup ring-1 ring-ink" />
            Grafos de conocimiento con recuperación visible
          </p>
          <h1 id="marca" className="mt-6 text-[clamp(5.5rem,15vw,12.5rem)] font-bold leading-[0.82] tracking-[-0.075em]">
            <Wordmark animated />
          </h1>
        </div>
        <div>
          <p className="max-w-[15ch] text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
            Lo que se ilumina es <Mark>verdad</Mark>.
          </p>
          <p className="mt-5 max-w-[42ch] text-lg leading-snug text-ink-2">{SITE.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <LinkButton href="#herramienta" variant="primary">
              Probar la muestra
            </LinkButton>
            <LinkButton href="#como-funciona">Cómo funciona</LinkButton>
          </div>
        </div>
        <p className="caps text-ink-3">Muestra grabada · sin cuota · sin clave</p>
      </div>
      <div className="@container relative col-span-4 aspect-video overflow-hidden border-t border-line-strong md:col-span-7 md:aspect-auto md:border-t-0">
        <IntroVideo />
      </div>
    </section>
  );
}
