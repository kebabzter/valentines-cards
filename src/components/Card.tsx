export type CardData = {
  id: string;
  fromName: string;
  toName: string;
  message: string;
  anonymous: boolean;
  createdAt: string;
};

type CardProps = {
  card: CardData;
};

export function Card({ card }: CardProps) {
  return (
    <article
      className="relative overflow-hidden rounded-xl sm:rounded-2xl card-surface border border-pink-100/80 p-5 sm:p-6 flex flex-col justify-between shadow-lg shadow-pink-200/20 transition-all duration-300 hover:shadow-xl hover:shadow-pink-300/25 hover:-translate-y-0.5 hover:border-pink-200 active:translate-y-0"
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-pink-400 via-rose-400 to-pink-500 rounded-l-xl sm:rounded-l-2xl"
        aria-hidden
      />
      <div className="pl-3 space-y-2 sm:space-y-3 relative">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-pink-400 text-base sm:text-lg opacity-80 shrink-0" aria-hidden>
            ♥
          </span>
          <div className="text-xs sm:text-sm text-pink-600 uppercase tracking-widest font-medium truncate">
            To{" "}
            <span className="font-semibold text-pink-800 normal-case">
              {card.toName || "someone special"}
            </span>
          </div>
        </div>
        <p className="text-pink-950 whitespace-pre-line text-sm sm:text-[15px] leading-relaxed">
          {card.message}
        </p>
      </div>
      <div className="mt-3 sm:mt-4 pl-3 flex flex-wrap justify-between items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-pink-600 border-t border-pink-100 pt-3">
        <span className="min-w-0">
          From{" "}
          <span className="font-semibold text-pink-700">
            {card.anonymous
              ? "someone who cares"
              : card.fromName || "someone who cares"}
          </span>
        </span>
        <span className="text-pink-400 text-xs tabular-nums shrink-0">
          {new Date(card.createdAt).toLocaleDateString()}
        </span>
      </div>
    </article>
  );
}
