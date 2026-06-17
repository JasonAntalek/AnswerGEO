interface CompetitorListProps {
  competitors: Array<{ name: string; mentions: number }>;
}

export function CompetitorList({ competitors }: CompetitorListProps) {
  if (competitors.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Top Competitors</h3>
        <p className="mt-2 text-sm text-slate-600">No competitor names were extracted from AI responses.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Top Competitors in AI Answers</h3>
      <ol className="mt-4 space-y-3">
        {competitors.map((competitor, index) => (
          <li
            key={competitor.name}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
          >
            <span className="font-medium text-slate-800">
              {index + 1}. {competitor.name}
            </span>
            <span className="text-sm text-slate-500">{competitor.mentions} mention(s)</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
