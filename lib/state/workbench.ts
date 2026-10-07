'use client';
import { createContext, useContext } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import type { ChatStatus } from 'ai';
import type { EdgeId, KnowledgeGraph, NodeId } from '../graph/schema.ts';
import type { GraphLayout } from '../graph/layout.ts';
import type { TraceStep } from '../graph/retrieve.ts';
import type { ApiErrorCode } from '../chat/types.ts';
import type { SampleFile } from '../sample/types.ts';

export type NodeVisual = 'idle' | 'dim' | 'seed' | 'traversed' | 'cited';
export type EdgeVisual = 'idle' | 'dim' | 'traversed' | 'cited';

export type SourceDoc = {
  kind: 'sample' | 'user';
  title: string;
  text: string;
  attribution?: SampleFile['attribution'];
};

/** Lo que la lámina tiene que mostrar de la revisión activa: su recorrido y sus citas. */
export type Highlight = {
  messageId: string;
  revision: number;
  steps: TraceStep[];
  cited: NodeId[];
  outOfContext: NodeId[];
  /** La respuesta ya terminó: la lámina se calma y solo queda en lima lo citado. */
  settled: boolean;
};

export type ExtractionState =
  | { phase: 'idle' }
  | { phase: 'running'; startedAt: number }
  | { phase: 'error'; code: ApiErrorCode | 'red' };

type Derived = {
  nodeVisual: Partial<Record<NodeId, NodeVisual>>;
  edgeVisual: Partial<Record<EdgeId, EdgeVisual>>;
  /** Paso del recorrido en que entró cada nodo: las aristas se trazan desde el que llegó antes. */
  nodeStep: Partial<Record<NodeId, number>>;
  citationIndex: Partial<Record<NodeId, number>>;
  /**
   * Mientras se recorre y se escribe la respuesta, todo lo visitado se marca en lima.
   * Al terminar, la lima se queda solo en lo citado: es en lo que se apoya la respuesta.
   */
  tracing: boolean;
};

export type WorkbenchState = Derived & {
  sample: SampleFile;
  source: SourceDoc | null;
  graph: KnowledgeGraph | null;
  layout: GraphLayout | null;
  /** Cambia con cada documento nuevo: el chat lo usa para empezar de cero. */
  documentId: number;
  extraction: ExtractionState;
  chatStatus: ChatStatus;
  highlight: Highlight | null;
  /** Cuántos pasos del recorrido activo se han dibujado ya: la animación los revela de uno en uno. */
  revealed: number;
  focusNode: NodeId | null;
  selectedNode: NodeId | null;
  view: 'sheet' | 'list';
  /** En móvil: grafo y preguntas a la vez, o la fuente. En tableta: si la fuente está desplegada. */
  mobilePanel: 'sheet' | 'source';
  sourceOpen: boolean;

  showSample: () => void;
  setDocument: (source: SourceDoc, graph: KnowledgeGraph, layout: GraphLayout) => void;
  setExtraction: (state: ExtractionState) => void;
  setChatStatus: (status: ChatStatus) => void;
  setHighlight: (highlight: Highlight | null) => void;
  replayHighlight: () => void;
  revealNext: () => void;
  revealAll: () => void;
  setFocus: (id: NodeId | null) => void;
  select: (id: NodeId | null) => void;
  setView: (view: 'sheet' | 'list') => void;
  setMobilePanel: (panel: 'sheet' | 'source') => void;
  setSourceOpen: (open: boolean) => void;
};

const EMPTY_DERIVED: Derived = { nodeVisual: {}, edgeVisual: {}, nodeStep: {}, citationIndex: {}, tracing: false };

/** Estado visual de cada nodo y arista a partir de la revisión activa y de lo ya revelado. */
function derive(graph: KnowledgeGraph | null, highlight: Highlight | null, revealed: number): Derived {
  if (!graph || !highlight) return EMPTY_DERIVED;
  const tracing = !highlight.settled || revealed < highlight.steps.length;
  const visible = highlight.steps.slice(0, revealed);
  const nodeStep: Derived['nodeStep'] = {};
  for (const step of visible) for (const id of step.nodes) nodeStep[id] ??= step.step;
  const traversedEdges = new Set(visible.flatMap((s) => s.edges));
  const cited = new Set(highlight.cited);
  const citationIndex: Derived['citationIndex'] = {};
  highlight.cited.forEach((id, i) => {
    citationIndex[id] = i + 1;
  });

  const nodeVisual: Derived['nodeVisual'] = {};
  for (const e of graph.entities) {
    if (cited.has(e.id)) nodeVisual[e.id] = 'cited';
    else if (nodeStep[e.id] === 0) nodeVisual[e.id] = 'seed';
    else if (nodeStep[e.id] !== undefined) nodeVisual[e.id] = 'traversed';
    else nodeVisual[e.id] = 'dim';
  }
  const edgeVisual: Derived['edgeVisual'] = {};
  for (const r of graph.relations) {
    if (!traversedEdges.has(r.id)) edgeVisual[r.id] = 'dim';
    else edgeVisual[r.id] = cited.has(r.source) && cited.has(r.target) ? 'cited' : 'traversed';
  }
  return { nodeVisual, edgeVisual, nodeStep, citationIndex, tracing };
}

const sampleDoc = (sample: SampleFile): SourceDoc => ({
  kind: 'sample',
  title: sample.title,
  text: sample.text,
  attribution: sample.attribution,
});

/** Un almacén por instancia del banco de trabajo: nada de estado compartido entre peticiones en el servidor. */
export function createWorkbenchStore(sample: SampleFile): StoreApi<WorkbenchState> {
  return createStore<WorkbenchState>()((set, get) => ({
    ...EMPTY_DERIVED,
    sample,
    source: sampleDoc(sample),
    graph: sample.graph,
    layout: sample.layout,
    documentId: 0,
    extraction: { phase: 'idle' },
    chatStatus: 'ready',
    highlight: null,
    revealed: 0,
    focusNode: null,
    selectedNode: null,
    view: 'sheet',
    mobilePanel: 'sheet',
    sourceOpen: false,

    showSample: () =>
      set((s) => ({
        source: sampleDoc(s.sample),
        graph: s.sample.graph,
        layout: s.sample.layout,
        documentId: s.documentId + 1,
        highlight: null,
        revealed: 0,
        focusNode: null,
        selectedNode: null,
        extraction: { phase: 'idle' },
        ...EMPTY_DERIVED,
      })),

    setDocument: (source, graph, layout) =>
      set((s) => ({
        source,
        graph,
        layout,
        documentId: s.documentId + 1,
        highlight: null,
        revealed: 0,
        focusNode: null,
        selectedNode: null,
        extraction: { phase: 'idle' },
        ...EMPTY_DERIVED,
      })),

    setExtraction: (extraction) => set({ extraction }),

    setChatStatus: (chatStatus) => set({ chatStatus }),

    setHighlight: (highlight) => {
      const previous = get().highlight;
      // Una revisión distinta vuelve a trazar su recorrido desde el principio.
      const restart = !highlight || highlight.messageId !== previous?.messageId;
      const revealed = restart ? 0 : Math.min(get().revealed, highlight.steps.length);
      set({ highlight, revealed, ...derive(get().graph, highlight, revealed) });
    },

    replayHighlight: () => {
      const { highlight, graph } = get();
      if (!highlight) return;
      set({ revealed: 0, ...derive(graph, highlight, 0) });
    },

    revealNext: () => {
      const { highlight, revealed, graph } = get();
      if (!highlight || revealed >= highlight.steps.length) return;
      set({ revealed: revealed + 1, ...derive(graph, highlight, revealed + 1) });
    },

    revealAll: () => {
      const { highlight, graph } = get();
      if (!highlight) return;
      set({ revealed: highlight.steps.length, ...derive(graph, highlight, highlight.steps.length) });
    },

    setFocus: (focusNode) => set({ focusNode }),
    select: (selectedNode) => set({ selectedNode }),
    setView: (view) => set({ view }),
    setMobilePanel: (mobilePanel) => set({ mobilePanel }),
    setSourceOpen: (sourceOpen) => set({ sourceOpen }),
  }));
}

export const WorkbenchContext = createContext<StoreApi<WorkbenchState> | null>(null);

export function useWorkbenchApi(): StoreApi<WorkbenchState> {
  const store = useContext(WorkbenchContext);
  if (!store) throw new Error('useWorkbench fuera de <Workbench>');
  return store;
}

export function useWorkbench<T>(selector: (state: WorkbenchState) => T): T {
  return useStore(useWorkbenchApi(), selector);
}
