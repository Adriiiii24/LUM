import type { ApiErrorCode } from './types.ts';

/** Cada error dice qué pasó y qué hacer. */
export const ERROR_COPY: Record<ApiErrorCode | 'red', string> = {
  cuota_agotada: 'Gemini está saturado o la cuota gratuita se ha agotado. Prueba en unos minutos; la muestra sigue disponible.',
  texto_invalido: 'El texto tiene que tener entre 200 y 12.000 caracteres.',
  peticion_invalida: 'La petición no es válida. Recarga la página y vuelve a intentarlo.',
  salida_invalida: 'Gemini devolvió un grafo que no cumple el esquema. Vuelve a intentarlo.',
  error_modelo: 'Gemini no respondió. Vuelve a intentarlo en un momento.',
  red: 'No hay conexión con el servidor. Comprueba la red y vuelve a intentarlo.',
};

const CODES = Object.keys(ERROR_COPY) as Array<keyof typeof ERROR_COPY>;

/** Saca el código de un error del chat: viene como texto de una parte de error o en el cuerpo JSON de la respuesta. */
export function errorCodeOf(error: Error | undefined): keyof typeof ERROR_COPY {
  const message = error?.message ?? '';
  return CODES.find((c) => message.includes(c)) ?? (message.includes('fetch') ? 'red' : 'error_modelo');
}
