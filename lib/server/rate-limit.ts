import 'server-only';

/*
 * Límite por IP en memoria, aproximado a propósito: en serverless cada instancia lleva su
 * propia cuenta. Frena a un cliente insistente; no sustituye a un límite compartido, que
 * sigue siendo una decisión abierta (docs/ARCHITECTURE.md, sección 11).
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimit = { name: string; limit: number; windowMs: number };

/** Un límite de la variable de entorno solo si es un número positivo: un valor mal escrito no puede desactivar el límite. */
const limitFrom = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const EXTRACT_LIMIT: RateLimit = {
  name: 'extract',
  limit: limitFrom(process.env.NC_EXTRACT_PER_HOUR, 8),
  windowMs: 60 * 60 * 1000,
};
export const CHAT_LIMIT: RateLimit = {
  name: 'chat',
  limit: limitFrom(process.env.NC_CHAT_PER_HOUR, 40),
  windowMs: 60 * 60 * 1000,
};

export function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
}

/** true si la petición entra; false si este cliente ya agotó su ventana. */
export function takeToken(rule: RateLimit, key: string, now = Date.now()): boolean {
  const id = `${rule.name}:${key}`;
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + rule.windowMs });
    if (buckets.size > 5_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return true;
  }
  if (bucket.count >= rule.limit) return false;
  bucket.count++;
  return true;
}
