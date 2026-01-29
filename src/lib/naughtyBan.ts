/**
 * Tracks "naughty" (blacklisted) submission attempts per IP.
 * After 3 attempts, the IP is banned from submitting.
 * Uses Neon DB when DATABASE_URL is set; falls back to in-memory otherwise.
 */

import { neon } from "@neondatabase/serverless";

const NAUGHTY_LIMIT = 3;

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

// In-memory fallback when no DB
const naughtyCountByIP = new Map<string, number>();
const bannedIPs = new Set<string>();

async function isBannedNeon(ip: string): Promise<boolean> {
  const sql = neon(connectionString);
  const rows = await sql`
    SELECT 1 FROM banned_ips WHERE ip = ${ip} AND banned = true LIMIT 1
  `;
  return Array.isArray(rows) && rows.length > 0;
}

async function recordNaughtyAttemptNeon(ip: string): Promise<{
  naughtyCount: number;
  banned: boolean;
}> {
  const sql = neon(connectionString);
  const rows = await sql`
    INSERT INTO banned_ips (ip, naughty_count, banned)
    VALUES (${ip}, 1, false)
    ON CONFLICT (ip) DO UPDATE SET
      naughty_count = banned_ips.naughty_count + 1,
      banned = (banned_ips.naughty_count + 1 >= ${NAUGHTY_LIMIT}),
      updated_at = now()
    RETURNING naughty_count, banned
  `;
  const row = Array.isArray(rows) ? (rows as { naughty_count: number; banned: boolean }[])[0] : null;
  if (!row) throw new Error("banned_ips upsert did not return a row");
  return {
    naughtyCount: row.naughty_count,
    banned: row.banned ?? false,
  };
}

export async function isBanned(ip: string): Promise<boolean> {
  if (connectionString) {
    return isBannedNeon(ip);
  }
  return bannedIPs.has(ip);
}

/**
 * Record a naughty attempt. Returns current count and whether the IP
 * was just banned (reached 3 attempts).
 */
export async function recordNaughtyAttempt(ip: string): Promise<{
  naughtyCount: number;
  banned: boolean;
}> {
  if (connectionString) {
    return recordNaughtyAttemptNeon(ip);
  }

  const count = (naughtyCountByIP.get(ip) ?? 0) + 1;
  naughtyCountByIP.set(ip, count);

  if (count >= NAUGHTY_LIMIT) {
    bannedIPs.add(ip);
    return { naughtyCount: count, banned: true };
  }

  return { naughtyCount: count, banned: false };
}
