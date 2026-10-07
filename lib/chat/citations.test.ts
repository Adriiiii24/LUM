import { test } from 'node:test';
import assert from 'node:assert/strict';
import { segmentAnswer } from './citations.ts';
import type { NodeId } from '../graph/schema.ts';

test('citas: numera por orden de aparición y marca las que están fuera de contexto', () => {
  const ctx = new Set<NodeId>(['n1', 'n5']);
  const a = segmentAnswer('Descubrió el polonio [[n5]] y vivió en París [[n1, n9]]. Otra vez [[n5]].', ctx, true);
  assert.deepEqual(a.cited, ['n5', 'n1', 'n9']);
  assert.deepEqual(a.outOfContext, ['n9']);
  const cites = a.segments.filter((s) => s.kind === 'cite');
  assert.deepEqual(cites.map((c) => c.index), [1, 2, 3, 1]);
});

test('citas: durante el stream retiene una cita a medio llegar', () => {
  const ctx = new Set<NodeId>(['n12']);
  for (const partial of ['Texto [', 'Texto [[', 'Texto [[n1', 'Texto [[n12', 'Texto [[n12]', 'Texto [[n12, n']) {
    const a = segmentAnswer(partial, ctx, false);
    assert.deepEqual(a.segments, [{ kind: 'text', text: 'Texto ' }], partial);
  }
  const done = segmentAnswer('Texto [[n12]]', ctx, false);
  assert.deepEqual(done.cited, ['n12']);
});

test('citas: al cerrar el stream no se pierde texto aunque acabe en corchete', () => {
  const a = segmentAnswer('Una lista [', new Set<NodeId>(), true);
  assert.deepEqual(a.segments, [{ kind: 'text', text: 'Una lista [' }]);
});
