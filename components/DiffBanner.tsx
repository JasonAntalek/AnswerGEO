import Link from "next/link";
import type { AuditDiff } from "@/lib/types";

export function DiffBanner({
  diff,
  businessId,
}: {
  diff: AuditDiff;
  businessId: string;
}) {
  if (!diff.previousAuditId || diff.scoreDelta === null) return null;

  const delta = diff.scoreDelta;
  const label =
    delta > 0
      ? `Score improved by +${delta} since your last audit`
      : delta < 0
        ? `Score dropped by ${delta} since your last audit`
        : "Score unchanged since your last audit";

  const color =
    delta > 0 ? "border-emerald-200 bg-emerald-50" : delta < 0 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <p className="font-medium text-slate-900">{label}</p>
      <Link
        href={`/dashboard/businesses/${businessId}/compare`}
        className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
      >
        View full comparison →
      </Link>
    </div>
  );
}
