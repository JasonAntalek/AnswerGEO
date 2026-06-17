"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SERVICE_CATEGORIES, US_STATES } from "@/lib/constants";

const STEPS = [
  "Submitting business details",
  "Querying ChatGPT",
  "Querying Google Gemini",
  "Building your report",
];

export function AuditForm({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStepIndex(0);

    const form = new FormData(event.currentTarget);
    const payload = {
      businessName: String(form.get("businessName") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      category: String(form.get("category") ?? ""),
      email: String(form.get("email") ?? ""),
    };

    const progressTimer = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
    }, 1800);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, saveToAccount: isLoggedIn }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Audit failed");
      }

      router.push(`/audit/${data.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Something went wrong",
      );
    } finally {
      window.clearInterval(progressTimer);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      {isLoggedIn ? (
        <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Signed in — this audit will be saved to your dashboard.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessName" className="mb-1 block text-sm font-medium text-slate-700">
            Business name
          </label>
          <input
            id="businessName"
            name="businessName"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-indigo-500 focus:ring-2"
            placeholder="Joe's Roofing LLC"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">
              City
            </label>
            <input
              id="city"
              name="city"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-indigo-500 focus:ring-2"
              placeholder="Austin"
            />
          </div>
          <div>
            <label htmlFor="state" className="mb-1 block text-sm font-medium text-slate-700">
              State
            </label>
            <select
              id="state"
              name="state"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-indigo-500 focus:ring-2"
              defaultValue=""
            >
              <option value="" disabled>
                Select state
              </option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
            Service category
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-indigo-500 focus:ring-2"
            defaultValue=""
          >
            <option value="" disabled>
              Select category
            </option>
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email (optional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-indigo-500 focus:ring-2"
            placeholder="owner@business.com"
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {loading ? (
          <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            {STEPS[stepIndex]}...
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Running audit..." : "Run Free Audit"}
        </button>
      </form>
    </div>
  );
}
