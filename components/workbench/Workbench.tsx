'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { MotionConfig } from 'motion/react';
import { WorkbenchContext, createWorkbenchStore, useWorkbench } from '@/lib/state/workbench';
import type { SampleFile } from '@/lib/sample/types';
import { GraphCanvas } from '@/components/canvas/GraphCanvas';
import { SourcePanel } from '@/components/source/SourcePanel';
import { ChatPanel } from '@/components/chat/ChatPanel';

const TABS = [
  { id: 'sheet', label: 'Grafo y preguntas' },
  { id: 'source', label: 'Fuente' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const TABLET = '(min-width: 48rem) and (max-width: 79.99rem)';

/** Conmutador de móvil: el grafo con las preguntas debajo, o la fuente. */
function MobileTabs() {
  const panel = useWorkbench((s) => s.mobilePanel);
  const setPanel = useWorkbench((s) => s.setMobilePanel);
  return (
    <div role="group" aria-label="Vista" className="grid shrink-0 grid-cols-2 border-b border-line md:hidden">
      {TABS.map((t, i) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={panel === t.id}
          onClick={() => setPanel(t.id)}
          className={`h-10 text-[11px] font-semibold uppercase tracking-[0.08em] ${i > 0 ? 'border-l border-line' : ''} ${
            panel === t.id ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Las tres celdas. En móvil, el grafo y las preguntas se apilan para que el recorrido se vea
 * mientras se escribe la respuesta; la fuente es la otra vista. La fuente se monta una sola
 * vez y cambia de sitio con el ancho: vista en móvil, cajón sobre el grafo en tableta y
 * primera columna en escritorio.
 */
function Cells() {
  const panel = useWorkbench((s) => s.mobilePanel);
  const sourceOpen = useWorkbench((s) => s.sourceOpen);
  const setSourceOpen = useWorkbench((s) => s.setSourceOpen);
  const sourceCell = useRef<HTMLElement>(null);
  const onMobile = (id: TabId) => (panel === id ? 'flex' : 'hidden');

  useEffect(() => {
    if (!sourceOpen || !window.matchMedia(TABLET).matches) return;
    sourceCell.current?.querySelector<HTMLElement>('button, a, textarea')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSourceOpen(false);
      document.getElementById('abrir-fuente')?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sourceOpen, setSourceOpen]);

  const close = () => {
    setSourceOpen(false);
    document.getElementById('abrir-fuente')?.focus();
  };

  return (
    <div
      className={`relative grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_20rem] md:grid-rows-1 xl:grid-cols-[22rem_minmax(0,1fr)_24rem] ${
        panel === 'sheet' ? 'grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)]' : 'grid-rows-1'
      }`}
    >
      <section
        ref={sourceCell}
        id="celda-source"
        aria-labelledby="panel-fuente"
        className={[
          onMobile('source'),
          'min-h-0 flex-col bg-paper',
          'md:absolute md:inset-y-0 md:left-0 md:z-40 md:w-[22rem] md:max-w-[85%] md:border-r md:border-line-strong md:shadow-float',
          sourceOpen ? 'md:flex' : 'md:hidden',
          'xl:static xl:z-auto xl:flex xl:w-auto xl:max-w-none xl:border-line xl:shadow-none',
        ].join(' ')}
      >
        <SourcePanel onClose={close} />
      </section>
      <section id="celda-sheet" aria-labelledby="panel-grafo" className={`${onMobile('sheet')} relative min-h-0 flex-col md:flex`}>
        <GraphCanvas />
      </section>
      <section
        id="celda-chat"
        aria-labelledby="panel-preguntas"
        className={`${onMobile('sheet')} min-h-0 flex-col border-t border-line md:flex md:border-l md:border-t-0`}
      >
        <ChatPanel />
      </section>
    </div>
  );
}

/** La lámina completa: cabecera y tres celdas, en un marco a 0,8 rem del borde de la ventana. */
export function Workbench({ sample, masthead }: { sample: SampleFile; masthead: ReactNode }) {
  const [store] = useState(() => createWorkbenchStore(sample));
  return (
    <WorkbenchContext.Provider value={store}>
      <ReactFlowProvider>
        <MotionConfig reducedMotion="user">
          <div className="h-dvh min-h-[38rem] md:p-[0.8rem]">
            <div className="flex h-full flex-col border-line-strong bg-paper md:border">
              {masthead}
              <MobileTabs />
              <Cells />
            </div>
          </div>
        </MotionConfig>
      </ReactFlowProvider>
    </WorkbenchContext.Provider>
  );
}
