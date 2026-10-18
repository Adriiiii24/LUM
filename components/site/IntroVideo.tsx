'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { CaretDown, CaretUp, Pause, Play } from '@phosphor-icons/react/dist/ssr';
import { useTheme } from '@/lib/theme';

/**
 * Lo que enseña el vídeo, en texto (WCAG 1.2.1): no tiene sonido, pero sí texto en pantalla.
 * Sale de la composición de Remotion (video/src: timeline.ts, scenes/ y data.ts, que lee la
 * muestra grabada). Si se vuelve a renderizar el vídeo con otra muestra, hay que actualizarlo.
 */
const TRANSCRIPT: Array<{ at: string; body: ReactNode }> = [
  {
    at: '0:00',
    body: (
      <>
        Portada: «Grafos de conocimiento con recuperación visible», la marca «lum» con un nodo lima por punto y la frase «Lo que se
        ilumina es verdad», con «verdad» marcada en lima.
      </>
    ),
  },
  {
    at: '0:03',
    body: (
      <>
        <strong className="font-semibold text-ink">01 Texto. Parte de un texto.</strong> Las dos primeras frases del artículo del Apolo 11:
        <blockquote className="my-1.5 border-l border-ink pl-2 text-ink">
          El Apolo 11 (16 de julio - 24 de julio de 1969) fue la misión espacial estadounidense que logró el primer alunizaje de seres
          humanos en la Luna, así como el quinto vuelo tripulado del programa Apolo de la NASA. La tripulación estaba integrada por el
          comandante Neil Armstrong, el piloto del módulo de mando Michael Collins y el piloto del módulo lunar Edwin «Buzz» Aldrin;
        </blockquote>
        Se marcan en lima, una a una, las nueve entidades que nombran (Apolo 11, Luna, programa Apolo, NASA, Neil Armstrong, módulo de
        mando, Michael Collins, módulo lunar y Edwin «Buzz» Aldrin), y el contador «Entidades» llega a 09 «en estas dos frases».
      </>
    ),
  },
  {
    at: '0:07',
    body: (
      <>
        <strong className="font-semibold text-ink">02 Grafo. Se vuelve un grafo.</strong> Se dibujan las 26 entidades y las 33 relaciones de la
        muestra, con sus nombres. Al lado: 26 entidades, 33 relaciones, el modelo gemini-3.5-flash y «salida estructurada».
      </>
    ),
  },
  {
    at: '0:11',
    body: (
      <>
        <strong className="font-semibold text-ink">03 Recorrido. Una pregunta lo recorre.</strong> Se escribe la pregunta «¿Quién pisó primero
        la Luna y desde qué nave descendió?».
      </>
    ),
  },
  {
    at: '0:13',
    body: (
      <>
        El recorrido, «sin modelo · en lima lo visitado»: la semilla, Luna; el salto 1, cinco entidades más por «logró el primer alunizaje
        en»; el salto 2, diez más por «descendió en el». Cada salto enciende en lima sus entidades y aristas, y el resto del grafo se
        atenúa.
      </>
    ),
  },
  {
    at: '0:15',
    body: (
      <>
        <strong className="font-semibold text-ink">04 Cita. La respuesta cita su origen.</strong> Se escribe la respuesta, «3 citas · en lima
        solo lo citado»:
        <blockquote className="my-1.5 border-l border-ink pl-2 text-ink">
          El primer ser humano en caminar sobre la Luna fue Neil Armstrong [1] [2]. Para lograrlo, descendió a la superficie lunar desde
          el módulo lunar Eagle [3].
        </blockquote>
        Cada nota enciende su nodo al escribirse (1 Neil Armstrong, 2 Luna, 3 Eagle) y en el grafo solo quedan en lima esos tres.
      </>
    ),
  },
  {
    at: '0:19',
    body: (
      <>
        Cierre en lima: «Recuperación explicable», «Lo que se ilumina es verdad», «Recorrido real del recuperador y citas reales del
        modelo» y la marca «lum». Después vuelve a empezar.
      </>
    ),
  },
];

/**
 * Vídeo de introducción hecho con Remotion (video/) a partir de la muestra grabada. Arranca solo,
 * sin sonido y en bucle, también con movimiento reducido (decisión del 2026-10-13). Siempre hay
 * un botón para pararlo (WCAG 2.2.2). Hay un render por tema: al cambiarlo, se cambia de vídeo.
 *
 * Los navegadores solo dejan arrancar solo a un vídeo silenciado, y React no siempre escribe el
 * atributo `muted` en el HTML del servidor: se fuerza como propiedad y como atributo al montar,
 * y se pide `play()` en cuanto hay datos.
 */
export function IntroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Si la visita lo paró, sigue parado aunque cambie el tema y se monte el otro vídeo.
  const stopped = useRef(false);
  const theme = useTheme();
  const name = theme === 'dark' ? 'lum-intro-dark' : 'lum-intro';
  const [transcript, setTranscript] = useState(false);
  const transcriptId = useId();

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');
    // Parado por la visita: el atributo autoplay arrancaría el vídeo del otro tema, así que se para.
    if (stopped.current) {
      el.pause();
      return;
    }
    const start = () => {
      el.play()
        // Puede haber arrancado antes de hidratar: el evento play se perdió y el botón no lo sabía.
        .then(() => setPlaying(!el.paused))
        .catch(() => {
          // Autoplay bloqueado por el navegador: queda el póster y el botón ofrece reproducir.
        });
    };
    start();
    el.addEventListener('canplay', start, { once: true });
    return () => el.removeEventListener('canplay', start);
  }, [name]);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    stopped.current = !el.paused;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <>
      <video
        key={name}
        ref={video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={`/video/${name}-poster.jpg`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label="Introducción de 22 segundos: un texto del Apolo 11 se convierte en grafo, una pregunta lo recorre y la respuesta cita sus nodos."
        className="video-letterbox absolute inset-0 h-full w-full object-contain"
      >
        {/*
         * Primero el MP4 (H.264): es el que mejor decodifica el hardware. Si el navegador elige una
         * fuente y luego no la puede decodificar, no prueba la siguiente: el vídeo se queda parado.
         */}
        <source src={`/video/${name}.mp4`} type="video/mp4" />
        <source src={`/video/${name}.webm`} type="video/webm" />
      </video>
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
        <p className="caps bg-paper px-2.5 py-1.5 text-ink-2">
          Intro · 0:22<span className="max-sm:hidden"> · Remotion</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={transcript}
            aria-controls={transcriptId}
            onClick={() => setTranscript(!transcript)}
            className="caps flex h-9 items-center gap-1.5 border border-line-strong bg-paper px-2.5 text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
          >
            Transcripción
            {transcript ? <CaretDown size={11} weight="bold" aria-hidden="true" /> : <CaretUp size={11} weight="bold" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pausar el vídeo' : 'Reproducir el vídeo'}
            className="grid size-9 place-items-center bg-markup text-on-markup transition-colors hover:bg-ink hover:text-paper"
          >
            {playing ? <Pause size={16} weight="fill" aria-hidden="true" /> : <Play size={16} weight="fill" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {/*
       * La alternativa en texto, para cualquiera: flota sobre el vídeo desde md (con su propio
       * scroll, enfocable) y en móvil entra en el flujo y alarga la celda, para no leerse en una
       * franja de 140 px.
       */}
      {transcript && (
        <section
          id={transcriptId}
          aria-label="Transcripción del vídeo"
          tabIndex={0}
          className="relative z-10 m-3 mb-[3.75rem] border border-line-strong bg-paper p-4 shadow-float focus-visible:outline-offset-[-2px] md:absolute md:inset-x-3 md:bottom-[3.75rem] md:top-3 md:m-0 md:overflow-y-auto"
        >
          <p className="text-[13px] leading-snug text-ink">
            22 segundos, sin sonido y en bucle. Todo sale de la muestra grabada: el texto del Apolo 11, su grafo y una respuesta real de
            Gemini.
          </p>
          <ol className="mt-3 space-y-2.5 border-t border-line pt-3">
            {TRANSCRIPT.map((s) => (
              <li key={s.at} className="flex gap-3 text-[13px] leading-snug text-ink-2">
                <span className="w-8 shrink-0 font-mono text-[11px] leading-5 tabular text-ink-3">{s.at}</span>
                <div className="min-w-0">{s.body}</div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
