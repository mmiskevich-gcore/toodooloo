import "server-only";

// In-memory fixed window limiter. Good enough for local dev and a single
// server. On serverless (Vercel) each instance has its own memory, so swap
// this for a shared store like Upstash Redis before relying on it.
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  // Off in dev and tests so repeated local runs don't lock you out
  if (process.env.NODE_ENV !== "production") return true;

  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
