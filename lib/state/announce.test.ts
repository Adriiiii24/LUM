import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chatAnnouncement, graphReady } from './announce.ts';

test('estado: un grafo nuevo dice cuántas entidades y relaciones trae', () => {
  assert.equal(graphReady('user', 26, 33), 'Grafo listo: 26 entidades, 33 relaciones.');
  assert.equal(graphReady('sample', 26, 33), 'Muestra cargada: 26 entidades, 33 relaciones.');
  assert.equal(graphReady('user', 1, 1), 'Grafo listo: 1 entidad, 1 relación.');
});

test('estado: el chat solo habla al empezar a recorrer y al terminar la respuesta', () => {
  const last = { number: 2, done: true, answered: true, cited: 3 };
  assert.equal(chatAnnouncement('submitted', undefined), 'Recorriendo el grafo.');
  // Mientras se escribe la respuesta no hay anuncios nuevos: la lámina ya lo enseña.
  assert.equal(chatAnnouncement('streaming', { ...last, done: false }), '');
  assert.equal(chatAnnouncement('ready', last), 'Respuesta R2 lista, con 3 citas.');
  assert.equal(chatAnnouncement('ready', { ...last, cited: 1 }), 'Respuesta R2 lista, con 1 cita.');
  // Los errores tienen su alerta; la región de estado no los repite.
  assert.equal(chatAnnouncement('error', last), '');
  assert.equal(chatAnnouncement('ready', undefined), '');
});
