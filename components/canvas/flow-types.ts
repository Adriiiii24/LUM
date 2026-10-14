import type { Edge, Node } from '@xyflow/react';
import type { Entity, Relation } from '@/lib/graph/schema';
import { SYMBOL_SIZES, degreeTier } from '@/lib/graph/layout';

export type EntityNodeData = { entity: Entity; zone: string; order: number };
export type EntityFlowNode = Node<EntityNodeData, 'entity'>;

export type RelationEdgeData = { relation: Relation };
export type RelationFlowEdge = Edge<RelationEdgeData, 'relation'>;

/** Caja del nodo en la lámina: cuadrada y centrada en su posición (nodeOrigin 0,5). */
export const NODE_BOX = 44;

export const symbolSize = (entity: Entity): number => SYMBOL_SIZES[degreeTier(entity.degree)];
