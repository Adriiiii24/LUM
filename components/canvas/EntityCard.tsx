'use client';
import { X } from '@phosphor-icons/react/dist/ssr';
import { useWorkbench } from '@/lib/state/workbench';
import { zoneOf, zonesFor } from '@/lib/graph/layout';
import { SymbolGlyph, TYPE_LABEL } from './EntitySymbol';

/**
 * Ficha de la entidad en foco o seleccionada: qué es, de qué frase sale y con qué se relaciona.
 * Al pasar por un nodo sale como vista previa; al pulsarlo se fija. Las relaciones se leen aquí
 * y no sobre las aristas, donde en un nodo con muchas se pisaban.
 */
export function EntityCard() {
  const selected = useWorkbench((s) => s.selectedNode);
  const shown = useWorkbench((s) => s.focusNode ?? s.selectedNode);
  const graph = useWorkbench((s) => s.graph);
  const layout = useWorkbench((s) => s.layout);
  const text = useWorkbench((s) => s.source?.text ?? '');
  const select = useWorkbench((s) => s.select);
  const entity = graph?.entities.find((e) => e.id === shown);
  const pinned = shown === selected;
  if (!graph || !layout || !entity) return null;

  const position = layout.positions[entity.id];
  const zone = position ? zoneOf(position, zonesFor(layout.bounds)) : '';
  const name = (id: string) => graph.entities.find((e) => e.id === id)?.name ?? id;
  const links = graph.relations
    .filter((r) => r.source === entity.id || r.target === entity.id)
    .slice(0, 10)
    .map((r) => (r.source === entity.id
      ? { id: r.id, other: r.target, before: '', predicate: r.predicate, after: name(r.target) }
      : { id: r.id, other: r.source, before: name(r.source), predicate: r.predicate, after: '' }));

  return (
    <section
      aria-label={`Ficha de ${entity.name}`}
      className="pointer-events-auto w-[19rem] max-w-[calc(100%-2rem)] border border-line-strong bg-paper shadow-float"
    >
      <header className="flex items-start gap-2 border-b border-line px-3 py-2">
        <SymbolGlyph type={entity.type} entity={entity} size={20} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-ink">{entity.name}</h3>
          <p className="text-[11px] text-ink-3">
            {TYPE_LABEL[entity.type]} en <span className="font-mono">{zone}</span>, {entity.degree}{' '}
            {entity.degree === 1 ? 'conexión' : 'conexiones'}
          </p>
        </div>
        {pinned ? <button
          type="button"
          onClick={() => select(null)}
          aria-label="Cerrar la ficha"
          className="-mr-1 grid size-7 shrink-0 place-items-center text-ink-2 hover:bg-paper-2 hover:text-ink"
        >
          <X size={14} weight="bold" aria-hidden="true" />
        </button> : <span className="caps shrink-0 pt-1 text-ink-3">pulsa para fijar</span>}
      </header>
      <div className="space-y-2 px-3 py-2 text-[13px] leading-snug text-ink-2">
        {entity.description && <p>{entity.description}</p>}
        <figure className="border-l border-ink pl-2">
          <figcaption className="text-[10px] uppercase tracking-[0.08em] text-ink-3">En el texto</figcaption>
          {entity.evidence ? (
            <blockquote className="text-ink">«{text.slice(entity.evidence.start, entity.evidence.end)}»</blockquote>
          ) : (
            <p className="italic">Sin cita verificada: la frase que dio el modelo no aparece en el texto.</p>
          )}
        </figure>
        {links.length > 0 && (
          <ul className="divide-y divide-line border-t border-line text-xs">
            {links.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => select(l.other)} className="w-full py-1 text-left hover:bg-paper-2">
                  {l.before && <span className="font-medium text-ink">{l.before} </span>}
                  <span className="text-ink-2">{l.predicate}</span>
                  {l.after && <span className="font-medium text-ink"> {l.after}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
