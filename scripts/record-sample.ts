/*
 * Graba la muestra de la portada con llamadas reales a la API de la propia app:
 * extrae el texto de data/sample/source.txt, calcula el layout y graba el stream de
 * respuesta de cada pregunta sugerida, con sus tiempos.
 *
 * Uso: con la app en marcha (npm run dev) y la clave en .env.local,
 *   BASE_URL=http://localhost:3000 npm run record:sample
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { layoutGraph } from '../lib/graph/layout.ts';
import type { KnowledgeGraph } from '../lib/graph/schema.ts';
import type { NCChunk, RecordedChunk, SampleFile, SampleReplay } from '../lib/sample/types.ts';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const QUESTIONS = [
  '¿Quién pisó primero la Luna y desde qué nave descendió?',
  '¿Qué hizo Michael Collins mientras sus compañeros estaban en la superficie?',
  '¿Por qué fue importante el Apolo 11 en la Guerra Fría?',
];
/** Las pausas largas (la latencia hasta el primer token) se acortan a esto al grabar. */
const MAX_GAP_MS = 1500;

const sourceUrl = new URL('../data/sample/source.txt', import.meta.url);
const outUrl = new URL('../data/sample/sample.json', import.meta.url);
const text = readFileSync(sourceUrl, 'utf8');

async function extract(): Promise<KnowledgeGraph> {
  const res = await fetch(`${BASE_URL}/api/extract`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const body = (await res.json()) as { graph?: KnowledgeGraph; error?: string };
  if (!res.ok || !body.graph) throw new Error(`extracción fallida: ${res.status} ${body.error ?? ''}`);
  return body.graph;
}

async function ask(graph: KnowledgeGraph, question: string): Promise<SampleReplay> {
  const started = Date.now();
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      graph,
      source: text,
      messages: [{ id: 'sample-q', role: 'user', parts: [{ type: 'text', text: question }] }],
    }),
  });
  if (!res.ok || !res.body) throw new Error(`chat fallido: ${res.status} ${await res.text()}`);

  const chunks: RecordedChunk[] = [];
  const decoder = new TextDecoder();
  const reader = res.body.getReader();
  let buffer = '';
  let clock = 0;
  let lastReal = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let cut = buffer.indexOf('\n\n');
    while (cut >= 0) {
      const event = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      cut = buffer.indexOf('\n\n');
      const data = event.split('\n').filter((l) => l.startsWith('data: ')).map((l) => l.slice(6)).join('');
      if (!data || data === '[DONE]') continue;
      const now = Date.now() - started;
      clock += Math.min(now - lastReal, MAX_GAP_MS);
      lastReal = now;
      chunks.push({ t: clock, chunk: JSON.parse(data) as NCChunk });
    }
  }
  const failed = chunks.find((c) => c.chunk.type === 'error');
  if (failed) throw new Error(`la respuesta trae un error: ${JSON.stringify(failed.chunk)}`);
  return { question, chunks };
}

// Con REUSE_GRAPH=1 se reutiliza la última extracción para no gastar cuota si falla el chat.
const cacheUrl = new URL('../.scratch/last-sample-graph.json', import.meta.url);
const graph: KnowledgeGraph = process.env.REUSE_GRAPH === '1'
  ? (JSON.parse(readFileSync(cacheUrl, 'utf8')) as KnowledgeGraph)
  : await extract();
writeFileSync(cacheUrl, JSON.stringify(graph));
console.log(`grafo: ${graph.entities.length} entidades, ${graph.relations.length} relaciones (${graph.meta.model})`);
const replays: SampleReplay[] = [];
for (const q of QUESTIONS) {
  const replay = await ask(graph, q);
  const textLength = replay.chunks.reduce((n, c) => n + (c.chunk.type === 'text-delta' ? c.chunk.delta.length : 0), 0);
  console.log(`grabada: «${q}» (${replay.chunks.length} fragmentos, ${textLength} caracteres)`);
  replays.push(replay);
}

const chatModels = [...new Set(replays.flatMap((r) => r.chunks.flatMap((c) =>
  (c.chunk.type === 'finish' || c.chunk.type === 'message-metadata') && c.chunk.messageMetadata ? [c.chunk.messageMetadata.model] : [])))];

const sample: SampleFile = {
  provenance: 'gemini',
  recordedAt: new Date().toISOString(),
  title: 'Apolo 11',
  attribution: {
    label: '«Apolo 11», Wikipedia en español',
    url: 'https://es.wikipedia.org/w/index.php?oldid=175585557',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.es',
  },
  settings: { extractModel: graph.meta.model, thinking: process.env.NC_EXTRACT_THINKING ?? 'medium', chatModels },
  text,
  graph,
  layout: layoutGraph(graph),
  replays,
};
writeFileSync(outUrl, `${JSON.stringify(sample, null, 1)}\n`);
console.log(`escrita ${outUrl.pathname}`);
