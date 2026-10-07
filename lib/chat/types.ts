import type { UIMessage } from 'ai';
import type { TraceStep } from '../graph/retrieve.ts';

/** Metadatos del pie de cada respuesta. */
export type NCMetadata = {
  model: string;
  /** Entidades que entraron en el contexto. */
  retrieved: number;
  fallback: boolean;
  /** Presente solo en las respuestas grabadas de la muestra. */
  recordedAt?: string;
};

/** Partes de datos del stream: cada paso del recorrido viaja como `data-trace`. */
export type NCDataParts = { trace: TraceStep };

/** Mensaje tipado de Neural Canvas. */
export type NCMessage = UIMessage<NCMetadata, NCDataParts>;

/** Códigos de error que las rutas devuelven y la interfaz traduce a texto. */
export type ApiErrorCode = 'texto_invalido' | 'peticion_invalida' | 'cuota_agotada' | 'salida_invalida' | 'error_modelo';
