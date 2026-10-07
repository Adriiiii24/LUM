import { KnowledgeGraphSchema } from '../graph/schema.ts';
import type { SampleFile } from './types.ts';
import raw from '../../data/sample/sample.json';

/**
 * La muestra la genera scripts/record-sample.ts. El grafo se valida con el mismo esquema
 * que la API para que un fichero editado a mano no llegue roto a la lámina.
 */
export function loadSample(): SampleFile {
  const sample = raw as unknown as SampleFile;
  KnowledgeGraphSchema.parse(sample.graph);
  if (sample.provenance !== 'gemini' && sample.provenance !== 'fixture') throw new Error('muestra sin procedencia');
  return sample;
}
