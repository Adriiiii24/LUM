import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeExtraction } from './normalize.ts';
import { buildContext, retrieve } from './retrieve.ts';
import { layoutGraph, zoneOf, zonesFor } from './layout.ts';
import type { Extraction, NodeId } from './schema.ts';

// Texto escrito para estos tests; no es la muestra de la web.
const SOURCE = `Marie Curie nació en Varsovia en 1867. En París estudió en la Sorbona,
donde conoció a Pierre Curie. Curie descubrió el polonio y el radio junto a su marido.
Por ese trabajo recibió el Premio Nobel de Física en 1903.`;

const RAW: Extraction = {
  entities: [
    { key: 'marie_curie', name: 'Marie Curie', type: 'persona', aliases: ['Curie'], description: 'Científica nacida en Varsovia.', evidence: 'Marie Curie nació en Varsovia en 1867.' },
    { key: 'varsovia', name: 'Varsovia', type: 'lugar', aliases: [], description: 'Ciudad natal de Marie Curie.', evidence: 'nació en Varsovia' },
    { key: 'sorbona', name: 'Sorbona', type: 'organizacion', aliases: [], description: 'Universidad de París.', evidence: 'En París estudió en la Sorbona,' },
    { key: 'pierre_curie', name: 'Pierre Curie', type: 'persona', aliases: [], description: 'Marido de Marie Curie.', evidence: 'conoció a Pierre Curie' },
    { key: 'polonio', name: 'polonio', type: 'concepto', aliases: [], description: 'Elemento descubierto por Curie.', evidence: '«Curie descubrió el polonio»' },
    { key: 'radio', name: 'radio', type: 'concepto', aliases: [], description: 'Elemento descubierto por Curie.', evidence: 'el polonio y el radio' },
    { key: 'nobel_fisica', name: 'Premio Nobel de Física', type: 'evento', aliases: [], description: 'Premio de 1903.', evidence: 'recibió el Premio Nobel de Física en 1903' },
    // Duplicado que el modelo a veces emite: tiene que fundirse con marie_curie.
    { key: 'curie', name: 'Curie', type: 'persona', aliases: [], description: 'La misma científica.', evidence: 'Curie descubrió' },
  ],
  relations: [
    { source: 'marie_curie', target: 'varsovia', predicate: 'nació en', evidence: 'nació en Varsovia' },
    { source: 'marie_curie', target: 'sorbona', predicate: 'estudió en', evidence: 'estudió en la Sorbona' },
    { source: 'marie_curie', target: 'pierre_curie', predicate: 'conoció a', evidence: 'conoció a Pierre Curie' },
    { source: 'curie', target: 'polonio', predicate: 'Descubrió', evidence: 'Curie descubrió el polonio' },
    { source: 'marie_curie', target: 'radio', predicate: 'descubrió', evidence: 'el polonio y el radio' },
    { source: 'marie_curie', target: 'nobel_fisica', predicate: 'recibió', evidence: 'recibió el Premio Nobel de Física' },
    { source: 'marie_curie', target: 'polonio', predicate: 'descubrió', evidence: 'duplicada' },
    { source: 'marie_curie', target: 'marie_curie', predicate: 'es', evidence: 'bucle' },
    { source: 'marie_curie', target: 'einstein', predicate: 'conoció a', evidence: 'colgante' },
  ],
};

const graph = normalizeExtraction(RAW, SOURCE, { model: 'test', createdAt: '2026-10-07T00:00:00.000Z' });
const idOf = (name: string): NodeId => {
  const e = graph.entities.find((x) => x.name === name);
  assert.ok(e, `falta ${name}`);
  return e.id;
};

test('normalize: funde duplicados y descarta bucles, colgantes y aristas repetidas', () => {
  assert.equal(graph.entities.length, 7);
  assert.equal(graph.relations.length, 6);
  const curie = graph.entities.find((e) => e.name === 'Marie Curie');
  assert.ok(curie?.aliases.includes('Curie'));
  assert.equal(curie?.degree, 6);
});

test('normalize: ancla cada cita en el texto, tolerando comillas y saltos de línea', () => {
  const polonio = graph.entities.find((e) => e.name === 'polonio');
  assert.ok(polonio?.evidence);
  assert.equal(SOURCE.slice(polonio.evidence.start, polonio.evidence.end), 'Curie descubrió el polonio');
  const sorbona = graph.entities.find((e) => e.name === 'Sorbona');
  assert.ok(sorbona?.evidence, 'la cita cruza un salto de línea en el original');
});

test('normalize: un carácter que crece al pasar a minúsculas no desplaza las citas', () => {
  // «İ» (U+0130) pasa a dos unidades en minúsculas («i» y un punto combinado): el mapa de posiciones tiene que seguirlo.
  const text = 'İzmir es una ciudad. Marie Curie nació en Varsovia.';
  const g = normalizeExtraction(
    { entities: [{ key: 'varsovia', name: 'Varsovia', type: 'lugar', aliases: [], description: 'Ciudad natal de Curie.', evidence: 'nació en Varsovia' }], relations: [] },
    text,
    { model: 'test', createdAt: '2026-10-07T00:00:00.000Z' },
  );
  const span = g.entities[0]?.evidence;
  assert.ok(span, 'la cita tiene que anclarse aunque haya un «İ» antes');
  assert.equal(text.slice(span.start, span.end), 'nació en Varsovia');
});

test('normalize: una cita que no está en el texto queda sin anclaje', () => {
  const first = RAW.entities[0];
  assert.ok(first);
  const g = normalizeExtraction(
    { entities: [{ ...first, evidence: 'Marie Curie nació en Cracovia' }], relations: [] },
    SOURCE,
    { model: 'test', createdAt: '2026-10-07T00:00:00.000Z' },
  );
  assert.equal(g.entities[0]?.evidence, null);
});

test('retrieve: parte de lo que nombra la pregunta y salta por los predicados relevantes', () => {
  const r = retrieve(graph, '¿Qué descubrió Marie Curie?');
  assert.equal(r.fallback, false);
  assert.equal(r.steps[0]?.kind, 'seed');
  assert.ok(r.steps[0]?.nodes.includes(idOf('Marie Curie')));
  // «Curie» ya lo consumió el nombre completo: Pierre Curie no es semilla.
  assert.ok(!r.steps[0]?.nodes.includes(idOf('Pierre Curie')));
  const hop1 = r.steps[1];
  assert.ok(hop1 && hop1.kind === 'hop');
  // Los vecinos por «descubrió» van primero.
  assert.deepEqual(new Set(hop1.nodes.slice(0, 2)), new Set([idOf('polonio'), idOf('radio')]));
});

test('retrieve: un nombre completo solo coincide como palabra entera', () => {
  // «radio» no debe encontrarse dentro de «radiografía».
  const r = retrieve(graph, '¿Quién hizo una radiografía en París?');
  assert.ok(!r.steps[0]?.nodes.includes(idOf('radio')));
});

test('retrieve: respeta los presupuestos de nodos y aristas', () => {
  const r = retrieve(graph, 'Marie Curie', { maxNodes: 3, maxEdges: 2 });
  assert.ok(r.nodes.length <= 3);
  assert.ok(r.edges.length <= 2);
});

test('retrieve: sin coincidencias parte de las entidades más conectadas y lo dice', () => {
  const r = retrieve(graph, '¿Qué tiempo hace hoy?');
  assert.equal(r.fallback, true);
  assert.equal(r.steps[0]?.nodes[0], idOf('Marie Curie'));
});

test('buildContext: solo incluye lo recuperado, con su cita literal', () => {
  const r = retrieve(graph, '¿Dónde nació Marie Curie?', { maxHops: 1 });
  const ctx = buildContext(graph, SOURCE, r);
  assert.match(ctx, /\[n\d+\] Marie Curie \(persona\)/);
  assert.match(ctx, /-nació en-> /);
});

test('layout: es determinista y deja cada nodo en una zona de la lámina', () => {
  const a = layoutGraph(graph);
  const b = layoutGraph(graph);
  assert.deepEqual(a, b);
  const zones = zonesFor(a.bounds);
  for (const e of graph.entities) {
    const p = a.positions[e.id];
    assert.ok(p && Number.isFinite(p.x) && Number.isFinite(p.y));
    assert.match(zoneOf(p, zones), /^[A-H][1-6]$/);
  }
});
