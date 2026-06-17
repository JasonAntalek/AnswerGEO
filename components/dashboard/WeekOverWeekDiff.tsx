import type { AuditDiff } from "@/lib/types";

const PLATFORM_LABELS = {
  openai: "ChatGPT",
  gemini: "Google Gemini",
} as const;

export function WeekOverWeekDiff({ diff }: { diff: AuditDiff }) {
  if (!diff.previousAuditId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Run a second audit to see week-over-week changes.</p>
      </div>
    );
  }

  const delta = diff.scoreDelta ?? 0;
  const deltaColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-slate-600";
  const deltaPrefix = delta > 0 ? "+" : "";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Score change</h3>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {diff.previousScore} → {diff.currentScore}
          <span className={`ml-3 text-xl ${deltaColor}`}>
            ({deltaPrefix}{delta})
          </span>
        </p>
        {diff.daysBetween !== null ? (
          <p className="mt-1 text-sm text-slate-500">{diff.daysBetween} day(s) between runs</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Platform shifts</h3>
        <div className="mt-3 space-y-2">
          {diff.platformChanges.map((change) => (
            <div key={change.platform} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="font-medium">{PLATFORM_LABELS[change.platform]}: </span>
              {change.previousMentioned ? `#${change.previousPosition ?? "?"}` : "not mentioned"}
              {" → "}
              {change.currentMentioned ? `#${change.currentPosition ?? "?"}` : "not mentioned"}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">New competitors</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {diff.newCompetitors.length ? (
              diff.newCompetitors.map((name) => <li key={name}>• {name}</li>)
            ) : (
              <li>No new competitors detected</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Dropped competitors</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {diff.droppedCompetitors.length ? (
              diff.droppedCompetitors.map((name) => <li key={name}>• {name}</li>)
            ) : (
              <li>No competitors dropped</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
