'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from '@phosphor-icons/react/dist/ssr';
import { useTheme } from '@/lib/theme';

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
        <p className="caps bg-paper px-2.5 py-1.5 text-ink-2">Intro · 0:22 · Remotion</p>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pausar el vídeo' : 'Reproducir el vídeo'}
          className="grid size-9 place-items-center bg-markup text-on-markup transition-colors hover:bg-ink hover:text-paper"
        >
          {playing ? <Pause size={16} weight="fill" aria-hidden="true" /> : <Play size={16} weight="fill" aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}
