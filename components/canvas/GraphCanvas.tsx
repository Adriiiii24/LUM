'use client';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  ReactFlow, useNodesState, useReactFlow, useStore as useFlowStore,
  type AriaLabelConfig, type FitViewOptions, type NodeTypes, type EdgeTypes,
} from '@xyflow/react';
import { useReducedMotion } from 'motion/react';
import { CornersOut, MagnifyingGlassMinus, MagnifyingGlassPlus, TextAlignLeft } from '@phosphor-icons/react/dist/ssr';
import { useWorkbench, useWorkbenchApi } from '@/lib/state/workbench';
import { zoneOf, zonesFor } from '@/lib/graph/layout';
import { relationLabel } from '@/lib/graph/labels';
import type { NodeId } from '@/lib/graph/schema';
import { PanelHeader } from '@/components/workbench/PanelHeader';
import { ToolButton } from '@/components/ui/Button';
import { EntityNode } from './EntityNode';
import { RelationEdge } from './RelationEdge';
import { RULER, Rulers, ZoneGrid } from './Rulers';
import { TitleBlock } from './TitleBlock';
import { Legend } from './Legend';
import { EntityCard } from './EntityCard';
import { EntityList } from './EntityList';
import { ExtractingOverlay } from './ExtractingOverlay';
import { Graph3D } from './Graph3D';
import type { View } from '@/lib/state/workbench';
import { LabelLayer } from './LabelLayer';
import type { EntityFlowNode, RelationFlowEdge } from './flow-types';

const nodeTypes: NodeTypes = { entity: EntityNode };
const VIEWS: Array<[View, string]> = [
  ['sheet', 'Lámina'],
  ['space', '3D'],
  ['list', 'Lista'],
];
const edgeTypes: EdgeTypes = { relation: RelationEdge };
/**
 * React Flow describe en inglés acciones que aquí no existen (seleccionar, mover o borrar con el
 * teclado). Los nodos tienen su propio teclado (flechas entre botones), así que esas
 * descripciones se apagan (disableKeyboardA11y) y se vacían.
 */
const RF_LABELS: Partial<AriaLabelConfig> = { 'node.a11yDescription.default': '', 'edge.a11yDescription.default': '' };
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

function Sheet({ onPaneClick }: { onPaneClick: () => void }) {
  const graph = useWorkbench((s) => s.graph);
  const layout = useWorkbench((s) => s.layout);
  const documentId = useWorkbench((s) => s.documentId);
  const { fitView } = useReactFlow();
  const fit = useFit();

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
      // Sin arrastre ni selección, React Flow quitaría los eventos del puntero a la envoltura y el
      // botón de dentro (el control) dejaría de recibir el paso y el clic.
      style: { pointerEvents: 'all' },
      // La envoltura de React Flow no tiene rol: sin la descripción de rol en inglés («node»). El botón de dentro es el control.
      domAttributes: { 'aria-roledescription': undefined },
    }));
  }, [graph, layout, zones]);

  const edges = useMemo<RelationFlowEdge[]>(() => {
    const names = new Map((graph?.entities ?? []).map((e) => [e.id, e.name]));
    return (graph?.relations ?? []).map((relation) => ({
      id: relation.id,
      source: relation.source,
      target: relation.target,
      type: 'relation',
      data: { relation },
      selectable: false,
      focusable: false,
      // Cada arista se lee como su frase, con nombres: «Apolo 11 tuvo como comandante a Neil Armstrong».
      ariaLabel: relationLabel(relation, (id) => names.get(id) ?? id),
      domAttributes: { 'aria-roledescription': 'relación' },
    }));
  }, [graph]);

  const [nodes, setNodes, onNodesChange] = useNodesState<EntityFlowNode>(initial);
  useEffect(() => {
    setNodes(initial);
    const frame = requestAnimationFrame(() => void fitView({ ...fit, duration: 300 }));
    return () => cancelAnimationFrame(frame);
  }, [initial, documentId, setNodes, fitView, fit]);

  if (!zones) return null;
  return (
    <div className="absolute inset-0">
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
        // Los nodos no se mueven: las zonas de la lista, la ficha y las citas salen de su sitio en el
        // layout, y arrastrar no tendría alternativa de un solo puntero (WCAG 2.5.7).
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        disableKeyboardA11y
        ariaLabelConfig={RF_LABELS}
        zoomOnScroll={false}
        preventScrolling={false}
        zoomOnPinch
        onPaneClick={onPaneClick}
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

/** Al cambiar de nodo con una ficha ya abierta, un instante de reposo: así se cruzan otros nodos camino de la ficha. */
const SWITCH_MS = 150;
/**
 * Con el puntero fuera de la lámina (o un nodo fijado y el puntero fuera de la ficha), la vista
 * previa se va al poco: un segundo, lo que tarda un puntero lento en ir de una cita del chat a la lámina.
 */
const LEAVE_MS = 1000;

/**
 * Vista previa de la ficha (WCAG 1.4.13). Sale al pasar o enfocar un nodo o una cita; se queda
 * mientras el puntero esté sobre ella o, si no hay nada fijado, sobre la lámina, así que se puede
 * llevar el puntero hasta ella; y Escape la descarta aunque el foco esté en otra parte. No vuelve
 * a salir para ese nodo hasta que el foco o el puntero pasen a otro. Lo fijado con un clic manda
 * cuando no hay vista previa.
 */
function usePreview(box: RefObject<HTMLDivElement | null>, cardBox: RefObject<HTMLDivElement | null>) {
  const api = useWorkbenchApi();
  const focus = useWorkbench((s) => s.focusNode);
  const selected = useWorkbench((s) => s.selectedNode);
  const [id, setId] = useState<NodeId | null>(null);
  const [dismissed, setDismissed] = useState<NodeId | null>(null);
  const [inside, setInside] = useState(false);
  const [overCard, setOverCard] = useState(false);
  const [spaceSide, setSpaceSide] = useState<'left' | 'right'>('left');

  // Al cambiar el foco o la selección (ajuste durante el render, sin efecto).
  const [seen, setSeen] = useState({ focus, selected });
  if (seen.focus !== focus || seen.selected !== selected) {
    setSeen({ focus, selected });
    // Un nodo nuevo deja volver a salir la ficha descartada.
    if (focus !== seen.focus && focus !== dismissed) setDismissed(null);
    // Fijar o soltar una ficha manda sobre la vista previa.
    if (selected !== seen.selected) setId(null);
  }
  const hold = (overCard && id !== null) || (inside && selected === null);

  useEffect(() => {
    if (focus !== null && focus !== dismissed && focus !== id) {
      // Desde el teclado (o sin ficha abierta), al momento; con el puntero y otra ficha abierta, tras un instante.
      const active = document.activeElement;
      const fromKeys = active instanceof HTMLElement && active.dataset.nodeId === focus;
      const timer = setTimeout(() => {
        setId(focus);
        // En 3D la ficha va a la mitad contraria al nodo, medido en pantalla al abrirse.
        const node = box.current?.querySelector(`[data-graph3d] [data-node-id="${focus}"]`);
        const frame = box.current?.getBoundingClientRect();
        if (node && frame) {
          const r = node.getBoundingClientRect();
          setSpaceSide(r.left + r.width / 2 - frame.left < frame.width / 2 ? 'right' : 'left');
        }
      }, id === null || fromKeys ? 0 : SWITCH_MS);
      return () => clearTimeout(timer);
    }
    if (focus === null && id !== null && !hold) {
      const timer = setTimeout(() => setId(null), LEAVE_MS);
      return () => clearTimeout(timer);
    }
  }, [focus, id, dismissed, hold, box]);

  useEffect(() => {
    if (id === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setId(null);
      setDismissed(api.getState().focusNode);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, api]);

  return {
    id,
    spaceSide,
    /** Quita la vista previa y no la deja volver para ese nodo mientras siga en foco. */
    dismiss: (node: NodeId | null) => {
      setId(null);
      setDismissed(node);
    },
    pointer: {
      onPointerEnter: () => setInside(true),
      onPointerLeave: () => {
        setInside(false);
        setOverCard(false);
      },
      onPointerOver: (event: { target: EventTarget }) => {
        const over = !!cardBox.current?.contains(event.target as Node);
        if (over !== overCard) setOverCard(over);
      },
    },
  };
}

type Flow = Pick<ReturnType<typeof useReactFlow>, 'getViewport' | 'setViewport'>;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * El nodo con el foco de teclado, o el recién elegido desde la ficha, no queda fuera de la vista
 * ni tapado por la ficha (WCAG 2.4.11): la lámina se desplaza lo justo para dejarlo en la zona
 * libre (sin reglas, sin la fila del cajetín y debajo o al lado de la ficha).
 */
function keepInView(root: HTMLElement | null, card: Element | null, id: NodeId, flow: Flow, reduced: boolean) {
  const node = root?.querySelector(`.react-flow__node[data-id="${id}"]`);
  const pane = root?.querySelector('.react-flow');
  if (!node || !pane) return;
  const p = pane.getBoundingClientRect();
  const n = node.getBoundingClientRect();
  const c = card?.getBoundingClientRect();
  // Margen: el símbolo con su halo y sus esquineras. Abajo, la fila del cajetín y la leyenda.
  const m = 28;
  const free = { left: p.left + RULER + m, top: p.top + RULER + m, right: p.right - m, bottom: p.bottom - 64 - m };
  const cx = n.left + n.width / 2;
  const cy = n.top + n.height / 2;
  const underCard = !!c && c.height > 0 && cx > c.left - m && cx < c.right + m;
  let tx = clamp(cx, free.left, free.right);
  let ty = clamp(cy, underCard && c ? Math.max(free.top, c.bottom + m) : free.top, free.bottom);
  if (underCard && c && c.bottom + m > free.bottom) {
    // No cabe debajo de la ficha: a su lado, en la parte libre.
    ty = clamp(cy, free.top, free.bottom);
    tx = c.left - p.left > p.right - c.right ? clamp(cx, free.left, c.left - m) : clamp(cx, c.right + m, free.right);
  }
  if (Math.abs(tx - cx) < 1 && Math.abs(ty - cy) < 1) return;
  const vp = flow.getViewport();
  void flow.setViewport({ x: vp.x + tx - cx, y: vp.y + ty - cy, zoom: vp.zoom }, { duration: reduced ? 0 : 250 });
}

export function GraphCanvas() {
  const entities = useWorkbench((s) => s.graph?.entities.length ?? 0);
  const relations = useWorkbench((s) => s.graph?.relations.length ?? 0);
  const view = useWorkbench((s) => s.view);
  const setView = useWorkbench((s) => s.setView);
  const sourceOpen = useWorkbench((s) => s.sourceOpen);
  const setSourceOpen = useWorkbench((s) => s.setSourceOpen);
  const focus = useWorkbench((s) => s.focusNode);
  const selected = useWorkbench((s) => s.selectedNode);
  const select = useWorkbench((s) => s.select);
  const flow = useReactFlow();
  const { zoomIn, zoomOut, fitView } = flow;
  const reduced = !!useReducedMotion();
  const fit = useFit();
  const toggle = 'h-7 px-2 text-[11px] font-medium uppercase tracking-[0.06em]';

  const box = useRef<HTMLDivElement>(null);
  const cardBox = useRef<HTMLDivElement>(null);
  const preview = usePreview(box, cardBox);
  const cardId = preview.id ?? selected;
  // La ficha va en la mitad contraria a su nodo, para no taparlo ni a su vecindario. En la lámina,
  // con el encuadre de React Flow (vale para el puntero y para el teclado); en 3D, al abrirse.
  const cardAt = useWorkbench((s) => (cardId ? s.layout?.positions[cardId] : undefined));
  const sheetSide = useFlowStore((s) => (cardAt && s.width > 0 && cardAt.x * s.transform[2] + s.transform[0] < s.width / 2 ? 'right' : 'left'));
  const side = view === 'space' ? preview.spaceSide : sheetSide;

  useEffect(() => {
    if (view !== 'sheet' || focus === null) return;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || active.dataset.nodeId !== focus || !active.closest('.react-flow__node') || !active.matches(':focus-visible')) return;
    // Tras pintar la ficha, que puede cambiar en este mismo render.
    const frame = requestAnimationFrame(() => keepInView(box.current, cardBox.current?.firstElementChild ?? null, focus, flow, reduced));
    return () => cancelAnimationFrame(frame);
  }, [view, focus, cardId, flow, reduced]);

  const closeCard = () => {
    const id = cardId;
    const active = document.activeElement;
    const fromKeys = active instanceof HTMLElement && !!cardBox.current?.contains(active) && active.matches(':focus-visible');
    preview.dismiss(id);
    select(null);
    // El botón de cerrar desaparece: desde el teclado, el foco vuelve al nodo de la ficha (en 3D,
    // a la vista) sin volver a abrirla; si no, al título de la celda.
    const back = fromKeys
      ? box.current?.querySelector<HTMLElement>(`.react-flow__node button[data-node-id="${id}"]`) ?? box.current?.querySelector<HTMLElement>('[data-graph3d]')
      : null;
    (back ?? document.getElementById('panel-grafo'))?.focus();
  };

  const pickCard = (other: NodeId) => {
    select(other);
    // Navegar por las relaciones de la ficha también desplaza la vista: alternativa a arrastrar la lámina.
    if (view === 'sheet') requestAnimationFrame(() => keepInView(box.current, cardBox.current?.firstElementChild ?? null, other, flow, reduced));
  };

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
            sourceOpen ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2'
          }`}
        >
          <TextAlignLeft size={13} aria-hidden="true" />
          Fuente
        </button>
        <div role="group" aria-label="Vista" className="mr-1 flex border border-line-strong">
          {VIEWS.map(([id, label], i) => (
            <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}
              className={`${toggle} ${i > 0 ? 'border-l border-line-strong' : ''} ${view === id ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2'}`}>
              {label}
            </button>
          ))}
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

      <div ref={box} className="@container relative min-h-0 flex-1" {...preview.pointer}>
        <TraceDirector />
        {view === 'list' ? (
          <EntityList />
        ) : (
          <>
            {view === 'space' ? (
              <Graph3D />
            ) : (
              <Sheet
                onPaneClick={() => {
                  select(null);
                  preview.dismiss(null);
                }}
              />
            )}
            <div
              ref={cardBox}
              className={`pointer-events-none absolute z-20 ${side === 'left' ? 'left-7 @max-[36rem]:right-3' : 'right-7 @max-[36rem]:left-3'} ${view === 'space' && side === 'right' ? 'top-24' : 'top-7'}`}
            >
              <EntityCard id={cardId} onClose={closeCard} onPick={pickCard} />
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
