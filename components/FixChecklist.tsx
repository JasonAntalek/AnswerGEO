import type { Recommendation } from "@/lib/types";

interface FixChecklistProps {
  recommendations: Recommendation[];
}

export function FixChecklist({ recommendations }: FixChecklistProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Prioritized Fixes</h3>
      <div className="mt-4 space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.title} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                P{rec.priority}
              </span>
              <h4 className="font-semibold text-slate-900">{rec.title}</h4>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{rec.description}</p>
            {rec.metricTarget ? (
              <p className="mt-2 text-sm font-medium text-indigo-700">{rec.metricTarget}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
