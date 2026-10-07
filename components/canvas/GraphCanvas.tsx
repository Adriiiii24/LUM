'use client';
import { useEffect, useMemo, useRef } from 'react';
import { ReactFlow, useNodesState, useReactFlow, useStore as useFlowStore, useStoreApi, type FitViewOptions, type NodeTypes, type EdgeTypes } from '@xyflow/react';
import { useReducedMotion } from 'motion/react';
import { CornersOut, MagnifyingGlassMinus, MagnifyingGlassPlus, TextAlignLeft } from '@phosphor-icons/react/dist/ssr';
import { useWorkbench } from '@/lib/state/workbench';
import { zoneOf, zonesFor } from '@/lib/graph/layout';
import { PanelHeader } from '@/components/workbench/PanelHeader';
import { ToolButton } from '@/components/ui/Button';
import { EntityNode } from './EntityNode';
import { RelationEdge } from './RelationEdge';
import { Rulers, ZoneGrid } from './Rulers';
import { TitleBlock } from './TitleBlock';
import { Legend } from './Legend';
import { EntityCard } from './EntityCard';
import { EntityList } from './EntityList';
import { ExtractingOverlay } from './ExtractingOverlay';
import { LabelLayer } from './LabelLayer';
import type { EntityFlowNode, RelationFlowEdge } from './flow-types';

const nodeTypes: NodeTypes = { entity: EntityNode };
const edgeTypes: EdgeTypes = { relation: RelationEdge };
/**
 * Encaje con hueco para lo que flota encima: reglas arriba y a la izquierda, y abajo la fila del
 * cajetín (ancho y bajo) con el botón de la leyenda. Los laterales dejan sitio a las etiquetas.
 */
function useFit(): FitViewOptions {
  const narrow = useFlowStore((s) => s.width > 0 && s.width < 608);
  return useMemo(
    () => ({
      padding: narrow
        ? { top: '34px', left: '52px', right: '40px', bottom: '64px' }
        : { top: '40px', left: '72px', right: '64px', bottom: '108px' },
    }),
    [narrow],
  );
}

/**
 * Publica el zoom como variable CSS sin volver a renderizar los nodos: las etiquetas la usan
 * para no encogerse por debajo de un tamaño legible cuando la lámina se aleja.
 */
function useZoomVariable() {
  const store = useStoreApi();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const apply = (zoom: number) => ref.current?.style.setProperty('--nc-zoom', String(zoom));
    apply(store.getState().transform[2]);
    return store.subscribe((state) => apply(state.transform[2]));
  }, [store]);
  return ref;
}
/** Ritmo del trazado: cada salto se dibuja en 280 ms y el siguiente arranca a los 420. */
const STEP_MS = 420;

/** Revela el recorrido de la revisión activa paso a paso; con movimiento reducido, de golpe. */
function TraceDirector() {
  const steps = useWorkbench((s) => s.highlight?.steps.length ?? 0);
  const messageId = useWorkbench((s) => s.highlight?.messageId);
  const revealed = useWorkbench((s) => s.revealed);
  const revealNext = useWorkbench((s) => s.revealNext);
  const revealAll = useWorkbench((s) => s.revealAll);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!messageId || revealed >= steps) return;
    if (reduced) {
      revealAll();
      return;
    }
    const timer = setTimeout(revealNext, revealed === 0 ? 40 : STEP_MS);
    return () => clearTimeout(timer);
  }, [messageId, steps, revealed, reduced, revealNext, revealAll]);
  return null;
}

function Sheet() {
  const graph = useWorkbench((s) => s.graph);
  const layout = useWorkbench((s) => s.layout);
  const documentId = useWorkbench((s) => s.documentId);
  const select = useWorkbench((s) => s.select);
  const { fitView } = useReactFlow();
  const fit = useFit();
  const zoomRef = useZoomVariable();

  const zones = useMemo(() => (layout ? zonesFor(layout.bounds) : null), [layout]);
  const initial = useMemo<EntityFlowNode[]>(() => {
    if (!graph || !layout || !zones) return [];
    const placed = graph.entities.map((entity) => {
      const position = layout.positions[entity.id] ?? { x: 0, y: 0 };
      return { entity, position, zone: zoneOf(position, zones) };
    });
    // Orden de lectura del teclado: por zonas, de izquierda a derecha y de arriba abajo.
    placed.sort((a, b) => a.zone.slice(1).localeCompare(b.zone.slice(1)) || a.position.x - b.position.x);
    return placed.map(({ entity, position, zone }, order) => ({
      id: entity.id,
      type: 'entity',
      position,
      data: { entity, zone, order },
    }));
  }, [graph, layout, zones]);

  const edges = useMemo<RelationFlowEdge[]>(
    () => (graph?.relations ?? []).map((relation) => ({
      id: relation.id,
      source: relation.source,
      target: relation.target,
      type: 'relation',
      data: { relation },
      selectable: false,
      focusable: false,
    })),
    [graph],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<EntityFlowNode>(initial);
  useEffect(() => {
    setNodes(initial);
    const frame = requestAnimationFrame(() => void fitView({ ...fit, duration: 300 }));
    return () => cancelAnimationFrame(frame);
  }, [initial, documentId, setNodes, fitView, fit]);

  if (!zones) return null;
  return (
    <div ref={zoomRef} className="absolute inset-0">
      <ReactFlow<EntityFlowNode, RelationFlowEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodeOrigin={[0.5, 0.5]}
        fitView
        fitViewOptions={fit}
        minZoom={0.3}
        maxZoom={2.5}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        preventScrolling={false}
        zoomOnPinch
        onPaneClick={() => select(null)}
        attributionPosition="top-right"
        aria-label="Lámina del grafo. Usa Tab para entrar en los nodos y las flechas para recorrerlos."
      >
        <ZoneGrid zones={zones} />
        <LabelLayer nodes={nodes} />
      </ReactFlow>
      <Rulers zones={zones} />
    </div>
  );
}

export function GraphCanvas() {
  const entities = useWorkbench((s) => s.graph?.entities.length ?? 0);
  const relations = useWorkbench((s) => s.graph?.relations.length ?? 0);
  const view = useWorkbench((s) => s.view);
  const setView = useWorkbench((s) => s.setView);
  const sourceOpen = useWorkbench((s) => s.sourceOpen);
  const setSourceOpen = useWorkbench((s) => s.setSourceOpen);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const fit = useFit();
  const toggle = 'h-7 px-2 text-[11px] font-medium uppercase tracking-[0.06em]';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader id="panel-grafo" title="Grafo" meta={`${entities} entidades, ${relations} relaciones`}>
        <button
          id="abrir-fuente"
          type="button"
          aria-expanded={sourceOpen}
          aria-controls="celda-source"
          onClick={() => setSourceOpen(!sourceOpen)}
          className={`${toggle} mr-1 inline-flex items-center gap-1.5 border border-line-strong max-md:hidden xl:hidden ${
            sourceOpen ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper'
          }`}
        >
          <TextAlignLeft size={13} aria-hidden="true" />
          Fuente
        </button>
        <div role="group" aria-label="Vista" className="mr-1 flex border border-line-strong">
          <button type="button" aria-pressed={view === 'sheet'} onClick={() => setView('sheet')}
            className={`${toggle} ${view === 'sheet' ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper'}`}>
            Lámina
          </button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}
            className={`${toggle} border-l border-line-strong ${view === 'list' ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper'}`}>
            Lista
          </button>
        </div>
        <ToolButton aria-label="Alejar" onClick={() => void zoomOut({ duration: 200 })} disabled={view !== 'sheet'}>
          <MagnifyingGlassMinus size={16} aria-hidden="true" />
        </ToolButton>
        <ToolButton aria-label="Acercar" onClick={() => void zoomIn({ duration: 200 })} disabled={view !== 'sheet'}>
          <MagnifyingGlassPlus size={16} aria-hidden="true" />
        </ToolButton>
        <ToolButton aria-label="Encajar el grafo" onClick={() => void fitView({ ...fit, duration: 300 })} disabled={view !== 'sheet'}>
          <CornersOut size={16} aria-hidden="true" />
        </ToolButton>
      </PanelHeader>

      <div className="@container relative min-h-0 flex-1">
        <TraceDirector />
        {view === 'list' ? (
          <EntityList />
        ) : (
          <>
            <Sheet />
            <div className="pointer-events-none absolute left-7 top-7 z-20 @max-[36rem]:right-3">
              <EntityCard />
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-end justify-between gap-3">
              <Legend />
              <div className="ml-auto hidden @[38rem]:block">
                <TitleBlock />
              </div>
              <div className="ml-auto @[38rem]:hidden">
                <TitleBlock compact />
              </div>
            </div>
          </>
        )}
        <ExtractingOverlay />
      </div>
    </div>
  );
}
