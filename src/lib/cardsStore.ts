import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

const DATA_DIR = path.join(process.cwd(), "data");
const CARDS_FILE = path.join(DATA_DIR, "cards.json");

export type Card = {
  id: string;
  fromName: string;
  toName: string;
  message: string;
  anonymous: boolean;
  createdAt: string;
};

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

function rowToCard(row: {
  id: string;
  from_name: string;
  to_name: string;
  message: string;
  anonymous: boolean;
  created_at: Date | string;
}): Card {
  const createdAt =
    typeof row.created_at === "string"
      ? row.created_at
      : row.created_at.toISOString();
  return {
    id: row.id,
    fromName: row.from_name ?? "",
    toName: row.to_name ?? "",
    message: row.message,
    anonymous: row.anonymous ?? false,
    createdAt,
  };
}

async function getAllCardsNeon(): Promise<Card[]> {
  const sql = neon(connectionString);
  const rows = await sql`
    SELECT id, from_name, to_name, message, anonymous, created_at
    FROM cards
    ORDER BY created_at DESC
  `;
  return (rows as Parameters<typeof rowToCard>[0][]).map(rowToCard);
}

async function addCardNeon(
  input: Omit<Card, "id" | "createdAt">,
): Promise<Card> {
  const sql = neon(connectionString);
  const rows = await sql`
    INSERT INTO cards (from_name, to_name, message, anonymous)
    VALUES (${input.fromName}, ${input.toName}, ${input.message}, ${input.anonymous})
    RETURNING id, from_name, to_name, message, anonymous, created_at
  `;
  const row = (rows as Parameters<typeof rowToCard>[0][])[0];
  if (!row) throw new Error("Insert did not return a row");
  return rowToCard(row);
}

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(CARDS_FILE);
  } catch {
    await fs.writeFile(CARDS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

export async function getAllCards(): Promise<Card[]> {
  if (connectionString) {
    return getAllCardsNeon();
  }
  await ensureDataFile();
  const raw = await fs.readFile(CARDS_FILE, "utf8");
  return JSON.parse(raw) as Card[];
}

export async function addCard(input: Omit<Card, "id" | "createdAt">) {
  if (connectionString) {
    return addCardNeon(input);
  }
  await ensureDataFile();
  const cards = await getAllCards();
  const newCard: Card = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  cards.push(newCard);
  await fs.writeFile(CARDS_FILE, JSON.stringify(cards, null, 2), "utf8");
  return newCard;
}
