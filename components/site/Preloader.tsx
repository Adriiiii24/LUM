'use client';
import { useEffect, useState } from 'react';
import { STORAGE } from '@/lib/site';
import { Wordmark } from './Wordmark';

/** Un recorrido en miniatura: seis nodos y sus aristas, que se encienden en el orden del salto. */
const NODES = [
  { x: 30, y: 62 },
  { x: 78, y: 28 },
  { x: 92, y: 88 },
  { x: 140, y: 52 },
  { x: 176, y: 18 },
  { x: 184, y: 92 },
];
const EDGES: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
];
/** Orden en que se encienden: semilla, primer salto, segundo salto. */
const LIGHT_AT = [500, 680, 680, 860, 1040, 1040];

/**
 * Cortina de entrada, solo la primera vez en cada sesión: las aristas se dibujan y los nodos se
 * encienden en lima como en un recorrido. El CSS la desvanece a los 1,4 s aunque el JavaScript
 * falle; aquí solo se recuerda que ya se vio y se desmonta.
 */
export function Preloader() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Si el guion de arranque la descartó, el CSS ya la oculta: solo queda desmontarla.
    const skip = document.documentElement.classList.contains('lum-no-preloader');
    if (!skip) {
      try {
        sessionStorage.setItem(STORAGE.preloaded, '1');
      } catch {
        // Sin almacenamiento: la cortina saldrá también en la próxima carga.
      }
    }
    const done = setTimeout(() => setGone(true), skip ? 0 : 2000);
    return () => clearTimeout(done);
  }, []);

  if (gone) return null;
  return (
    <div data-preloader="" aria-hidden="true" className="dot-grid fixed inset-0 z-[90] grid place-items-center bg-paper">
      <div className="flex flex-col items-center gap-6">
        <svg viewBox="0 0 214 110" className="w-56 overflow-visible">
          <g stroke="var(--color-ink)" strokeWidth={1.25}>
            {EDGES.map(([a, b], i) => (
              <line key={i} x1={NODES[a]!.x} y1={NODES[a]!.y} x2={NODES[b]!.x} y2={NODES[b]!.y} pathLength={1} style={{ ['--d' as string]: i * 70 }} />
            ))}
          </g>
          {NODES.map((n, i) => (
            <circle
              key={i}
              className="pre-node"
              cx={n.x}
              cy={n.y}
              r={i === 3 ? 10 : 7}
              fill="var(--color-paper)"
              stroke="var(--color-ink)"
              strokeWidth={1.5}
              style={{ ['--d' as string]: LIGHT_AT[i] }}
            />
          ))}
        </svg>
        <span className="text-4xl font-bold leading-none tracking-[-0.06em]">
          <Wordmark />
        </span>
      </div>
    </div>
  );
}
