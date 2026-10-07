import 'server-only';
import { google } from '@ai-sdk/google';

/*
 * Ids de modelo configurables: Google retira modelos y el código no debería depender de uno.
 * Cada tarea tiene un modelo principal y uno de reserva con cuota gratuita propia: si el
 * principal responde 503 (saturado) o 429 (cuota agotada), se reintenta con el de reserva.
 */
export const EXTRACT_MODELS = [
  process.env.NC_EXTRACT_MODEL ?? 'gemini-3.5-flash',
  process.env.NC_EXTRACT_FALLBACK_MODEL ?? 'gemini-3.5-flash-lite',
] as const;

export const CHAT_MODELS = [
  process.env.NC_CHAT_MODEL ?? 'gemini-3.5-flash',
  process.env.NC_CHAT_FALLBACK_MODEL ?? 'gemini-3.5-flash-lite',
] as const;

/**
 * Razonamiento de la extracción. Medido el 2026-10-07 con gemini-3.5-flash sobre la muestra:
 * low, 19 entidades y 20 relaciones en 10 s; medium, 29 y 37 en 35 s. Las evals deciden.
 */
const THINKING_LEVELS = ['minimal', 'low', 'medium', 'high'] as const;
type ThinkingLevel = (typeof THINKING_LEVELS)[number];
const configuredThinking = process.env.NC_EXTRACT_THINKING;
export const EXTRACT_THINKING: ThinkingLevel = THINKING_LEVELS.find((l) => l === configuredThinking) ?? 'medium';

export const languageModel = (id: string) => google(id);
