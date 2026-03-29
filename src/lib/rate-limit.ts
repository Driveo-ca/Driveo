const rateMap = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter.
 * Returns { success: true } if under limit, or { success: false } if exceeded.
 */
export function rateLimit(
  ip: string,
  route: string,
  { maxRequests = 10, windowMs = 60_000 } = {}
): { success: boolean } {
  const key = `${route}:${ip}`;
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { success: false };
  }

  return { success: true };
}
