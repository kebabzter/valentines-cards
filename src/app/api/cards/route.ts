import { NextRequest, NextResponse } from "next/server";
import { addCard, getAllCards } from "@/lib/cardsStore";
import { getUnlockInstantUtc, isUnlockedAmsterdam } from "@/lib/amsterdamTime";
import { checkRateLimit, getClientIP } from "@/lib/rateLimiter";

export async function GET() {
  try {
    if (!isUnlockedAmsterdam()) {
      return NextResponse.json(
        {
          error: "Cards are locked until Valentine's Day (Amsterdam time).",
          unlocked: false,
          unlockAtUtc: getUnlockInstantUtc().toISOString(),
        },
        { status: 423 },
      );
    }
    const cards = await getAllCards();
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Failed to load cards", error);
    return NextResponse.json(
      { error: "Failed to load cards" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: "Too many submissions. Please try again later.",
          resetAt: resetDate.toISOString(),
          message: `You can submit up to 5 cards per hour. Try again after ${resetDate.toLocaleTimeString()}.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetAt),
          },
        },
      );
    }

    const body = await req.json();
    const { fromName = "", toName = "", message = "", anonymous = false } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const card = await addCard({
      fromName: typeof fromName === "string" ? fromName : "",
      toName: typeof toName === "string" ? toName : "",
      message: message.slice(0, 1000),
      anonymous: Boolean(anonymous),
    });

    return NextResponse.json(card, {
      status: 201,
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt),
      },
    });
  } catch (error) {
    console.error("Failed to save card", error);
    return NextResponse.json(
      { error: "Failed to save card" },
      { status: 500 },
    );
  }
}

