import { Composition } from 'remotion';
import { LumIntro } from './LumIntro';
import { DURATION, FPS } from './timeline';

export const Root = () => (
  <Composition id="LumIntro" component={LumIntro} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
