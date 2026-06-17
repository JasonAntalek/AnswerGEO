import type { PlatformResult } from "@/lib/types";

interface PlatformCardsProps {
  results: PlatformResult[];
}

const LABELS: Record<PlatformResult["platform"], string> = {
  openai: "ChatGPT",
  gemini: "Google Gemini",
};

export function PlatformCards({ results }: PlatformCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {results.map((result) => (
        <div key={result.platform} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{LABELS[result.platform]}</h3>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                !result.available
                  ? "bg-slate-100 text-slate-600"
                  : result.userMentioned
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
              }`}
            >
              {!result.available
                ? "Unavailable"
                : result.userMentioned
                  ? `Mentioned #${result.userPosition}`
                  : "Not mentioned"}
            </span>
          </div>
          {result.error ? (
            <p className="mt-3 text-sm text-slate-500">{result.error}</p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {result.businesses.slice(0, 5).map((business) => (
                <li key={business}>• {business}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
