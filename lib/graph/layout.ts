import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { KnowledgeGraph, NodeId } from './schema.ts';

export type Point = { x: number; y: number };
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
export type GraphLayout = { positions: Record<NodeId, Point>; bounds: Bounds };

/**
 * Tres diámetros de ficha según el grado, como las magnitudes de una carta: el hub se ve sin color.
 * Caben en la colisión del layout, que reserva al menos 24 px de radio por nodo.
 */
export const SYMBOL_SIZES = [18, 22, 26] as const;
export function degreeTier(degree: number): 0 | 1 | 2 {
  return degree >= 5 ? 2 : degree >= 2 ? 1 : 0;
}

/** Ancho aproximado de la etiqueta (Geist 12 px) para que la colisión deje sitio al texto. */
const LABEL_CHAR_WIDTH = 6.6;
export const LABEL_MAX_WIDTH = 150;

type SimNode = SimulationNodeDatum & { id: NodeId; r: number };

/**
 * Layout de fuerzas determinista: d3-force coloca los nodos sin posición en una espiral fija
 * y su generador aleatorio interno tiene semilla fija, así que el mismo grafo da siempre la
 * misma lámina. Se calcula de una vez (sin animar la simulación) y se redondea para que la
 * muestra grabada sea estable en JSON.
 */
export function layoutGraph(graph: KnowledgeGraph): GraphLayout {
  const nodes: SimNode[] = graph.entities.map((e) => ({
    id: e.id,
    r: Math.max(24, Math.min(LABEL_MAX_WIDTH, e.name.length * LABEL_CHAR_WIDTH) / 2 + 8),
  }));
  const links: Array<SimulationLinkDatum<SimNode>> = graph.relations.map((r) => ({ source: r.source, target: r.target }));

  // Compacto y casi redondo: la lámina tiene que leerse entera tanto en horizontal como en un móvil.
  // Las fuerzas hacia el centro recogen también a las entidades sin relaciones.
  const simulation = forceSimulation(nodes)
    .force('link', forceLink<SimNode, SimulationLinkDatum<SimNode>>(links).id((d) => d.id).distance(78).strength(0.7))
    .force('charge', forceManyBody<SimNode>().strength(-300).distanceMax(420))
    .force('collide', forceCollide<SimNode>((d) => d.r).iterations(4))
    .force('x', forceX<SimNode>(0).strength(0.085))
    .force('y', forceY<SimNode>(0).strength(0.11))
    .stop();
  const ticks = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
  simulation.tick(ticks);

  const positions = {} as Record<NodeId, Point>;
  const bounds: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const n of nodes) {
    const x = Math.round((n.x ?? 0) * 10) / 10;
    const y = Math.round((n.y ?? 0) * 10) / 10;
    positions[n.id] = { x, y };
    bounds.minX = Math.min(bounds.minX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.maxY = Math.max(bounds.maxY, y);
  }
  if (nodes.length === 0) Object.assign(bounds, { minX: 0, minY: 0, maxX: 0, maxY: 0 });
  return { positions, bounds };
}

/** Zonas de referencia de la lámina, como en un plano: columnas A-H y filas 1-6 sobre el espacio del layout. */
export const ZONE_COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export const ZONE_ROWS = 6;
export type Zones = { x0: number; y0: number; cellW: number; cellH: number };

export function zonesFor(bounds: Bounds, padding = 90): Zones {
  const width = Math.max(bounds.maxX - bounds.minX + padding * 2, 400);
  const height = Math.max(bounds.maxY - bounds.minY + padding * 2, 300);
  return {
    x0: (bounds.minX + bounds.maxX) / 2 - width / 2,
    y0: (bounds.minY + bounds.maxY) / 2 - height / 2,
    cellW: width / ZONE_COLUMNS.length,
    cellH: height / ZONE_ROWS,
  };
}

export function zoneOf(p: Point, zones: Zones): string {
  const col = Math.min(ZONE_COLUMNS.length - 1, Math.max(0, Math.floor((p.x - zones.x0) / zones.cellW)));
  const row = Math.min(ZONE_ROWS - 1, Math.max(0, Math.floor((p.y - zones.y0) / zones.cellH)));
  return `${ZONE_COLUMNS[col] ?? 'A'}${row + 1}`;
}
