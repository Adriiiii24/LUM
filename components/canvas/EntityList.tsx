'use client';
import { Fragment, useId, useRef } from 'react';
import { CaretRight } from '@phosphor-icons/react/dist/ssr';
import { useWorkbench } from '@/lib/state/workbench';
import { zoneOf, zonesFor } from '@/lib/graph/layout';
import type { NodeId } from '@/lib/graph/schema';
import { SymbolGlyph, TYPE_LABEL } from './EntitySymbol';
import { EntityCard } from './EntityCard';

const STATE_TEXT = { idle: '', dim: '', seed: 'Semilla', traversed: 'Recorrida', cited: 'Citada' } as const;
/** Estado de una relación, como en la lámina: discontinua al recorrerse, continua entre dos citadas. */
const EDGE_STATE_TEXT = { idle: '', dim: '', traversed: 'Recorrida', cited: 'Recorrida, entre citadas' } as const;

/**
 * Alternativa no visual de la lámina: las mismas entidades y relaciones, en tablas, con su estado.
 * Elegir una entidad despliega su ficha justo debajo de su fila, con la misma información que en
 * la lámina (descripción, cita y relaciones).
 */
export function EntityList() {
  const graph = useWorkbench((s) => s.graph);
  const layout = useWorkbench((s) => s.layout);
  const visual = useWorkbench((s) => s.nodeVisual);
  const edgeVisual = useWorkbench((s) => s.edgeVisual);
  const citation = useWorkbench((s) => s.citationIndex);
  const selected = useWorkbench((s) => s.selectedNode);
  const select = useWorkbench((s) => s.select);
  const setFocus = useWorkbench((s) => s.setFocus);
  const list = useRef<HTMLDivElement>(null);
  const cardId = useId();
  if (!graph || !layout) return null;

  const zones = zonesFor(layout.bounds);
  const rows = graph.entities
    .map((e) => {
      const p = layout.positions[e.id];
      return { e, zone: p ? zoneOf(p, zones) : '' };
    })
    .sort((a, b) => (a.zone.slice(1) + a.zone[0]).localeCompare(b.zone.slice(1) + b.zone[0]) || a.e.name.localeCompare(b.e.name));
  const name = (id: string) => graph.entities.find((e) => e.id === id)?.name ?? id;
  // La ficha cambia de fila al cerrarla o al saltar a una relación: el foco va a la fila de la entidad.
  const focusRow = (id: NodeId) => list.current?.querySelector<HTMLElement>(`button[data-node-id="${id}"]`)?.focus();
  const th = 'border-b border-line-strong px-3 py-1.5 text-left text-[10px] font-normal uppercase tracking-[0.08em] text-ink-3';
  const td = 'border-b border-line px-3 py-1.5 align-top';

  return (
    // Zona con scroll propio: enfocable para llegar con el teclado a la tabla de relaciones, que no tiene controles.
    <div
      ref={list}
      role="region"
      aria-label="Entidades y relaciones"
      tabIndex={0}
      className="h-full overflow-auto focus-visible:outline-offset-[-2px]"
    >
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
            const open = selected === e.id;
            return (
              <Fragment key={e.id}>
                {/* Sobre la lima, también el foco va en la tinta fija: la del tema es hueso en oscuro (1,15:1). */}
                <tr className={v === 'cited' ? 'bg-markup **:text-on-markup! [&_:focus-visible]:outline-on-markup' : open ? 'bg-paper-2' : ''}>
                  <td className={`${td} font-mono tabular text-ink-3`}>{zone}</td>
                  <td className={td}>
                    <button
                      type="button"
                      data-node-id={e.id}
                      aria-expanded={open}
                      aria-controls={open ? cardId : undefined}
                      className="inline-flex items-center gap-1.5 text-left font-medium text-ink hover:underline"
                      onClick={() => select(open ? null : e.id)}
                      onFocus={() => setFocus(e.id)}
                      onBlur={() => setFocus(null)}
                    >
                      <CaretRight size={10} weight="bold" aria-hidden="true" className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`} />
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
                {open && (
                  <tr>
                    <td id={cardId} colSpan={5} className="border-b border-line px-3 py-2">
                      <EntityCard
                        id={e.id}
                        inline
                        onClose={() => {
                          focusRow(e.id);
                          select(null);
                        }}
                        onPick={(other) => {
                          focusRow(other);
                          select(other);
                        }}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
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
            <th scope="col" className={th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {graph.relations.map((r) => (
            <tr key={r.id}>
              <td className={td}>{name(r.source)}</td>
              <td className={`${td} font-mono text-xs text-ink-2`}>{r.predicate}</td>
              <td className={td}>{name(r.target)}</td>
              <td className={`${td} text-ink-2`}>{EDGE_STATE_TEXT[edgeVisual[r.id] ?? 'idle']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
