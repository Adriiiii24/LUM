import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, EASE_IN_OUT } from '../theme';
import { Label, Rise, Wordmark, clamp, fade } from '../ui';

/** Cierre en lima con el principio del producto. Al final se funde al hueso vacío del primer fotograma: el bucle no salta. */
export function Outro() {
  const f = useCurrentFrame();
  const rise = interpolate(f, [0, 18], [100, 0], { ...clamp, easing: EASE_IN_OUT });
  const leave = fade(f, 56, 74);
  return (
    <AbsoluteFill style={{ transform: `translateY(${rise}%)`, background: C.lime, opacity: 1 - leave }}>
      <Label style={{ position: 'absolute', left: 262, top: 300, color: C.onLime }}>
        <Rise at={18} dur={12}>
          Recuperación explicable
        </Rise>
      </Label>
      <div style={{ position: 'absolute', left: 252, top: 350, fontSize: 160, lineHeight: 0.95, fontWeight: 600, letterSpacing: '-0.05em', color: C.onLime }}>
        <div>
          <Rise at={12} dur={18} style={{ paddingBottom: '0.1em' }}>
            Lo que se ilumina
          </Rise>
        </div>
        <div>
          <Rise at={17} dur={18} style={{ paddingBottom: '0.1em' }}>
            es verdad.
          </Rise>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 256, top: 834, width: 1000, fontSize: 30, whiteSpace: 'nowrap', lineHeight: 1.25, fontWeight: 500, letterSpacing: '-0.01em', color: C.onLime }}>
        <Rise at={26} dur={16}>
          Recorrido real del recuperador y citas reales del modelo.
        </Rise>
      </div>
      <div style={{ position: 'absolute', right: 256, top: 790 }}>
        <Wordmark at={22} size={150} dot="ink" />
      </div>
    </AbsoluteFill>
  );
}
