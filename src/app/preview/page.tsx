"use client";

import { FormEvent, useEffect, useState } from "react";
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

export default function PreviewPage() {
  const [token, setToken] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
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
      const data: Card[] = await res.json();
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
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-pink-900">
              Developer Preview
            </h1>
            <Navigation />
          </div>
          <p className="text-pink-800 text-center sm:text-left">
            This page is hidden. Cards unlock publicly at{" "}
            <span className="font-semibold">
              {UNLOCK_AT_UTC.toLocaleString()}
            </span>{" "}
            (UTC).
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="card-surface rounded-3xl border border-pink-100 p-6 shadow-xl flex flex-col gap-3"
        >
          <label className="text-sm font-medium text-pink-900">
            Preview token
          </label>
          <div className="flex gap-3">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste PREVIEW_TOKEN here"
              className="flex-1 rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-2 text-pink-950 shadow-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
            <button
              type="submit"
              disabled={loading || !token}
              className="rounded-full bg-pink-600 px-5 py-2 text-white font-semibold shadow-md hover:bg-pink-700 disabled:bg-pink-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {cards.length > 0 && (
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

