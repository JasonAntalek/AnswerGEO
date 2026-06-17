interface ScoreGaugeProps {
  score: number;
  label: string;
}

export function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const color =
    score >= 75 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        AI Visibility Score
      </p>
      <div className="mt-3 flex items-end gap-3">
        <span className={`text-5xl font-bold ${color}`}>{score}</span>
        <span className="pb-2 text-lg text-slate-500">/ 100</span>
      </div>
      <p className={`mt-2 text-base font-semibold ${color}`}>{label}</p>
    </div>
  );
}
