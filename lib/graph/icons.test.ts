import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ICON_KEYS, TYPE_ICON, headOf, iconFor } from './icons.ts';
import raw from '../../data/sample/sample.json' with { type: 'json' };
import type { Entity } from './schema.ts';

const entities = (raw as unknown as { graph: { entities: Entity[] } }).graph.entities;
const icon = (name: string) => {
  const e = entities.find((x) => x.name === name);
  assert.ok(e, `falta ${name} en la muestra`);
  return iconFor(e);
};

test('iconos: la muestra recibe iconos que dicen qué es cada cosa', () => {
  assert.equal(icon('Saturno V'), 'rocket');
  assert.equal(icon('Apolo 11'), 'rocket-launch');
  assert.equal(icon('Luna'), 'moon');
  assert.equal(icon('Mar de la Tranquilidad'), 'waves');
  assert.equal(icon('Estados Unidos'), 'flag');
  assert.equal(icon('Unión Soviética'), 'flag');
  assert.equal(icon('Richard Nixon'), 'identification-badge');
  assert.equal(icon('Neil Armstrong'), 'rocket');
  assert.equal(icon('NASA'), 'planet');
  assert.equal(icon('Guerra Fría'), 'sword');
  assert.equal(icon('carrera espacial'), 'trophy');
  assert.equal(icon('programa Apolo'), 'rocket-launch');
  assert.equal(icon('Eagle'), 'cube-transparent');
  assert.equal(icon('Museo Nacional del Aire y el Espacio'), 'bank');
  assert.equal(icon('Centro Espacial Kennedy'), 'rocket-launch');
});

test('iconos: sin pista en el texto, el icono del tipo', () => {
  assert.equal(iconFor({ type: 'persona', name: 'Ana', description: 'Vecina de la protagonista.' }), TYPE_ICON.persona);
  assert.equal(iconFor({ type: 'otro', name: 'X', description: null }), 'asterisk');
  for (const e of entities) assert.ok(ICON_KEYS.includes(iconFor(e)));
});

test('iconos: la cabeza de la descripción corta en la primera subordinada', () => {
  assert.equal(headOf('País que compitió en la carrera espacial.'), 'pais');
  assert.equal(headOf('Cohete de lanzamiento gigante, utilizado...'), 'cohete de lanzamiento gigante');
});
