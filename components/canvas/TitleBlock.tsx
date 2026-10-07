'use client';
import { useWorkbench } from '@/lib/state/workbench';
import { useStatusWord } from './status';

const label = 'block text-[10px] uppercase tracking-[0.08em] text-ink-3';
const value = 'block truncate text-xs text-ink';
const cell = 'min-w-0 px-2 py-1';

/**
 * Cajetín de la lámina, ancho y bajo como el de un plano: qué documento es, qué contiene, con
 * qué modelo se extrajo y en qué estado está. La celda ESTADO se marca en lima mientras la IA
 * trabaja. En una lámina estrecha queda en una sola fila con lo esencial.
 */
export function TitleBlock({ compact = false }: { compact?: boolean }) {
  const source = useWorkbench((s) => s.source);
  const entities = useWorkbench((s) => s.graph?.entities.length ?? 0);
  const relations = useWorkbench((s) => s.graph?.relations.length ?? 0);
  const model = useWorkbench((s) => s.graph?.meta.model ?? '');
  const revision = useWorkbench((s) => s.highlight?.revision ?? null);
  const { word, active } = useStatusWord();

  const status = (
    <div className={`${cell} ${active ? 'bg-markup' : ''}`} role="status">
      <span className={active ? 'block text-[10px] uppercase tracking-[0.08em] text-ink' : label}>Estado</span>
      <span className="block text-xs font-semibold tracking-[0.04em] text-ink">{word}</span>
    </div>
  );
  const rev = (
    <div className={cell}>
      <span className={label}>Revisión</span>
      <span className={`${value} font-mono tabular`}>{revision ? `R${revision}` : 'Ninguna'}</span>
    </div>
  );

  if (compact) {
    return (
      <section aria-label="Cajetín" className="pointer-events-auto grid grid-cols-[auto_auto_auto] divide-x divide-line border border-line-strong bg-paper text-left">
        <div className={cell}>
          <span className={label}>Grafo</span>
          <span className={`${value} font-mono tabular`}>
            {entities} / {relations}
          </span>
        </div>
        {rev}
        {status}
      </section>
    );
  }

  return (
    <section
      aria-label="Cajetín"
      className="pointer-events-auto grid w-[28rem] max-w-full grid-cols-[4.5rem_5rem_minmax(0,1fr)_7.25rem] border border-line-strong bg-paper text-left"
    >
      <div className={`${cell} col-span-3 border-b border-r border-line`}>
        <span className={label}>Documento</span>
        <span className={`${value} font-medium`}>
          {source ? `${source.title}${source.kind === 'sample' ? ' (muestra grabada)' : ''}` : 'Sin documento'}
        </span>
      </div>
      <div className="border-b border-line">{status}</div>
      <div className={`${cell} border-r border-line`}>
        <span className={label}>Entidades</span>
        <span className={`${value} font-mono tabular`}>{entities}</span>
      </div>
      <div className={`${cell} border-r border-line`}>
        <span className={label}>Relaciones</span>
        <span className={`${value} font-mono tabular`}>{relations}</span>
      </div>
      <div className={`${cell} border-r border-line`}>
        <span className={label}>Modelo</span>
        <span className={`${value} font-mono`}>{model || 'Ninguno'}</span>
      </div>
      {rev}
    </section>
  );
}
