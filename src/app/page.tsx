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
    <div className="min-h-screen flex items-center justify-center px-4">
      <main className="w-full max-w-2xl rounded-3xl card-surface shadow-xl border border-pink-100 p-8 space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-pink-900">
              Valentine&apos;s Cards
            </h1>
            <Navigation />
          </div>
          <p className="text-pink-800 text-center sm:text-left">
            Write a sweet message to someone special. All cards will appear
            together on the Valentine&apos;s Day wall.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
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
                className="w-full rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-2 text-pink-950 shadow-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            <div className="space-y-1">
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
                className="w-full rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-2 text-pink-950 shadow-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
          </div>

          <div className="space-y-1">
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
              className="w-full rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-2 text-pink-950 shadow-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
            <p className="text-xs text-pink-700">
              Max 1000 characters. Your message will be visible when the wall
              unlocks. Limit: 5 cards per hour per person.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-pink-900">
              <input
                type="checkbox"
                name="anonymous"
                className="h-4 w-4 rounded border-pink-300 text-pink-600 focus:ring-pink-400"
              />
              <span>Keep my name hidden on the public wall</span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Card saved! It will appear on the Valentine&apos;s Day wall.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-pink-600 py-3 text-white font-semibold shadow-md hover:bg-pink-700 disabled:bg-pink-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Sending..." : "Send Valentine"}
          </button>
        </form>
      </main>
    </div>
  );
}
