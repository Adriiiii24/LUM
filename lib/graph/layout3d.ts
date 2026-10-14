import type { KnowledgeGraph, NodeId } from './schema.ts';
import type { GraphLayout } from './layout.ts';

export type Point3 = { x: number; y: number; z: number };
export type Layout3D = Record<NodeId, Point3>;

/** Hash FNV-1a del id, en [-1, 1): la profundidad inicial de cada nodo es siempre la misma. */
function seed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) / 4294967296) * 2 - 1;
}

/**
 * Layout de fuerzas en 3D, determinista: parte del layout 2D de la lámina (así la vista 3D se
 * reconoce) con una profundidad sembrada por id, y relaja con muelles en las relaciones,
 * repulsión entre todos y un tirón suave al centro. Para 60 nodos son unos milisegundos.
 * Devuelve posiciones normalizadas: el nodo más lejano del centro queda a distancia 1.
 */
export function layout3D(graph: KnowledgeGraph, layout: GraphLayout, iterations = 260): Layout3D {
  const ids = graph.entities.map((e) => e.id);
  const n = ids.length;
  if (n === 0) return {} as Layout3D;
  const index = new Map(ids.map((id, i) => [id, i]));

  const { minX, maxX, minY, maxY } = layout.bounds;
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const z = new Float64Array(n);
  ids.forEach((id, i) => {
    const p = layout.positions[id] ?? { x: cx, y: cy };
    x[i] = ((p.x - cx) / span) * 2;
    y[i] = ((p.y - cy) / span) * 2;
    z[i] = seed(id) * 0.8;
  });

  const links = graph.relations.flatMap((r) => {
    const a = index.get(r.source);
    const b = index.get(r.target);
    return a === undefined || b === undefined || a === b ? [] : [[a, b] as const];
  });

  const rest = 0.42;
  const repulse = 0.012;
  const vx = new Float64Array(n);
  const vy = new Float64Array(n);
  const vz = new Float64Array(n);
  for (let it = 0; it < iterations; it++) {
    const cool = 1 - it / iterations;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = x[i]! - x[j]!;
        const dy = y[i]! - y[j]!;
        const dz = z[i]! - z[j]!;
        const d2 = dx * dx + dy * dy + dz * dz + 1e-4;
        const f = repulse / d2;
        const d = Math.sqrt(d2);
        vx[i]! += (dx / d) * f; vy[i]! += (dy / d) * f; vz[i]! += (dz / d) * f;
        vx[j]! -= (dx / d) * f; vy[j]! -= (dy / d) * f; vz[j]! -= (dz / d) * f;
      }
    }
    for (const [a, b] of links) {
      const dx = x[b]! - x[a]!;
      const dy = y[b]! - y[a]!;
      const dz = z[b]! - z[a]!;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const f = (d - rest) * 0.05;
      vx[a]! += (dx / d) * f; vy[a]! += (dy / d) * f; vz[a]! += (dz / d) * f;
      vx[b]! -= (dx / d) * f; vy[b]! -= (dy / d) * f; vz[b]! -= (dz / d) * f;
    }
    for (let i = 0; i < n; i++) {
      vx[i]! -= x[i]! * 0.01; vy[i]! -= y[i]! * 0.01; vz[i]! -= z[i]! * 0.01;
      x[i]! += vx[i]! * cool; y[i]! += vy[i]! * cool; z[i]! += vz[i]! * cool;
      vx[i]! *= 0.6; vy[i]! *= 0.6; vz[i]! *= 0.6;
    }
  }

  // Centrado y escala a la esfera unidad.
  let mx = 0, my = 0, mz = 0;
  for (let i = 0; i < n; i++) { mx += x[i]!; my += y[i]!; mz += z[i]!; }
  mx /= n; my /= n; mz /= n;
  let radius = 1e-6;
  for (let i = 0; i < n; i++) radius = Math.max(radius, Math.hypot(x[i]! - mx, y[i]! - my, z[i]! - mz));
  const out = {} as Layout3D;
  ids.forEach((id, i) => {
    out[id] = {
      x: Math.round(((x[i]! - mx) / radius) * 1e4) / 1e4,
      y: Math.round(((y[i]! - my) / radius) * 1e4) / 1e4,
      z: Math.round(((z[i]! - mz) / radius) * 1e4) / 1e4,
    };
  });
  return out;
}
