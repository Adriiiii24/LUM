import type { CSSProperties, ReactNode } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { C, EASE_IN_OUT, EASE_OUT, LABEL, MONO } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * Entra subiendo desde debajo de una máscara; puede salir por arriba. El desplazamiento va en em
 * y no en %: con interlineados por debajo de 1, los rasgos ascendentes y descendentes salen de
 * la caja de línea y un 105 % dejaría asomar una astilla.
 */
export function Rise({ at, exit, dur = 16, children, style }: { at: number; exit?: number; dur?: number; children: ReactNode; style?: CSSProperties }) {
  const f = useCurrentFrame();
  const enter = interpolate(f, [at, at + dur], [1.3, 0], { ...clamp, easing: EASE_OUT });
  const leave = exit === undefined ? 0 : interpolate(f, [exit, exit + dur * 0.8], [0, -1.4], { ...clamp, easing: EASE_IN_OUT });
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', ...style }}>
      <span style={{ display: 'inline-block', transform: `translateY(${enter + leave}em)` }}>{children}</span>
    </span>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...LABEL, color: C.ink, opacity: 0.75, ...style }}>{children}</div>;
}

/** Rotulador lima que barre la palabra clave, como en los titulares de la web. */
export function Highlight({ at, children }: { at: number; children: ReactNode }) {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: EASE_OUT });
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${C.lime}, ${C.lime})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${p * 100}% 100%`,
        color: p > 0.45 ? C.onLime : C.ink,
        padding: '0 0.08em',
        margin: '0 -0.02em',
      }}
    >
      {children}
    </span>
  );
}

/**
 * Cabecera de escena con la fórmula de la web: índice en lima y nombre arriba; debajo, el
 * titular en una frase con su palabra clave marcada.
 */
export function Heading({
  index,
  label,
  before,
  mark,
  after = '.',
  at,
  exit,
}: {
  index: string;
  label: string;
  before: string;
  mark: string;
  after?: string;
  at: number;
  exit?: number;
}) {
  return (
    <div style={{ position: 'absolute', left: 256, top: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Rise at={at} exit={exit} dur={12}>
          <span style={{ display: 'inline-block', background: C.lime, color: C.onLime, fontFamily: MONO, fontSize: 18, fontWeight: 600, padding: '3px 9px' }}>
            {index}
          </span>
        </Rise>
        <Label>
          <Rise at={at + 1} exit={exit} dur={12}>
            {label}
          </Rise>
        </Label>
      </div>
      <div style={{ marginTop: 22, fontSize: 104, lineHeight: 1, fontWeight: 600, letterSpacing: '-0.045em', color: C.ink, whiteSpace: 'nowrap' }}>
        <Rise at={at + 3} exit={exit === undefined ? undefined : exit + 2} style={{ paddingBottom: '0.14em' }}>
          {before}
          <Highlight at={at + 14}>{mark}</Highlight>
          {after}
        </Rise>
      </div>
    </div>
  );
}

/** La marca: «lum» con un nodo por punto. Sobre lima, el punto va en tinta. */
export function Wordmark({ at, size, dot = 'lime' }: { at: number; size: number; dot?: 'lime' | 'ink' }) {
  const letters = 'lum'.split('');
  const ink = dot === 'lime' ? C.ink : C.onLime;
  return (
    <div style={{ fontSize: size, lineHeight: 0.82, fontWeight: 700, letterSpacing: '-0.075em', color: ink, whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline' }}>
      {letters.map((ch, i) => (
        <Rise key={i} at={at + i * 4} dur={20} style={{ paddingBottom: '0.04em', paddingRight: '0.075em', marginRight: '-0.075em' }}>
          {ch}
        </Rise>
      ))}
      <Rise at={at + 14} dur={18} style={{ paddingBottom: '0.04em', marginLeft: '0.06em' }}>
        {/* Anillo como borde dentro de la caja: con una sombra, la máscara de Rise lo cortaría. */}
        <span
          style={{
            display: 'inline-block',
            boxSizing: 'border-box',
            width: '0.25em',
            height: '0.25em',
            borderRadius: '50%',
            background: dot === 'lime' ? C.lime : C.onLime,
            border: `0.045em solid ${ink}`,
          }}
        />
      </Rise>
    </div>
  );
}

export const fade = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: EASE_OUT });

export { clamp };
