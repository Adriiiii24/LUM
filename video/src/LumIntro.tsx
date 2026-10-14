import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { C, EASE_IN_OUT, SANS } from './theme';
import { T } from './timeline';
import { clamp } from './ui';
import { Intro } from './scenes/Intro';
import { TextScene } from './scenes/TextScene';
import { GraphStory } from './scenes/GraphStory';
import { Outro } from './scenes/Outro';

/** Barrido lima: crece desde la izquierda hasta cubrir, se cambia de escena debajo y se retira por la derecha. */
function Wipe() {
  const f = useCurrentFrame();
  const grow = interpolate(f, [T.wipeIn, T.swap - 2], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const shrink = interpolate(f, [T.wipeOut, T.wipeOut + 14], [1, 0], { ...clamp, easing: EASE_IN_OUT });
  if (f < T.wipeIn || f > T.wipeOut + 14) return null;
  const covering = f < T.wipeOut;
  return (
    <AbsoluteFill
      style={{
        background: C.lime,
        transform: `scaleX(${covering ? grow : shrink})`,
        transformOrigin: covering ? 'left' : 'right',
      }}
    />
  );
}

export function LumIntro() {
  return (
    <AbsoluteFill
      style={{
        // El mismo lienzo de puntos que la web, al doble porque el vídeo se ve a la mitad en la portada.
        backgroundColor: C.bone,
        backgroundImage: `radial-gradient(circle at center, ${C.dots} 2px, transparent 2.6px)`,
        backgroundSize: '44px 44px',
        backgroundPosition: '22px 22px',
        color: C.ink,
        fontFamily: SANS,
      }}
    >
      <Sequence durationInFrames={T.swap}>
        <Intro />
      </Sequence>
      <Sequence from={T.swap} durationInFrames={T.graph - T.swap}>
        <TextScene />
      </Sequence>
      <Sequence from={T.graph} durationInFrames={T.outro + 20 - T.graph}>
        <GraphStory />
      </Sequence>
      <Wipe />
      <Sequence from={T.outro}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
}
