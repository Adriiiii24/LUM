/*
 * Graba una ejecución de la extracción por cada texto de referencia de evals/gold/, llamando a
 * /api/extract de la propia app: se evalúa exactamente el pipeline que usa la web.
 *
 * Uso, con la clave en .env.local y el límite por IP subido para esta sesión:
 *   NC_EXTRACT_PER_HOUR=200 npm run dev
 *   BASE_URL=http://localhost:3000 npm run evals:export
 *
 * Escribe evals/runs/<modelo>-<razonamiento>/<id>.json. Después: cd evals && uv run nc-evals score
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { KnowledgeGraph } from '../lib/graph/schema.ts';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const THINKING = process.env.NC_EXTRACT_THINKING ?? 'medium';
/** Pausa entre documentos: la capa gratuita limita las peticiones por minuto. */
const PAUSE_MS = Number(process.env.EVAL_PAUSE_MS ?? 15_000);

type Gold = { id: string; text: string };
type Run = {
  docId: string;
  model: string | null;
  thinking: string;
  latencyMs: number;
  ok: boolean;
  error: string | null;
  text: string | null;
  graph: KnowledgeGraph | null;
};

const goldDir = new URL('../evals/gold/', import.meta.url);
const golds: Gold[] = readdirSync(goldDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(readFileSync(new URL(f, goldDir), 'utf8')) as Gold);

const runs: Run[] = [];
for (const [i, gold] of golds.entries()) {
  if (i > 0) await new Promise((r) => setTimeout(r, PAUSE_MS));
  const started = Date.now();
  let run: Run;
  try {
    const res = await fetch(`${BASE_URL}/api/extract`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: gold.text }),
    });
    const body = (await res.json()) as { graph?: KnowledgeGraph; text?: string; error?: string };
    run = {
      docId: gold.id,
      model: body.graph?.meta.model ?? null,
      thinking: THINKING,
      latencyMs: Date.now() - started,
      ok: res.ok && body.graph !== undefined,
      error: res.ok ? null : (body.error ?? `HTTP ${res.status}`),
      text: body.text ?? null,
      graph: body.graph ?? null,
    };
  } catch (error) {
    run = { docId: gold.id, model: null, thinking: THINKING, latencyMs: Date.now() - started, ok: false, error: String(error), text: null, graph: null };
  }
  runs.push(run);
  console.log(`${gold.id}: ${run.ok ? `${run.graph?.entities.length} entidades, ${run.graph?.relations.length} relaciones` : `error ${run.error}`} (${run.latencyMs} ms)`);
}

const model = runs.find((r) => r.model)?.model ?? 'desconocido';
const outDir = new URL(`../evals/runs/${model}-${THINKING}/`, import.meta.url);
mkdirSync(outDir, { recursive: true });
for (const run of runs) writeFileSync(new URL(`${run.docId}.json`, outDir), `${JSON.stringify(run, null, 1)}\n`);
console.log(`escritas ${runs.length} ejecuciones en ${outDir.pathname}`);
