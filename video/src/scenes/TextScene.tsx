import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EXCERPT_SPANS } from '../data';
import { C } from '../theme';
import { Heading, Label, fade } from '../ui';

const MARK_START = 40;
const MARK_EVERY = 9;
const MARK_DUR = 10;
const EXIT = 106;

/** Primer paso: un texto real de la muestra; cada entidad que nombra se marca en lima. */
export function TextScene() {
  const f = useCurrentFrame();
  let k = -1;
  const marked = EXCERPT_SPANS.filter((s) => s.entity).length;
  const done = Math.max(0, Math.min(marked, Math.floor((f - MARK_START - MARK_DUR / 2) / MARK_EVERY) + 1));
  const out = fade(f, EXIT, EXIT + 14);

  return (
    <AbsoluteFill>
      <Heading index="01" label="Texto" before="Parte de un " mark="texto" at={4} exit={EXIT} />
      <p
        style={{
          position: 'absolute',
          left: 256,
          top: 372,
          width: 1150,
          margin: 0,
          fontSize: 40,
          lineHeight: 1.42,
          letterSpacing: '0.005em',
          color: C.ink,
          opacity: fade(f, 8, 26) * (1 - out),
          transform: `translateY(${fade(f, 8, 26, 24, 0) - out * 24}px)`,
        }}
      >
        {EXCERPT_SPANS.map((s, i) => {
          if (!s.entity) return <span key={i}>{s.text}</span>;
          k += 1;
          const p = fade(f, MARK_START + k * MARK_EVERY, MARK_START + k * MARK_EVERY + MARK_DUR);
          return (
            <span
              key={i}
              style={{
                backgroundImage: `linear-gradient(${C.lime}, ${C.lime})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${p * 100}% 100%`,
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone',
                padding: '0 0.08em',
                margin: '0 -0.08em',
                fontWeight: p > 0.5 ? 500 : 400,
                color: p > 0.5 ? C.onLime : C.ink,
              }}
            >
              {s.text}
            </span>
          );
        })}
      </p>
      <div style={{ position: 'absolute', left: 1488, top: 372, opacity: fade(f, 14, 30) * (1 - out) }}>
        <Label>Entidades</Label>
        <div style={{ marginTop: 10, fontSize: 168, lineHeight: 0.85, fontWeight: 700, letterSpacing: '-0.06em', color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
          {String(done).padStart(2, '0')}
        </div>
        <Label style={{ marginTop: 18, fontWeight: 400, fontSize: 13 }}>en estas dos frases</Label>
      </div>
    </AbsoluteFill>
  );
}
