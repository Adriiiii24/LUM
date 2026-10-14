'use client';
import { useWorkbench } from '@/lib/state/workbench';
import { zoneOf, zonesFor } from '@/lib/graph/layout';
import { SymbolGlyph, TYPE_LABEL } from './EntitySymbol';

const STATE_TEXT = { idle: '', dim: '', seed: 'Semilla', traversed: 'Recorrida', cited: 'Citada' } as const;

/** Alternativa no visual de la lámina: las mismas entidades y relaciones, en tablas, con su estado. */
export function EntityList() {
  const graph = useWorkbench((s) => s.graph);
  const layout = useWorkbench((s) => s.layout);
  const visual = useWorkbench((s) => s.nodeVisual);
  const citation = useWorkbench((s) => s.citationIndex);
  const selected = useWorkbench((s) => s.selectedNode);
  const select = useWorkbench((s) => s.select);
  const setFocus = useWorkbench((s) => s.setFocus);
  if (!graph || !layout) return null;

  const zones = zonesFor(layout.bounds);
  const rows = graph.entities
    .map((e) => {
      const p = layout.positions[e.id];
      return { e, zone: p ? zoneOf(p, zones) : '' };
    })
    .sort((a, b) => (a.zone.slice(1) + a.zone[0]).localeCompare(b.zone.slice(1) + b.zone[0]) || a.e.name.localeCompare(b.e.name));
  const name = (id: string) => graph.entities.find((e) => e.id === id)?.name ?? id;
  const th = 'border-b border-line-strong px-3 py-1.5 text-left text-[10px] font-normal uppercase tracking-[0.08em] text-ink-3';
  const td = 'border-b border-line px-3 py-1.5 align-top';

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse text-[13px]">
        <caption className="px-3 pb-1 pt-3 text-left text-xs text-ink-3">
          Entidades por zona de la lámina. Elegir una abre su ficha.
        </caption>
        <thead>
          <tr>
            <th scope="col" className={th}>Zona</th>
            <th scope="col" className={th}>Entidad</th>
            <th scope="col" className={th}>Tipo</th>
            <th scope="col" className={`${th} text-right`}>Conexiones</th>
            <th scope="col" className={th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ e, zone }) => {
            const v = visual[e.id] ?? 'idle';
            return (
              <tr key={e.id} className={v === 'cited' ? 'bg-markup **:text-on-markup!' : selected === e.id ? 'bg-paper-2' : ''}>
                <td className={`${td} font-mono tabular text-ink-3`}>{zone}</td>
                <td className={td}>
                  <button
                    type="button"
                    className="text-left font-medium text-ink hover:underline"
                    onClick={() => select(e.id)}
                    onFocus={() => setFocus(e.id)}
                    onBlur={() => setFocus(null)}
                  >
                    {e.name}
                  </button>
                </td>
                <td className={td}>
                  <span className="inline-flex items-center gap-1.5 text-ink-2">
                    <SymbolGlyph type={e.type} entity={e} size={16} />
                    {TYPE_LABEL[e.type]}
                  </span>
                </td>
                <td className={`${td} text-right font-mono tabular`}>{e.degree}</td>
                <td className={`${td} text-ink-2`}>
                  {STATE_TEXT[v]}
                  {v === 'cited' && citation[e.id] !== undefined ? ` (${citation[e.id]})` : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <table className="mt-4 w-full border-collapse text-[13px]">
        <caption className="px-3 pb-1 text-left text-xs text-ink-3">Relaciones</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>Origen</th>
            <th scope="col" className={th}>Relación</th>
            <th scope="col" className={th}>Destino</th>
          </tr>
        </thead>
        <tbody>
          {graph.relations.map((r) => (
            <tr key={r.id}>
              <td className={td}>{name(r.source)}</td>
              <td className={`${td} font-mono text-xs text-ink-2`}>{r.predicate}</td>
              <td className={td}>{name(r.target)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
