export const AMSTERDAM_TZ = "Europe/Amsterdam";
export const UNLOCK_DATE_AMS = "2026-02-14"; // YYYY-MM-DD in Amsterdam time

export function getAmsterdamDateString(date: Date = new Date()): string {
  // en-CA gives YYYY-MM-DD reliably
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AMSTERDAM_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isUnlockedAmsterdam(date: Date = new Date()): boolean {
  return getAmsterdamDateString(date) >= UNLOCK_DATE_AMS;
}

function formatInTzParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: AMSTERDAM_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second,
  };
}

/**
 * Returns a UTC Date representing 00:00:00 in Amsterdam on UNLOCK_DATE_AMS.
 * Implemented without external deps: try offsets until the zoned parts match.
 */
export function getUnlockInstantUtc(): Date {
  const [y, m, d] = UNLOCK_DATE_AMS.split("-").map(Number);
  // Desired Amsterdam local time = 00:00:00
  const desired = {
    year: String(y).padStart(4, "0"),
    month: String(m).padStart(2, "0"),
    day: String(d).padStart(2, "0"),
    hour: "00",
    minute: "00",
    second: "00",
  };

  // Start from UTC midnight and search plausible timezone offsets.
  // Offsets in minutes (step 30 to cover most zones; Amsterdam is 60).
  const utcBase = Date.UTC(y, m - 1, d, 0, 0, 0);
  for (let offsetMin = -12 * 60; offsetMin <= 14 * 60; offsetMin += 30) {
    const candidate = new Date(utcBase - offsetMin * 60_000);
    const parts = formatInTzParts(candidate);
    if (
      parts.year === desired.year &&
      parts.month === desired.month &&
      parts.day === desired.day &&
      parts.hour === desired.hour &&
      parts.minute === desired.minute &&
      parts.second === desired.second
    ) {
      return candidate;
    }
  }

  // Fallback: for Feb 14 in Amsterdam it's usually UTC+1, so 23:00Z previous day
  return new Date(Date.UTC(y, m - 1, d - 1, 23, 0, 0));
}

