// Simple in-memory rate limiter
// Limits submissions per IP address

type RateLimitEntry = {
  ip: string;
  timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_SUBMISSIONS = 5; // Max cards per time window
const TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Cleanup old entries every 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
      // Remove timestamps older than the time window
      entry.timestamps = entry.timestamps.filter(
        (ts) => now - ts < TIME_WINDOW_MS,
      );
      // Remove entry if no timestamps left
      if (entry.timestamps.length === 0) {
        rateLimitStore.delete(ip);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  startCleanup();

  const now = Date.now();
  let entry = rateLimitStore.get(ip);

  if (!entry) {
    entry = { ip, timestamps: [] };
    rateLimitStore.set(ip, entry);
  }

  // Remove old timestamps outside the time window
  entry.timestamps = entry.timestamps.filter(
    (ts) => now - ts < TIME_WINDOW_MS,
  );

  const count = entry.timestamps.length;

  if (count >= MAX_SUBMISSIONS) {
    // Find the oldest timestamp to calculate when the limit resets
    const oldestTimestamp = Math.min(...entry.timestamps);
    const resetAt = oldestTimestamp + TIME_WINDOW_MS;

    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Record this submission attempt
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: MAX_SUBMISSIONS - count - 1,
    resetAt: now + TIME_WINDOW_MS,
  };
}

export function getClientIP(req: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  // Fallback (won't work in serverless, but helps in dev)
  return "unknown";
}
