import 'server-only';
import { streamText, type ModelMessage, type TextStreamPart, type ToolSet } from 'ai';
import { languageModel } from './models.ts';
import { describeError, shouldFallBack } from './errors.ts';

type Part = TextStreamPart<ToolSet>;

/**
 * Arranca streamText con el primer modelo de la lista y, si falla antes de escribir nada por
 * saturación o cuota, lo intenta con el siguiente. En cuanto llega texto ya no se cambia de
 * modelo: una respuesta no puede empezar con uno y terminar con otro.
 */
export async function streamWithFallback(
  models: readonly string[],
  args: { system: string; messages: ModelMessage[] },
): Promise<{ model: string; stream: ReadableStream<Part> }> {
  let lastError: unknown = new Error('sin modelos configurados');

  for (const model of models) {
    const result = streamText({ ...args, model: languageModel(model), maxRetries: 1 });
    const reader = result.stream.getReader();
    const head: Part[] = [];
    let failure: { error: unknown } | null = null;

    // Lee hasta el primer fragmento de texto o el primer error, guardando lo leído.
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value.type === 'error') {
        failure = { error: value.error };
        break;
      }
      head.push(value);
      if (value.type === 'text-delta') break;
    }

    if (failure) {
      lastError = failure.error;
      await reader.cancel().catch(() => undefined);
      if (shouldFallBack(failure.error)) {
        console.error('[chat] modelo de reserva tras', model, describeError(failure.error));
        continue;
      }
      throw failure.error;
    }

    const stream = new ReadableStream<Part>({
      start(controller) {
        for (const part of head) controller.enqueue(part);
      },
      async pull(controller) {
        const { value, done } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      },
      cancel(reason) {
        return reader.cancel(reason);
      },
    });
    return { model, stream };
  }
  throw lastError;
}
