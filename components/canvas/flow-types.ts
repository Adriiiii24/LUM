import type { Edge, Node } from '@xyflow/react';
import type { Entity, Relation } from '@/lib/graph/schema';
import { SYMBOL_SIZES, degreeTier } from '@/lib/graph/layout';

export type EntityNodeData = { entity: Entity; zone: string; order: number };
export type EntityFlowNode = Node<EntityNodeData, 'entity'>;

export type RelationEdgeData = { relation: Relation };
export type RelationFlowEdge = Edge<RelationEdgeData, 'relation'>;

/** Caja del nodo en la lámina: cuadrada y centrada en su posición (nodeOrigin 0,5). */
export const NODE_BOX = 44;

/**
 * Opacidad de un nodo apartado (fuera del vecindario en foco o del recorrido). Sigue siendo un
 * control, así que su filete de tinta no baja de 3:1 sobre el fondo (WCAG 1.4.11): al 50 % da
 * 3,3:1 en claro y 4,8:1 en oscuro; el mínimo en claro es el 47 %. No se multiplica: un nodo
 * apartado por las dos cosas queda igual.
 */
export const FADED = 0.5;

export const symbolSize = (entity: Entity): number => SYMBOL_SIZES[degreeTier(entity.degree)];
