'use client';
import { useEffect, useState } from 'react';
import { useWorkbench } from '@/lib/state/workbench';

/** Mientras Gemini extrae: la lámina anterior se apaga y una línea de tinta marca la espera. */
export function ExtractingOverlay() {
  const extraction = useWorkbench((s) => s.extraction);
  // El reloj arranca en el cliente: Date.now() durante el prerender rompería la caché de la página.
  const [now, setNow] = useState(0);
  const running = extraction.phase === 'running';

  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [running]);

  if (extraction.phase !== 'running') return null;
  const seconds = now ? Math.max(0, Math.round((now - extraction.startedAt) / 1000)) : 0;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-paper/75">
      <div className="absolute inset-x-0 top-0 h-px overflow-hidden bg-line">
        <div className="h-full w-1/3 animate-[lum-scan_1.4s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-ink motion-reduce:animate-none" />
      </div>
      <div className="mx-4 max-w-xs border border-line-strong bg-paper px-4 py-3 text-sm text-ink shadow-float">
        <p className="font-medium">Extrayendo entidades y relaciones</p>
        <p className="mt-1 text-[13px] leading-snug text-ink-2">
          Gemini lee el texto y devuelve un grafo con su esquema; después se anclan las citas. Suele tardar entre 10 y 40 segundos.
        </p>
        <p className="mt-2 font-mono text-xs tabular text-ink-3" aria-hidden="true">
          {seconds} s
        </p>
      </div>
    </div>
  );
}
