import Link from "next/link";
import type { TrackedBusiness } from "@/lib/types";

export function BusinessCard({ business }: { business: TrackedBusiness }) {
  const score = business.latestScore ?? 0;
  const scoreColor =
    score >= 75 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{business.businessName}</h3>
          <p className="text-sm text-slate-600">
            {business.category} · {business.city}, {business.state}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${scoreColor}`}>{business.latestScore ?? "—"}</p>
          <p className="text-xs text-slate-500">latest score</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>{business.auditCount} audit(s)</span>
        {business.lastAuditedAt ? (
          <span>Last run {new Date(business.lastAuditedAt).toLocaleDateString()}</span>
        ) : (
          <span>Not audited yet</span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/dashboard/businesses/${business.id}`}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          View history
        </Link>
        <Link
          href={`/dashboard/businesses/${business.id}/compare`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Compare runs
        </Link>
      </div>
    </div>
  );
}
