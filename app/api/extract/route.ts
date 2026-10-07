import { Output, generateText } from 'ai';
import type { GoogleLanguageModelOptions } from '@ai-sdk/google';
import { z } from 'zod';
import { EXTRACT_MODELS, EXTRACT_THINKING, languageModel } from '@/lib/ai/models';
import { EXTRACTION_SYSTEM } from '@/lib/ai/prompts';
import { classifyModelError, describeError, shouldFallBack } from '@/lib/ai/errors';
import { ExtractionSchema, MAX_SOURCE_CHARS, MIN_SOURCE_CHARS } from '@/lib/graph/schema';
import { normalizeExtraction } from '@/lib/graph/normalize';
import { EXTRACT_LIMIT, clientKey, takeToken } from '@/lib/server/rate-limit';
import type { ApiErrorCode } from '@/lib/chat/types';

export const maxDuration = 60;

const RequestSchema = z.object({ text: z.string().trim().min(MIN_SOURCE_CHARS).max(MAX_SOURCE_CHARS) });

const fail = (error: ApiErrorCode, status: number) => Response.json({ error }, { status });

export async function POST(request: Request): Promise<Response> {
  if (!takeToken(EXTRACT_LIMIT, clientKey(request))) return fail('cuota_agotada', 429);

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('texto_invalido', 400);
  const text = parsed.data.text;

  let lastError: unknown;
  for (const model of EXTRACT_MODELS) {
    try {
      const { output } = await generateText({
        model: languageModel(model),
        maxRetries: 1,
        output: Output.object({ schema: ExtractionSchema, name: 'grafo_de_conocimiento' }),
        system: EXTRACTION_SYSTEM,
        prompt: text,
        providerOptions: { google: { thinkingConfig: { thinkingLevel: EXTRACT_THINKING } } satisfies GoogleLanguageModelOptions },
      });
      const graph = normalizeExtraction(output, text, { model, createdAt: new Date().toISOString() });
      return Response.json({ graph, text });
    } catch (error) {
      lastError = error;
      console.error('[extract]', model, describeError(error));
      if (!shouldFallBack(error)) break;
    }
  }
  const { code, status } = classifyModelError(lastError);
  return fail(code, status);
}
