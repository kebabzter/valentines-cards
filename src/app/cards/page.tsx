"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getUnlockInstantUtc } from "@/lib/amsterdamTime";
import { Navigation } from "@/components/Navigation";

type Card = {
  id: string;
  fromName: string;
  toName: string;
  message: string;
  anonymous: boolean;
  createdAt: string;
};

const UNLOCK_AT_UTC = getUnlockInstantUtc();

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const timeLeft = useMemo(() => {
    return formatDuration(UNLOCK_AT_UTC.getTime() - now);
  }, [now]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch("/api/cards");
        if (res.status === 423) {
          setLocked(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to load cards");
        const data: Card[] = await res.json();
        // Newest first
        setCards(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg space-y-5 card-surface rounded-3xl border border-pink-100 p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-pink-900">
              Valentine&apos;s Wall
            </h1>
            <Navigation />
          </div>
          <p className="text-pink-800 text-center">
            💌 It is almost time... The wall unlocks soon!
          </p>
          <div className="mt-2 rounded-2xl border border-pink-100 bg-white/60 px-5 py-4">
            <div className="text-sm text-pink-700 uppercase tracking-widest mb-2">
              Countdown
            </div>
            <div className="flex items-end justify-center gap-4 text-pink-950">
              <div>
                <div className="text-3xl font-extrabold tabular-nums">
                  {timeLeft.days}
                </div>
                <div className="text-xs text-pink-700">days</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold tabular-nums">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-xs text-pink-700">hours</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold tabular-nums">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs text-pink-700">minutes</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold tabular-nums">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs text-pink-700">seconds</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-pink-700">
            Developer? Use the hidden preview at{" "}
            <Link href="/preview" className="underline font-medium">
              /preview
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-pink-900">
              Valentine&apos;s Wall of Love
            </h1>
            <Navigation />
          </div>
          <p className="text-pink-800 text-center sm:text-left">
            All the sweet messages people have written.
          </p>
        </header>

        {loading ? (
          <p className="text-center text-pink-800">Loading cards...</p>
        ) : cards.length === 0 ? (
          <p className="text-center text-pink-800">
            No cards yet, but they&apos;re on the way!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.id}
                className="rounded-2xl card-surface shadow-md border border-pink-100 p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="text-sm text-pink-700 uppercase tracking-wide">
                    To{" "}
                    <span className="font-semibold">
                      {card.toName || "someone special"}
                    </span>
                  </div>
                  <p className="text-pink-950 whitespace-pre-line">
                    {card.message}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm text-pink-700">
                  <span>
                    From{" "}
                    <span className="font-semibold">
                      {card.anonymous
                        ? "someone who cares"
                        : card.fromName || "someone who cares"}
                    </span>
                  </span>
                  <span className="text-pink-500">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

