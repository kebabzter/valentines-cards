import { NextRequest, NextResponse } from "next/server";
import { getAllCards } from "@/lib/cardsStore";

function isAuthorized(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const expected = process.env.PREVIEW_TOKEN ?? "";
  return Boolean(expected) && token === expected;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const cards = await getAllCards();
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Failed to load cards (preview)", error);
    return NextResponse.json(
      { error: "Failed to load cards" },
      { status: 500 },
    );
  }
}

