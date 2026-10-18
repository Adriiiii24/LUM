import type { NodeId, Relation } from './schema.ts';

/**
 * Nombre accesible de una arista: la relación leída como una frase, con los nombres de las
 * entidades y no sus ids. «Apolo 11 tuvo como comandante a Neil Armstrong».
 */
export function relationLabel(relation: Pick<Relation, 'source' | 'target' | 'predicate'>, nameOf: (id: NodeId) => string): string {
  return [nameOf(relation.source), relation.predicate, nameOf(relation.target)]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
}
