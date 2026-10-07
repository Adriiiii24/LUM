'use client';
import { useId, useRef, useState, type DragEvent } from 'react';
import { FileArrowUp, X } from '@phosphor-icons/react/dist/ssr';
import { useWorkbench } from '@/lib/state/workbench';
import { KnowledgeGraphSchema, MAX_SOURCE_CHARS, MIN_SOURCE_CHARS } from '@/lib/graph/schema';
import { layoutGraph } from '@/lib/graph/layout';
import { ERROR_COPY } from '@/lib/chat/error-copy';
import type { ApiErrorCode } from '@/lib/chat/types';
import { PanelHeader } from '@/components/workbench/PanelHeader';
import { PrimaryButton, SecondaryButton, ToolButton } from '@/components/ui/Button';
import { SourceText } from './SourceText';

const ACCEPTED = /\.(txt|md|markdown)$/i;
const numberEs = (n: number) => n.toLocaleString('es-ES');

function titleOf(text: string): string {
  const first = text.split(/(?<=[.!?])\s|\n/)[0]?.trim() ?? 'Texto propio';
  return first.length > 48 ? `${first.slice(0, 47).trimEnd()}…` : first || 'Texto propio';
}

/** Celda de la fuente: el texto con sus marcas o el editor para pegar uno nuevo. */
export function SourcePanel({ onClose }: { onClose?: () => void }) {
  const source = useWorkbench((s) => s.source);
  const extraction = useWorkbench((s) => s.extraction);
  const setExtraction = useWorkbench((s) => s.setExtraction);
  const setDocument = useWorkbench((s) => s.setDocument);
  const showSample = useWorkbench((s) => s.showSample);

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState('');
  const [dragging, setDragging] = useState(false);
  const [fileNote, setFileNote] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const hintId = useId();

  const running = extraction.phase === 'running';
  const count = draft.trim().length;
  const tooShort = count < MIN_SOURCE_CHARS;
  const tooLong = count > MAX_SOURCE_CHARS;

  async function loadFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.test(file.name) && file.type !== 'text/plain' && file.type !== 'text/markdown') {
      setFileNote(`«${file.name}» no es un .txt ni un .md.`);
      return;
    }
    setDraft(await file.text());
    setFileNote(`Cargado «${file.name}».`);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (mode !== 'edit') setMode('edit');
    void loadFile(event.dataTransfer.files[0]);
  }

  async function extract() {
    if (tooShort || tooLong || running) return;
    const controller = new AbortController();
    abort.current = controller;
    setExtraction({ phase: 'running', startedAt: Date.now() });
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: draft }),
        signal: controller.signal,
      });
      const body = (await res.json().catch(() => ({}))) as { graph?: unknown; text?: string; error?: ApiErrorCode };
      const parsed = KnowledgeGraphSchema.safeParse(body.graph);
      if (!res.ok || !parsed.success || typeof body.text !== 'string') {
        setExtraction({ phase: 'error', code: body.error ?? 'salida_invalida' });
        return;
      }
      setDocument({ kind: 'user', title: titleOf(body.text), text: body.text }, parsed.data, layoutGraph(parsed.data));
      setMode('view');
      setDraft('');
      setFileNote(null);
    } catch (error) {
      setExtraction(error instanceof DOMException && error.name === 'AbortError' ? { phase: 'idle' } : { phase: 'error', code: 'red' });
    } finally {
      abort.current = null;
    }
  }

  const meta = mode === 'edit' ? 'Texto nuevo' : source ? `${numberEs(source.text.length)} caracteres` : undefined;

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <PanelHeader id="panel-fuente" title="Fuente" meta={meta}>
        {mode === 'view' && (
          <button
            type="button"
            onClick={() => setMode('edit')}
            className="h-7 rounded-xs px-2 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2 hover:bg-paper hover:text-ink"
          >
            Nuevo texto
          </button>
        )}
        {onClose && (
          <ToolButton aria-label="Cerrar la fuente" onClick={onClose} className="max-md:hidden xl:hidden">
            <X size={15} aria-hidden="true" />
          </ToolButton>
        )}
      </PanelHeader>

      {mode === 'view' ? (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {source ? <SourceText /> : <p className="text-sm text-ink-2">Todavía no hay texto.</p>}
          </div>
          <footer className="shrink-0 border-t border-line px-4 py-2.5 text-xs leading-snug text-ink-3">
            {source?.kind === 'sample' && source.attribution ? (
              <>
                Texto:{' '}
                <a href={source.attribution.url} className="text-ink-2 underline hover:text-ink" target="_blank" rel="noreferrer">
                  {source.attribution.label}
                </a>
                , bajo{' '}
                <a href={source.attribution.licenseUrl} className="text-ink-2 underline hover:text-ink" target="_blank" rel="noreferrer">
                  {source.attribution.license}
                </a>
                .
              </>
            ) : (
              <>
                Tu texto solo vive en este navegador.{' '}
                <button type="button" onClick={showSample} className="text-ink-2 underline hover:text-ink">
                  Volver a la muestra
                </button>
              </>
            )}
          </footer>
        </>
      ) : (
        <form
          className="flex min-h-0 flex-1 flex-col gap-2 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void extract();
          }}
        >
          <label htmlFor={fieldId} className="text-[11px] uppercase tracking-[0.08em] text-ink-3">
            Texto a analizar
          </label>
          <textarea
            id={fieldId}
            aria-describedby={hintId}
            value={draft}
            disabled={running}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Pega aquí un fragmento de un manual, un artículo o un relato."
            className={`min-h-40 flex-1 resize-none border bg-paper p-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-0 disabled:opacity-60 ${
              dragging ? 'border-2 border-dashed border-ink bg-paper-2' : 'border-line-strong'
            }`}
          />
          <div id={hintId} className="flex items-baseline justify-between gap-3 text-xs text-ink-3">
            <span>{dragging ? 'Suelta el archivo para cargarlo.' : fileNote ?? 'Pega el texto o suelta un .txt o .md.'}</span>
            <span className={`font-mono tabular ${tooLong ? 'font-semibold text-ink' : ''}`}>
              {numberEs(count)} / {numberEs(MAX_SOURCE_CHARS)}
            </span>
          </div>
          <p className="text-xs leading-snug text-ink-3">
            Se envía a Gemini por su capa gratuita: Google puede usarlo para mejorar sus productos. No pegues datos personales ni confidenciales.
          </p>
          {extraction.phase === 'error' && (
            <p role="alert" className="border border-ink px-3 py-2 text-[13px] leading-snug text-ink">
              {ERROR_COPY[extraction.code]}
            </p>
          )}
          {tooLong && <p className="text-[13px] text-ink">Recorta el texto: el máximo es {numberEs(MAX_SOURCE_CHARS)} caracteres.</p>}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept=".txt,.md,.markdown,text/plain,text/markdown"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => void loadFile(e.target.files?.[0])}
            />
            <SecondaryButton onClick={() => fileInput.current?.click()} disabled={running}>
              <FileArrowUp size={16} aria-hidden="true" />
              Abrir archivo
            </SecondaryButton>
            <span className="ml-auto flex gap-2">
              {running ? (
                <SecondaryButton onClick={() => abort.current?.abort()}>Cancelar</SecondaryButton>
              ) : (
                <SecondaryButton onClick={() => { setMode('view'); setExtraction({ phase: 'idle' }); }}>Cancelar</SecondaryButton>
              )}
              <PrimaryButton type="submit" disabled={tooShort || tooLong || running}>
                {running ? 'Extrayendo…' : 'Extraer grafo'}
              </PrimaryButton>
            </span>
          </div>
          {tooShort && count > 0 && !running && (
            <p className="text-xs text-ink-3">Faltan {numberEs(MIN_SOURCE_CHARS - count)} caracteres para el mínimo.</p>
          )}
        </form>
      )}
    </div>
  );
}
