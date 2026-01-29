 "use client";

import { FormEvent, useState } from "react";
import { Navigation } from "@/components/Navigation";

export default function Home() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const payload = {
      fromName: formData.get("fromName")?.toString() ?? "",
      toName: formData.get("toName")?.toString() ?? "",
      message: formData.get("message")?.toString() ?? "",
      anonymous: formData.get("anonymous") === "on",
    };

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Show the detailed message if available (for rate limiting)
        throw new Error(data.message || data.error || "Something went wrong");
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-4 sm:px-6 py-6 sm:py-12 sm:justify-center sm:items-center">
      <div className="flex justify-center py-3 sm:py-0 sm:hidden">
        <Navigation />
      </div>
      <main className="w-full max-w-2xl rounded-2xl sm:rounded-3xl card-surface shadow-xl shadow-pink-200/30 border border-pink-100 p-6 sm:p-10 space-y-8">
        <header className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-extrabold text-pink-900 text-center sm:text-left">
              Valentine&apos;s Cards
            </h1>
            <div className="hidden sm:block">
              <Navigation />
            </div>
          </div>
          <p className="text-pink-800 text-center sm:text-left text-sm sm:text-base leading-relaxed">
            Write a sweet message to someone special. All cards will appear
            together on the Valentine&apos;s Day wall.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="toName"
                className="block text-sm font-medium text-pink-900"
              >
                To
              </label>
              <input
                id="toName"
                name="toName"
                type="text"
                placeholder="Their name (optional)"
                className="w-full rounded-xl border border-pink-200 bg-white/80 px-4 py-3 text-pink-950 placeholder:text-pink-400 shadow-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-1 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="fromName"
                className="block text-sm font-medium text-pink-900"
              >
                From
              </label>
              <input
                id="fromName"
                name="fromName"
                type="text"
                placeholder="Your name (optional)"
                className="w-full rounded-xl border border-pink-200 bg-white/80 px-4 py-3 text-pink-950 placeholder:text-pink-400 shadow-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-1 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-pink-900"
            >
              Your message <span className="text-pink-600">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              maxLength={1000}
              placeholder="Write something kind, cheesy, or poetic..."
              className="w-full rounded-xl border border-pink-200 bg-white/80 px-4 py-3 text-pink-950 placeholder:text-pink-400 shadow-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-1 transition-colors resize-y min-h-[120px]"
            />
            <p className="text-xs text-pink-600">
              Max 1000 characters. Your message will be visible when the wall
              unlocks. Limit: 5 cards per hour per person.
            </p>
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4">
            <label className="inline-flex items-start sm:items-center gap-3 text-sm text-pink-900 cursor-pointer min-h-[44px] sm:min-h-0 pt-0.5 sm:pt-0">
              <input
                type="checkbox"
                name="anonymous"
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded border-pink-300 text-pink-600 focus:ring-pink-400 shrink-0"
              />
              <span>Keep my name hidden on the public wall</span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              Card saved! It will appear on the Valentine&apos;s Day wall.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-pink-600 py-4 px-6 text-white font-semibold shadow-lg shadow-pink-300/30 hover:bg-pink-700 hover:shadow-xl hover:shadow-pink-300/40 disabled:bg-pink-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
          >
            {submitting ? "Sending..." : "Send Valentine"}
          </button>
        </form>
      </main>
    </div>
  );
}
