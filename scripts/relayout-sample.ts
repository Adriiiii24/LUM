/*
 * Recalcula solo el layout de la muestra grabada, sin llamar a la API: el grafo y las
 * respuestas no cambian. Útil al ajustar las fuerzas de lib/graph/layout.ts.
 *
 * Uso: npm run sample:relayout
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { layoutGraph } from '../lib/graph/layout.ts';
import type { SampleFile } from '../lib/sample/types.ts';

const url = new URL('../data/sample/sample.json', import.meta.url);
const sample = JSON.parse(readFileSync(url, 'utf8')) as SampleFile;
sample.layout = layoutGraph(sample.graph);
writeFileSync(url, `${JSON.stringify(sample, null, 1)}\n`);
const { minX, minY, maxX, maxY } = sample.layout.bounds;
console.log(`layout: ${Math.round(maxX - minX)} x ${Math.round(maxY - minY)} para ${sample.graph.entities.length} entidades`);
