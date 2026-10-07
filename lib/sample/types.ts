import type { InferUIMessageChunk } from 'ai';
import type { KnowledgeGraph } from '../graph/schema.ts';
import type { GraphLayout } from '../graph/layout.ts';
import type { NCMessage } from '../chat/types.ts';

export type NCChunk = InferUIMessageChunk<NCMessage>;

/** Un fragmento del stream grabado y cuándo llegó, en ms desde que se envió la pregunta. */
export type RecordedChunk = { t: number; chunk: NCChunk };

export type SampleReplay = { question: string; chunks: RecordedChunk[] };

/**
 * La muestra de la portada. `provenance: 'gemini'` solo si salió de llamadas reales
 * (scripts/record-sample.ts); un grafo hecho a mano llevaría 'fixture' y la interfaz lo diría.
 */
export type SampleFile = {
  provenance: 'gemini' | 'fixture';
  recordedAt: string;
  title: string;
  attribution: { label: string; url: string; license: string; licenseUrl: string };
  settings: { extractModel: string; thinking: string; chatModels: string[] };
  text: string;
  graph: KnowledgeGraph;
  layout: GraphLayout;
  replays: SampleReplay[];
};
