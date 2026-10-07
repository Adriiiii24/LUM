import { APICallError, NoObjectGeneratedError, RetryError } from 'ai';
import type { ApiErrorCode } from '../chat/types.ts';

const rootCause = (error: unknown): unknown => (RetryError.isInstance(error) ? error.lastError : error);

/** Traduce un error del modelo a un código estable para la interfaz. Nunca incluye el texto del usuario. */
export function classifyModelError(error: unknown): { code: ApiErrorCode; status: number } {
  const cause = rootCause(error);
  if (APICallError.isInstance(cause) && (cause.statusCode === 429 || cause.statusCode === 503)) {
    return { code: 'cuota_agotada', status: cause.statusCode };
  }
  if (NoObjectGeneratedError.isInstance(cause)) return { code: 'salida_invalida', status: 502 };
  return { code: 'error_modelo', status: 502 };
}

/** Saturación o cuota del modelo concreto: tiene sentido probar con el modelo de reserva. */
export function shouldFallBack(error: unknown): boolean {
  const cause = rootCause(error);
  return APICallError.isInstance(cause) && (cause.statusCode === 429 || cause.statusCode === 503);
}

/** Para el registro del servidor: clase y estado, sin contenido. */
export function describeError(error: unknown): string {
  const cause = rootCause(error);
  if (APICallError.isInstance(cause)) return `APICallError ${cause.statusCode ?? '?'}`;
  return error instanceof Error ? error.name : 'unknown';
}
