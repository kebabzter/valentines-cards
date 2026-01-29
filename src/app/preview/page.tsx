"use client";

import { FormEvent, useEffect, useState } from "react";
import { getUnlockInstantUtc } from "@/lib/amsterdamTime";
import { Navigation } from "@/components/Navigation";
import { PaginatedCardGrid } from "@/components/PaginatedCardGrid";
import type { CardData } from "@/components/Card";

const UNLOCK_AT_UTC = getUnlockInstantUtc();

export default function PreviewPage() {
  const [token, setToken] = useState("");
  const [cards, setCards] = useState<CardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("previewToken") ?? "";
    if (saved) setToken(saved);
  }, []);

  async function loadCards(t: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/preview/cards?token=${encodeURIComponent(t)}`);
      if (!res.ok) throw new Error("Invalid token or preview disabled");
      const data: CardData[] = await res.json();
      setCards(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (e) {
      setCards([]);
      setError(e instanceof Error ? e.message : "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    window.localStorage.setItem("previewToken", token);
    await loadCards(token);
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
      <div className="flex justify-center py-3 sm:py-0 sm:hidden">
        <Navigation />
      </div>
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-4 rounded-2xl card-surface border border-pink-100 p-6 sm:p-8 shadow-lg shadow-pink-200/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-extrabold text-pink-900 text-center sm:text-left">
              Developer Preview
            </h1>
            <div className="hidden sm:block">
              <Navigation />
            </div>
          </div>
          <p className="text-pink-800 text-center sm:text-left text-sm sm:text-base leading-relaxed">
            This page is hidden. Cards unlock publicly at{" "}
            <span className="font-semibold">
              {UNLOCK_AT_UTC.toLocaleString()}
            </span>{" "}
            (UTC).
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="card-surface rounded-2xl sm:rounded-3xl border border-pink-100 p-6 sm:p-8 shadow-xl shadow-pink-200/30 flex flex-col gap-4"
        >
          <label className="text-sm font-medium text-pink-900">
            Preview token
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste PREVIEW_TOKEN here"
              className="flex-1 min-w-0 rounded-xl border border-pink-200 bg-white/80 px-4 py-3 text-pink-950 text-base shadow-sm placeholder:text-pink-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-1 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !token}
              className="rounded-xl bg-pink-600 px-6 py-3 text-white font-semibold shadow-lg shadow-pink-300/30 hover:bg-pink-700 hover:shadow-xl hover:shadow-pink-300/40 disabled:bg-pink-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 min-h-[44px] sm:min-h-0"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </form>

        {cards.length > 0 && (
          <div className="pt-2">
            <PaginatedCardGrid cards={cards} />
          </div>
        )}
      </div>
    </div>
  );
}

