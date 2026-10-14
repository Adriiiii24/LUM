import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layout3D } from './layout3d.ts';
import raw from '../../data/sample/sample.json' with { type: 'json' };
import type { KnowledgeGraph } from './schema.ts';
import type { GraphLayout } from './layout.ts';

const sample = raw as unknown as { graph: KnowledgeGraph; layout: GraphLayout };

test('layout 3D: determinista, dentro de la esfera unidad y con profundidad real', () => {
  const a = layout3D(sample.graph, sample.layout);
  const b = layout3D(sample.graph, sample.layout);
  assert.deepEqual(a, b);
  const points = Object.values(a);
  assert.equal(points.length, sample.graph.entities.length);
  for (const p of points) {
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
    assert.ok(Math.hypot(p.x, p.y, p.z) <= 1.0001);
  }
  const zs = points.map((p) => p.z);
  assert.ok(Math.max(...zs) - Math.min(...zs) > 0.5, 'el grafo no es plano');
});

test('layout 3D: los extremos de una relación quedan más cerca que la media', () => {
  const p = layout3D(sample.graph, sample.layout);
  const dist = (u: string, v: string) => {
    const a = p[u as keyof typeof p]!;
    const b = p[v as keyof typeof p]!;
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  };
  const linked = sample.graph.relations.map((r) => dist(r.source, r.target));
  const ids = sample.graph.entities.map((e) => e.id);
  const all = ids.flatMap((u, i) => ids.slice(i + 1).map((v) => dist(u, v)));
  const mean = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;
  assert.ok(mean(linked) < mean(all));
});
