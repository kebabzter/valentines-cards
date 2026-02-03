import { NextRequest, NextResponse } from "next/server";
import { addCard, getAllCards } from "@/lib/cardsStore";
import { getUnlockInstantUtc, isUnlockedAmsterdam } from "@/lib/amsterdamTime";
import { checkRateLimit, getClientIP } from "@/lib/rateLimiter";
import { isCardContentBlacklisted } from "@/lib/blacklist";
import { isBanned, recordNaughtyAttempt } from "@/lib/naughtyBan";

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

// POST does NOT check isUnlockedAmsterdam() — submissions are allowed anytime;
// only viewing the wall (GET) is locked until Valentine's Day.
export async function POST(req: NextRequest) {
  try {
    // Banned check (naughty attempts)
    const clientIP = getClientIP(req);
    if (await isBanned(clientIP)) {
      return NextResponse.json(
        {
          banned: true,
          naughty: true,
          error: "You have been banned.",
          message:
            "Your IP has been banned after repeated inappropriate submissions.",
        },
        { status: 403 },
      );
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const headers: Record<string, string> = {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(rateLimit.resetAt),
      };
      if (Number.isFinite(rateLimit.resetAt)) {
        headers["Retry-After"] = String(
          Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        );
      }
      return NextResponse.json(
        {
          error: "Too many submissions.",
          message:
            "You've reached the maximum of 5 cards per person. No more submissions allowed from this device.",
        },
        { status: 429, headers },
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

    const from = typeof fromName === "string" ? fromName.trim() : "";
    const to = typeof toName === "string" ? toName.trim() : "";

    if (!to) {
      return NextResponse.json(
        { error: "Recipient (To) is required" },
        { status: 400 },
      );
    }

    if (isCardContentBlacklisted(message, from, to)) {
      const { naughtyCount, banned } = await recordNaughtyAttempt(clientIP);

      if (banned) {
        return NextResponse.json(
          {
            banned: true,
            naughty: true,
            naughtyAttempts: naughtyCount,
            error: "You have been banned.",
            message:
              "Your IP has been banned after 3 inappropriate submission attempts.",
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          naughty: true,
          naughtyAttempts: naughtyCount,
          error: "Your submission contains language that isn't allowed.",
          message: "Please remove offensive content and try again.",
        },
        { status: 400 },
      );
    }

    const card = await addCard({
      fromName: from,
      toName: to,
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

