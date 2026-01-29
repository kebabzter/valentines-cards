"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import type { CardData } from "@/components/Card";

const PAGE_SIZE = 8;

type PaginatedCardGridProps = {
  cards: CardData[];
  pageSize?: number;
};

export function PaginatedCardGrid({
  cards,
  pageSize = PAGE_SIZE,
}: PaginatedCardGridProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageCards = cards.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [cards.length]);

  if (cards.length === 0) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        {pageCards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-3 pt-6 pb-2"
          aria-label="Card pagination"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-pink-200 bg-white/90 px-5 py-2.5 text-sm font-medium text-pink-800 shadow-sm hover:bg-pink-50 hover:border-pink-300 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 min-h-[44px] sm:min-h-0"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-pink-700">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-pink-200 bg-white/90 px-5 py-2.5 text-sm font-medium text-pink-800 shadow-sm hover:bg-pink-50 hover:border-pink-300 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 min-h-[44px] sm:min-h-0"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
