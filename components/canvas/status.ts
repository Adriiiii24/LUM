'use client';
import { useWorkbench } from '@/lib/state/workbench';

export type StatusWord = 'LISTO' | 'EXTRAYENDO' | 'RECORRIENDO' | 'RESPONDIENDO' | 'ERROR' | 'SIN GRAFO';

/** Estado único del banco de trabajo, el que dice la celda ESTADO del cajetín. */
export function useStatusWord(): { word: StatusWord; active: boolean } {
  // Selectores de valores primitivos: zustand 5 exige instantáneas estables.
  const extraction = useWorkbench((s) => s.extraction.phase);
  const hasGraph = useWorkbench((s) => s.graph !== null);
  const chat = useWorkbench((s) => s.chatStatus);
  const tracing = useWorkbench((s) => s.highlight !== null && s.revealed < s.highlight.steps.length);

  if (extraction === 'running') return { word: 'EXTRAYENDO', active: true };
  if (extraction === 'error') return { word: 'ERROR', active: false };
  if (!hasGraph) return { word: 'SIN GRAFO', active: false };
  if (chat === 'error') return { word: 'ERROR', active: false };
  if (chat === 'submitted' || tracing) return { word: 'RECORRIENDO', active: true };
  if (chat === 'streaming') return { word: 'RESPONDIENDO', active: true };
  return { word: 'LISTO', active: false };
}
