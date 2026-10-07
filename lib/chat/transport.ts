'use client';
import { DefaultChatTransport, type ChatTransport, type UIMessageChunk } from 'ai';
import type { StoreApi } from 'zustand';
import type { NCMessage } from './types.ts';
import type { SampleReplay } from '../sample/types.ts';
import type { WorkbenchState } from '../state/workbench.ts';

type SendOptions = Parameters<ChatTransport<NCMessage>['sendMessages']>[0];

const questionOf = (message: NCMessage | undefined): string =>
  message?.role === 'user' ? message.parts.map((p) => (p.type === 'text' ? p.text : '')).join(' ').trim() : '';

/**
 * Transporte del chat. Con la muestra cargada, las preguntas grabadas se reproducen desde
 * data/sample/sample.json por el mismo camino que una respuesta real (sin gastar cuota) y
 * llevan su fecha de grabación en los metadatos. Todo lo demás va en vivo a /api/chat.
 */
export class NeuralTransport implements ChatTransport<NCMessage> {
  private readonly live: DefaultChatTransport<NCMessage>;
  private readonly store: StoreApi<WorkbenchState>;

  constructor(store: StoreApi<WorkbenchState>) {
    this.store = store;
    this.live = new DefaultChatTransport<NCMessage>({
      api: '/api/chat',
      body: () => {
        const { graph, source } = this.store.getState();
        return { graph, source: source?.text ?? '' };
      },
    });
  }

  async sendMessages(options: SendOptions): Promise<ReadableStream<UIMessageChunk>> {
    const { source, sample } = this.store.getState();
    const question = questionOf(options.messages.at(-1));
    const replay = source?.kind === 'sample' ? sample.replays.find((r) => r.question === question) : undefined;
    if (replay) return replayStream(replay, sample.recordedAt, options.abortSignal);
    return this.live.sendMessages(options);
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }
}

/** Reproduce los fragmentos grabados con sus tiempos originales (las pausas largas ya se acortaron al grabar). */
function replayStream(replay: SampleReplay, recordedAt: string, signal: AbortSignal | undefined): ReadableStream<UIMessageChunk> {
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      const stop = () => {
        timers.forEach(clearTimeout);
        controller.error(new DOMException('Respuesta detenida', 'AbortError'));
      };
      if (signal?.aborted) return stop();
      signal?.addEventListener('abort', stop, { once: true });
      replay.chunks.forEach(({ t, chunk }, i) => {
        timers.push(
          setTimeout(() => {
            const out: UIMessageChunk =
              (chunk.type === 'finish' || chunk.type === 'message-metadata') && chunk.messageMetadata
                ? { ...chunk, messageMetadata: { ...chunk.messageMetadata, recordedAt } }
                : chunk;
            controller.enqueue(out);
            if (i === replay.chunks.length - 1) {
              signal?.removeEventListener('abort', stop);
              controller.close();
            }
          }, t),
        );
      });
    },
    cancel() {
      timers.forEach(clearTimeout);
    },
  });
}
