import { AbsoluteFill } from 'remotion';
import { C } from '../theme';
import { Highlight, Label, Rise, Wordmark } from '../ui';

/** Portada: la marca con su nodo lima por punto y la promesa con su palabra marcada. */
export function Intro() {
  return (
    <AbsoluteFill>
      <Label style={{ position: 'absolute', left: 262, top: 352 }}>
        <Rise at={18} dur={12}>
          Grafos de conocimiento con recuperación visible
        </Rise>
      </Label>
      <div style={{ position: 'absolute', left: 240, top: 410 }}>
        <Wordmark at={6} size={420} />
      </div>
      <div style={{ position: 'absolute', left: 1130, top: 600, width: 560, fontSize: 58, lineHeight: 1.04, fontWeight: 600, letterSpacing: '-0.04em', color: C.ink }}>
        <div>
          <Rise at={30} dur={16} style={{ paddingBottom: '0.1em' }}>
            Lo que se ilumina
          </Rise>
        </div>
        <div>
          <Rise at={34} dur={16} style={{ paddingBottom: '0.1em' }}>
            es <Highlight at={48}>verdad</Highlight>.
          </Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
}
