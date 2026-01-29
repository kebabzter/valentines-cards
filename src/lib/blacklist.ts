/**
 * Content blacklist for card submissions.
 * Normalizes text (lowercase, leetspeak, spacing) so evasions are caught.
 */

// Leetspeak / common substitution map (char -> canonical letter)
const NORMALIZE_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "6": "g",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  "!": "i",
  "|": "i",
  "$": "s",
  "+": "t",
  "(": "c",
  "<": "c",
  "€": "e",
  "§": "s",
  "¥": "y",
  "×": "x",
  "©": "c",
  "®": "r",
  "™": "tm",
  "°": "o",
  "²": "2",
  "³": "3",
  "µ": "u",
  "¿": "?",
  "¡": "i",
};

// Zero-width and similar chars to strip
const STRIP_PATTERN = /[\s\u200B-\u200D\u2060\u00AD\u200E\u200F\u202A-\u202E\u2066-\u2069*._\-[\]#\\/;:'"<>{}()]/g;

function normalize(text: string): string {
  let s = text.toLowerCase().replace(STRIP_PATTERN, "");
  return s
    .split("")
    .map((c) => NORMALIZE_MAP[c] ?? c)
    .join("");
}

/**
 * Blacklist: canonical forms only. Normalization of user input handles
 * leetspeak, spaces, punctuation, and common substitutions.
 */
const BLACKLIST_TERMS: string[] = [
  "nigger",
  "nigga",
  "negro",
  "nigg",
  "niggar",
  "faggot",
  "fag",
  "fagg",
  "fagot",
  "fgt",
  "chink",
  "chinky",
  "gook",
  "kike",
  "kyke",
  "spic",
  "spick",
  "wetback",
  "paki",
  "raghead",
  "towelhead",
  "coon",
  "darkie",
  "darky",
  "beaner",
  "gyp",
  "gypsy",
  "retard",
  "retarded",
  "rtard",
  "tranny",
  "trannies",
  "shemale",
  "heshe",
  "dyke",
  "dyk",
  "whore",
  "slut",
  "cunt",
  "fck",
  "fuk",
  "fuc",
  "nazi",
  "hitler",
  "heil",
  "whitepower",
  "killjew",
  "killjews",
  "gasjew",
  "gasthe",
  "finalsolution",
  "kys",
  "killyourself",
  "diejew",
  "jewdie",
];

// Pre-normalized: same as canonical since terms are already plain letters
const NORMALIZED_TERMS = BLACKLIST_TERMS.map((t) => normalize(t));

/**
 * Returns true if the given text contains any blacklisted term (or a
 * normalized evasion of one). Checks message, from, and to fields together.
 */
export function containsBlacklistedTerm(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const normalized = normalize(text);
  return NORMALIZED_TERMS.some((term) => normalized.includes(term));
}

/**
 * Check all card fields. Returns true if any field contains blacklisted content.
 */
export function isCardContentBlacklisted(
  message: string,
  fromName: string,
  toName: string,
): boolean {
  const combined = [message, fromName, toName]
    .filter(Boolean)
    .join(" ");
  return containsBlacklistedTerm(combined);
}
