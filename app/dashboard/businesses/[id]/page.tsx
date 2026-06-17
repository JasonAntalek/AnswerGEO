import Link from "next/link";
import { notFound } from "next/navigation";
import { AuditTimeline } from "@/components/dashboard/AuditTimeline";
import { RerunAuditButton } from "@/components/dashboard/RerunAuditButton";
import { getCurrentUser } from "@/lib/auth/session";
import { getBusinessForUser, getBusinessHistory } from "@/lib/business/service";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;
  const business = await getBusinessForUser(id, user.id);
  if (!business) notFound();

  const history = await getBusinessHistory(id, user.id);

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{business.businessName}</h1>
          <p className="text-slate-600">
            {business.category} · {business.city}, {business.state}
          </p>
        </div>
        <RerunAuditButton businessId={business.id} />
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/dashboard/businesses/${business.id}/compare`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
        >
          Compare latest vs previous
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Audit history</h2>
        <div className="mt-4">
          <AuditTimeline history={history} />
        </div>
      </div>
    </div>
  );
}
