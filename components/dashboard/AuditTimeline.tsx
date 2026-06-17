import Link from "next/link";
import type { AuditHistoryItem } from "@/lib/types";

export function AuditTimeline({ history }: { history: AuditHistoryItem[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-600">No audits yet. Run your first audit below.</p>;
  }

  return (
    <ol className="space-y-3">
      {history.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
        >
          <div>
            <p className="font-medium text-slate-900">Run #{item.runNumber}</p>
            <p className="text-sm text-slate-500">
              {new Date(item.createdAt).toLocaleString()} · {item.status}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">{item.visibilityScore ?? "—"}</span>
            {item.status === "complete" ? (
              <Link href={`/audit/${item.id}`} className="text-sm text-indigo-600 hover:underline">
                View report
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
