import type { ChatStatus } from 'ai';

/*
 * Lo que dice la región de estado del banco de trabajo (una sola para todo, siempre montada).
 * Solo habla en los cambios que importan: un grafo nuevo, el principio y el final de una
 * extracción y de cada respuesta. Los errores van en su propia alerta.
 */

const count = (n: number, one: string, many: string) => `${n.toLocaleString('es-ES')} ${n === 1 ? one : many}`;

export const EXTRACTING = 'Extrayendo entidades y relaciones. Suele tardar entre 10 y 40 segundos.';
export const EXTRACTION_CANCELLED = 'Extracción cancelada.';

/** Un grafo nuevo en la lámina: el extraído de un texto propio o el de la muestra al volver a ella. */
export function graphReady(kind: 'sample' | 'user', entities: number, relations: number): string {
  return `${kind === 'sample' ? 'Muestra cargada' : 'Grafo listo'}: ${count(entities, 'entidad', 'entidades')}, ${count(relations, 'relación', 'relaciones')}.`;
}

/** El chat: al empezar a recorrer y al terminar cada respuesta. Mientras se escribe, calla. */
export function chatAnnouncement(
  status: ChatStatus,
  last: { number: number; done: boolean; answered: boolean; cited: number } | undefined,
): string {
  if (status === 'submitted') return 'Recorriendo el grafo.';
  if (status === 'ready' && last?.done && last.answered) return `Respuesta R${last.number} lista, con ${count(last.cited, 'cita', 'citas')}.`;
  return '';
}
