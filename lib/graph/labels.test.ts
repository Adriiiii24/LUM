import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relationLabel } from './labels.ts';
import raw from '../../data/sample/sample.json' with { type: 'json' };
import type { Entity, NodeId, Relation } from './schema.ts';

const { entities, relations } = (raw as unknown as { graph: { entities: Entity[]; relations: Relation[] } }).graph;
const nameOf = (id: NodeId) => entities.find((e) => e.id === id)?.name ?? id;

test('aristas: se leen como frase, con los nombres de las entidades', () => {
  const e4 = relations.find((r) => r.id === 'e4');
  assert.ok(e4, 'falta e4 en la muestra');
  assert.equal(relationLabel(e4, nameOf), 'Apolo 11 tuvo como comandante a Neil Armstrong');
  for (const r of relations) {
    const label = relationLabel(r, nameOf);
    assert.doesNotMatch(label, /\b[ne]\d+\b/, `la arista ${r.id} no debe nombrar ids`);
    assert.doesNotMatch(label, /Edge from/);
  }
});

test('aristas: sin espacios de más aunque el predicado los traiga', () => {
  assert.equal(relationLabel({ source: 'n1', target: 'n2', predicate: '  descubrió ' }, (id) => (id === 'n1' ? 'Marie Curie' : 'polonio')), 'Marie Curie descubrió polonio');
});
