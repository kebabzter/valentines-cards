"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getUnlockInstantUtc } from "@/lib/amsterdamTime";
import { Navigation } from "@/components/Navigation";
import { PaginatedCardGrid } from "@/components/PaginatedCardGrid";
import type { CardData } from "@/components/Card";

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
  const [cards, setCards] = useState<CardData[]>([]);
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
        const data: CardData[] = await res.json();
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
      <div className="min-h-screen flex flex-col px-4 sm:px-6 py-6 sm:py-12 sm:justify-center sm:items-center">
        <div className="flex justify-center py-3 sm:py-0 sm:hidden">
          <Navigation />
        </div>
        <div className="max-w-lg w-full space-y-6 card-surface rounded-2xl sm:rounded-3xl border border-pink-100 p-6 sm:p-10 shadow-xl shadow-pink-200/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-extrabold text-pink-900 text-center sm:text-left">
              Valentine&apos;s Wall
            </h1>
            <div className="hidden sm:block">
              <Navigation />
            </div>
          </div>
          <p className="text-pink-800 text-center text-sm sm:text-base">
            💌 It is almost time... The wall unlocks soon!
          </p>
          <div className="mt-2 rounded-xl sm:rounded-2xl border border-pink-100 bg-white/60 px-4 sm:px-6 py-4 sm:py-5">
            <div className="text-xs sm:text-sm text-pink-700 uppercase tracking-widest mb-2 text-center">
              Countdown
            </div>
            <div className="flex items-end justify-center gap-2 sm:gap-4 text-pink-950">
              <div className="text-center min-w-12 sm:min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                  {timeLeft.days}
                </div>
                <div className="text-[10px] sm:text-xs text-pink-700">days</div>
              </div>
              <div className="text-center min-w-10 sm:min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-pink-700">hours</div>
              </div>
              <div className="text-center min-w-10 sm:min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-pink-700">minutes</div>
              </div>
              <div className="text-center min-w-10 sm:min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-pink-700">seconds</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-pink-700 text-center sm:text-left">
            Developer{" "}
            <Link href="/preview" className="underline font-medium">
              preview
            </Link>
            . If you are not the dev you won&apos;t find anything here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
      <div className="flex justify-center py-3 sm:py-0 sm:hidden">
        <Navigation />
      </div>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 sm:mb-12 space-y-4 rounded-2xl card-surface border border-pink-100 p-6 sm:p-8 shadow-lg shadow-pink-200/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-extrabold text-pink-900 text-center sm:text-left">
              Valentine&apos;s Wall of Love
            </h1>
            <div className="hidden sm:block">
              <Navigation />
            </div>
          </div>
          <p className="text-pink-800 text-center sm:text-left text-sm sm:text-base leading-relaxed">
            All the amazing messages people have written.
          </p>
        </header>

        {loading ? (
          <p className="text-center text-pink-700 py-12 text-base">Loading cards...</p>
        ) : cards.length === 0 ? (
          <p className="text-center text-pink-700 py-12 text-base rounded-2xl card-surface border border-pink-100 p-8">
            No cards yet, but they&apos;re on the way!
          </p>
        ) : (
          <div className="pt-2">
            <PaginatedCardGrid cards={cards} />
          </div>
        )}
      </div>
    </div>
  );
}

