'use client';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { ArrowClockwise, PaperPlaneRight, Stop } from '@phosphor-icons/react/dist/ssr';
import { useWorkbench, useWorkbenchApi } from '@/lib/state/workbench';
import { NeuralTransport } from '@/lib/chat/transport';
import { segmentAnswer, type SegmentedAnswer } from '@/lib/chat/citations';
import { ERROR_COPY, errorCodeOf } from '@/lib/chat/error-copy';
import { chatAnnouncement } from '@/lib/state/announce';
import type { NCMessage } from '@/lib/chat/types';
import type { TraceStep } from '@/lib/graph/retrieve';
import type { NodeId } from '@/lib/graph/schema';
import { PanelHeader } from '@/components/workbench/PanelHeader';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { AnswerText } from './AnswerText';
import { RevisionMark } from './RevisionMark';

type Revision = {
  number: number;
  question: string;
  answer: NCMessage | null;
  steps: TraceStep[];
  segmented: SegmentedAnswer;
  done: boolean;
};

const textOf = (m: NCMessage) => m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
const stepsOf = (m: NCMessage | null): TraceStep[] =>
  (m?.parts ?? []).flatMap((p) => (p.type === 'data-trace' ? [p.data] : [])).sort((a, b) => a.step - b.step);

/** Empareja preguntas y respuestas: cada par es una revisión de la lámina. */
function toRevisions(messages: NCMessage[], streaming: boolean): Revision[] {
  const out: Revision[] = [];
  messages.forEach((m, i) => {
    if (m.role !== 'user') return;
    const next = messages[i + 1];
    const answer = next?.role === 'assistant' ? next : null;
    const steps = stepsOf(answer);
    const context = new Set<NodeId>(steps.flatMap((s) => s.nodes));
    const done = answer !== null && !(streaming && i + 1 === messages.length - 1);
    out.push({
      number: out.length + 1,
      question: textOf(m),
      answer,
      steps,
      segmented: segmentAnswer(answer ? textOf(answer) : '', context, done),
      done,
    });
  });
  return out;
}

function suggestionsFor(entities: { name: string; degree: number }[]): string[] {
  const [a, b] = [...entities].sort((x, y) => y.degree - x.degree);
  if (!a) return [];
  return b ? [`¿Qué relación hay entre ${a.name} y ${b.name}?`, `¿Qué se cuenta de ${a.name}?`] : [`¿Qué se cuenta de ${a.name}?`];
}

export function ChatPanel() {
  const store = useWorkbenchApi();
  const [transport] = useState(() => new NeuralTransport(store));
  const { messages, sendMessage, status, error, stop, setMessages, regenerate, clearError } = useChat<NCMessage>({
    // Id fijo: sin él, useChat genera uno aleatorio durante el prerender y Next lo rechaza.
    id: 'lum',
    transport,
    experimental_throttle: 40,
  });

  const graph = useWorkbench((s) => s.graph);
  const source = useWorkbench((s) => s.source);
  const sample = useWorkbench((s) => s.sample);
  const documentId = useWorkbench((s) => s.documentId);
  const extractionRunning = useWorkbench((s) => s.extraction.phase === 'running');
  const revealed = useWorkbench((s) => s.revealed);
  const activeMessage = useWorkbench((s) => s.highlight?.messageId ?? null);
  const setChatStatus = useWorkbench((s) => s.setChatStatus);
  const setMobilePanel = useWorkbench((s) => s.setMobilePanel);
  const setHighlight = useWorkbench((s) => s.setHighlight);
  const replayHighlight = useWorkbench((s) => s.replayHighlight);
  const announce = useWorkbench((s) => s.announce);

  const [draft, setDraft] = useState('');
  // La revisión fijada pertenece a un documento: al cambiar de documento deja de valer sola.
  const [pin, setPin] = useState<{ doc: number; id: string } | null>(null);
  const pinned = pin?.doc === documentId ? pin.id : null;
  const thread = useRef<HTMLDivElement>(null);
  // Preguntar y Detener son el mismo botón: nunca se desmonta y recoge el foco de lo que desaparece.
  const action = useRef<HTMLButtonElement>(null);
  const fieldId = useId();
  const hintId = useId();

  const streaming = status === 'streaming' || status === 'submitted';
  const revisions = useMemo(() => toRevisions(messages, streaming), [messages, streaming]);

  useEffect(() => setChatStatus(status), [status, setChatStatus]);

  // Documento nuevo: conversación nueva.
  useEffect(() => {
    void stop();
    setMessages([]);
    setHighlight(null);
  }, [documentId, stop, setMessages, setHighlight]);

  // La lámina muestra la revisión fijada o, si no hay, la última.
  const shown = revisions.find((r) => r.answer?.id === pinned) ?? revisions.findLast((r) => r.answer !== null) ?? null;
  const highlightKey = shown?.answer
    ? `${shown.answer.id}|${shown.steps.length}|${shown.segmented.cited.join()}|${shown.segmented.outOfContext.join()}|${shown.done}`
    : '';
  useEffect(() => {
    if (!shown?.answer) return;
    setHighlight({
      messageId: shown.answer.id,
      revision: shown.number,
      steps: shown.steps,
      cited: shown.segmented.cited,
      outOfContext: shown.segmented.outOfContext,
      settled: shown.done,
    });
    // highlightKey resume todo lo que cambia de la revisión mostrada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightKey, setHighlight]);

  // Anuncio para lectores de pantalla: se deriva del estado y lo lee la región de estado del banco
  // de trabajo, la única, que sigue montada aunque en móvil se vea la fuente.
  const last = revisions.at(-1);
  const announcement = chatAnnouncement(
    status,
    last && { number: last.number, done: last.done, answered: last.answer !== null, cited: last.segmented.cited.length },
  );
  useEffect(() => {
    if (announcement) announce(announcement);
  }, [announcement, announce]);

  // Mientras se escribe, la respuesta sigue al final; al terminar, se muestra el final de la última
  // respuesta (su pie), no el final de la lista con las preguntas pendientes.
  useEffect(() => {
    const el = thread.current;
    if (!el) return;
    if (streaming) {
      el.scrollTop = el.scrollHeight;
      return;
    }
    const lastItem = el.querySelector<HTMLElement>('[data-revisions] > li:last-child');
    if (status === 'ready' && lastItem) {
      el.scrollTop = Math.max(el.scrollTop, lastItem.offsetTop + lastItem.offsetHeight - el.clientHeight);
    }
  }, [messages, status, streaming]);

  const canAsk = graph !== null && !extractionRunning;
  function ask(question: string) {
    const text = question.trim();
    if (!text || !canAsk || streaming) return;
    setPin(null);
    clearError();
    // En móvil, el recorrido tiene que verse: si la vista era la fuente, vuelve al grafo.
    setMobilePanel('sheet');
    void sendMessage({ text });
    setDraft('');
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      ask(draft);
    }
  }

  const asked = new Set(revisions.map((r) => r.question));
  const recorded = source?.kind === 'sample' ? sample.replays.map((r) => r.question) : [];
  const suggestions = source?.kind === 'sample' ? recorded : graph ? suggestionsFor(graph.entities) : [];
  const pending = suggestions.filter((q) => !asked.has(q));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader id="panel-preguntas" title="Preguntas" meta={shown ? `R${shown.number} en la lámina` : undefined} />

      {/* Zona con scroll propio: enfocable para poder recorrerla con el teclado (WCAG 2.1.1). */}
      <div
        ref={thread}
        role="region"
        aria-label="Conversación"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto focus-visible:outline-offset-[-2px]"
      >
        {revisions.length === 0 && (
          <div className="px-4 pb-2 pt-4 max-md:hidden">
            <p className="max-w-[46ch] text-[14px] leading-relaxed text-ink-2">
              Pregunta algo sobre el texto. Verás en la lámina qué entidades recorre la búsqueda y cuáles cita la respuesta.
            </p>
          </div>
        )}

        <ol data-revisions="" className="divide-y divide-line">
          {revisions.map((r) => {
            const isShown = shown?.number === r.number;
            const meta = r.answer?.metadata;
            const visibleSteps = isShown ? revealed : r.steps.length;
            return (
              <li key={r.number} className="px-4 py-4">
                <button
                  type="button"
                  disabled={!r.answer}
                  aria-pressed={isShown}
                  onClick={() => {
                    if (!r.answer) return;
                    setPin({ doc: documentId, id: r.answer.id });
                    if (activeMessage === r.answer.id) replayHighlight();
                  }}
                  className="group flex w-full items-start gap-2.5 text-left disabled:cursor-default"
                  title={r.answer ? 'Ver esta revisión en la lámina' : undefined}
                >
                  <RevisionMark number={r.number} active={isShown} />
                  <span className="pt-0.5 text-[14px] font-semibold leading-snug text-ink group-enabled:group-hover:underline">
                    {r.question}
                  </span>
                </button>

                {r.steps.length > 0 && (
                  <ol aria-label="Recorrido" className="mt-2.5 space-y-0.5 pl-[34px]">
                    {r.steps.map((s, i) => (
                      <li key={s.step} className={`flex gap-2 text-xs leading-snug ${i < visibleSteps ? 'text-ink-2' : 'text-ink-3'}`}>
                        <span className="w-3 shrink-0 font-mono">{s.kind === 'seed' ? 'S' : s.step}</span>
                        <span>{s.reason}</span>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="mt-2.5 pl-[34px]">
                  {r.answer && r.segmented.segments.length > 0 ? (
                    <AnswerText segments={r.segmented.segments} />
                  ) : (
                    !error && <p className="text-[13px] text-ink-3">Buscando en el grafo…</p>
                  )}
                  {r.done && r.segmented.outOfContext.length > 0 && (
                    <p className="mt-2 text-xs leading-snug text-ink-2">
                      Las notas con borde discontinuo citan entidades que la recuperación no trajo: no están respaldadas por este recorrido.
                    </p>
                  )}
                  {r.done && meta && (
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] tabular text-ink-3">
                      <span>{meta.retrieved} en contexto</span>
                      <span>{r.segmented.cited.length} citadas</span>
                      <span>{meta.model}</span>
                      {meta.recordedAt && (
                        <span className="bg-markup px-1 text-on-markup">
                          grabada {new Date(meta.recordedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {error && (
          <div role="alert" className="mx-4 my-3 border border-ink px-3 py-2 text-[13px] leading-snug text-ink">
            <p>{ERROR_COPY[errorCodeOf(error)]}</p>
            <SecondaryButton
              className="mt-2 h-8"
              onClick={(e) => {
                // El aviso desaparece al reintentar: el foco pasa al botón de la pregunta.
                if (document.activeElement === e.currentTarget) action.current?.focus();
                clearError();
                void regenerate();
              }}
            >
              <ArrowClockwise size={14} aria-hidden="true" />
              Reintentar
            </SecondaryButton>
          </div>
        )}

        {pending.length > 0 && !streaming && (
          <section aria-labelledby="sugeridas" className="px-4 pb-4 pt-3">
            <h4 id="sugeridas" className="text-[11px] uppercase tracking-[0.08em] text-ink-3">
              {source?.kind === 'sample' ? 'Preguntas con respuesta grabada' : 'Para empezar'}
            </h4>
            <ul className="mt-1.5 border-t border-line">
              {pending.map((q) => (
                <li key={q} className="border-b border-line">
                  <button
                    type="button"
                    disabled={!canAsk}
                    onClick={(e) => {
                      // La sugerida sale de la lista al preguntarla (y la lista se oculta mientras se
                      // responde): el foco pasa al botón Preguntar/Detener, que no se desmonta.
                      if (document.activeElement === e.currentTarget) action.current?.focus();
                      ask(q);
                    }}
                    className="flex w-full items-center justify-between gap-3 py-2 text-left text-[14px] leading-snug text-ink hover:bg-paper-2 disabled:text-ink-3"
                  >
                    {q}
                    <PaperPlaneRight size={14} className="shrink-0 text-ink-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <form
        className="shrink-0 border-t border-line px-4 pb-3 pt-2.5 max-md:flex max-md:flex-wrap max-md:items-end max-md:gap-x-2 max-md:gap-y-1 max-md:py-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <label htmlFor={fieldId} className="text-[11px] uppercase tracking-[0.08em] text-ink-3 max-md:basis-full">
          Pregunta
        </label>
        <textarea
          id={fieldId}
          rows={2}
          value={draft}
          disabled={!canAsk}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          aria-describedby={hintId}
          placeholder={!canAsk ? 'Espera a que termine la extracción' : source?.kind === 'sample' ? '¿Quién comandó la misión?' : 'Escribe una pregunta'}
          className="mt-1 block w-full resize-none border border-line-strong bg-paper px-2.5 py-2 text-[14px] leading-snug text-ink placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-0 disabled:opacity-60 max-md:mt-0 max-md:h-10 max-md:min-w-0 max-md:flex-1"
        />
        <div className="mt-2 flex items-center justify-between gap-2 max-md:mt-0 max-md:shrink-0">
          <p id={hintId} className="text-xs text-ink-3 max-md:sr-only">
            Enter envía; Mayús y Enter, salto de línea.
          </p>
          {/*
           * Un solo botón que cambia de texto y de función: si fueran dos, el que tiene el foco se
           * desmontaría al empezar y al terminar cada respuesta. Sin pregunta que enviar queda
           * aria-disabled (no disabled), para no soltar el foco; ask() ya no hace nada entonces.
           */}
          <PrimaryButton
            ref={action}
            type={streaming ? 'button' : 'submit'}
            onClick={streaming ? () => void stop() : undefined}
            aria-disabled={!streaming && (!canAsk || draft.trim() === '')}
          >
            {streaming ? (
              <>
                <Stop size={14} weight="fill" aria-hidden="true" />
                Detener
              </>
            ) : (
              <>
                Preguntar
                <PaperPlaneRight size={14} aria-hidden="true" />
              </>
            )}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
