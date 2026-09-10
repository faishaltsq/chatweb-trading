// ponytail: in-memory sliding window rate limiter. Upgrade to Upstash Redis if running multi-instance horizontal scaling.

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

const stores = new Map<string, Map<string, number[]>>();

export function checkRateLimit(namespace: string, key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  const store = stores.get(namespace)!;

  // Prune map if too big to avoid memory leak
  if (store.size > 1000) {
    for (const [k, timestamps] of store.entries()) {
      const active = timestamps.filter((t) => t > windowStart);
      if (active.length === 0) store.delete(k);
      else store.set(k, active);
    }
  }

  const timestamps = (store.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= config.max) {
    const oldest = timestamps[0];
    const resetMs = Math.max(0, oldest + config.windowMs - now);
    return { success: false, remaining: 0, resetMs };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  return {
    success: true,
    remaining: config.max - timestamps.length,
    resetMs: config.windowMs,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '127.0.0.1';
}
