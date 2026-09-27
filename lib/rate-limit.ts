/**
 * Best-effort in-memory rate limiter.
 *
 * On Vercel, serverless instances are reused while "warm", so this blocks
 * rapid repeat submissions from the same IP. It is NOT a guarantee across
 * cold starts or multiple instances — for a personal site with low traffic
 * that trade-off is fine, and it needs no paid database.
 */
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep memory bounded.
  if (hits.size > 1000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}
