// Simple in-memory rate limiter
// Limits total submissions per IP address (no time window)

type RateLimitEntry = {
  ip: string;
  count: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_SUBMISSIONS = 5; // Max cards in total per IP address

// No reset — once limit is reached, no more submissions from that IP
const NO_RESET = Number.POSITIVE_INFINITY;

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  let entry = rateLimitStore.get(ip);

  if (!entry) {
    entry = { ip, count: 0 };
    rateLimitStore.set(ip, entry);
  }

  const count = entry.count;

  if (count >= MAX_SUBMISSIONS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: NO_RESET,
    };
  }

  // Record this submission attempt
  entry.count += 1;

  return {
    allowed: true,
    remaining: MAX_SUBMISSIONS - count - 1,
    resetAt: NO_RESET,
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
