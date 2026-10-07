import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  validateUIMessages,
  type ToolSet,
} from 'ai';
import { z } from 'zod';
import { CHAT_MODELS } from '@/lib/ai/models';
import { answerSystem } from '@/lib/ai/prompts';
import { classifyModelError, describeError } from '@/lib/ai/errors';
import { streamWithFallback } from '@/lib/ai/stream-with-fallback';
import { EdgeIdSchema, KnowledgeGraphSchema, MAX_SOURCE_CHARS, NodeIdSchema } from '@/lib/graph/schema';
import { buildContext, retrieve } from '@/lib/graph/retrieve';
import { CHAT_LIMIT, clientKey, takeToken } from '@/lib/server/rate-limit';
import type { NCMessage } from '@/lib/chat/types';

export const maxDuration = 60;

/** Historial acotado: la recuperación ya trae el contexto, el historial solo da continuidad. */
const HISTORY = 6;

const RequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(60),
  graph: KnowledgeGraphSchema,
  source: z.string().max(MAX_SOURCE_CHARS),
});

const TraceStepSchema = z.object({
  step: z.number().int().nonnegative(),
  kind: z.enum(['seed', 'hop']),
  nodes: z.array(NodeIdSchema),
  edges: z.array(EdgeIdSchema),
  reason: z.string(),
});

const MetadataSchema = z.object({
  model: z.string(),
  retrieved: z.number().int().nonnegative(),
  fallback: z.boolean(),
  recordedAt: z.string().optional(),
});

export async function POST(request: Request): Promise<Response> {
  if (!takeToken(CHAT_LIMIT, clientKey(request))) return Response.json({ error: 'cuota_agotada' }, { status: 429 });

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    // Solo las rutas de los campos, nunca su contenido.
    console.error('[chat] petición inválida en', parsed.error.issues.slice(0, 5).map((i) => i.path.join('.')));
    return Response.json({ error: 'peticion_invalida' }, { status: 400 });
  }
  const { graph, source } = parsed.data;

  let messages: NCMessage[];
  try {
    messages = await validateUIMessages<NCMessage>({
      messages: parsed.data.messages,
      // Opcional: los mensajes del usuario no llevan metadatos, solo las respuestas.
      metadataSchema: MetadataSchema.optional(),
      dataSchemas: { trace: TraceStepSchema },
    });
  } catch (error) {
    console.error('[chat] mensajes inválidos:', error instanceof Error ? error.name : 'unknown');
    return Response.json({ error: 'peticion_invalida' }, { status: 400 });
  }

  const last = messages.at(-1);
  const question = last?.role === 'user' ? last.parts.map((p) => (p.type === 'text' ? p.text : '')).join(' ').trim() : '';
  if (!question) return Response.json({ error: 'peticion_invalida' }, { status: 400 });

  const retrieval = retrieve(graph, question);

  const stream = createUIMessageStream<NCMessage>({
    execute: async ({ writer }) => {
      // El recorrido sale antes que el texto: la lámina lo dibuja mientras llega el primer token.
      for (const step of retrieval.steps) {
        writer.write({ type: 'data-trace', id: `trace-${step.step}`, data: step });
      }
      const { model, stream } = await streamWithFallback(CHAT_MODELS, {
        system: answerSystem(buildContext(graph, source, retrieval)),
        messages: await convertToModelMessages(messages.slice(-HISTORY)),
      });
      writer.merge(
        toUIMessageStream<ToolSet, NCMessage>({
          stream,
          sendStart: false,
          messageMetadata: ({ part }) =>
            part.type === 'finish'
              ? { model, retrieved: retrieval.nodes.length, fallback: retrieval.fallback }
              : undefined,
          onError: (error) => {
            console.error('[chat]', describeError(error));
            return classifyModelError(error).code;
          },
        }),
      );
    },
    onError: (error) => {
      console.error('[chat]', describeError(error));
      return classifyModelError(error).code;
    },
  });
  return createUIMessageStreamResponse({ stream });
}
