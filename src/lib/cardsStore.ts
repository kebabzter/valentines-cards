import { promises as fs } from "fs";
import path from "path";

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

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(CARDS_FILE);
  } catch {
    await fs.writeFile(CARDS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

export async function getAllCards(): Promise<Card[]> {
  await ensureDataFile();
  const raw = await fs.readFile(CARDS_FILE, "utf8");
  return JSON.parse(raw) as Card[];
}

export async function addCard(input: Omit<Card, "id" | "createdAt">) {
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

