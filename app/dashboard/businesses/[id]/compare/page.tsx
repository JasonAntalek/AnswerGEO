import Link from "next/link";
import { notFound } from "next/navigation";
import { WeekOverWeekDiff } from "@/components/dashboard/WeekOverWeekDiff";
import { getCurrentUser } from "@/lib/auth/session";
import { getBusinessDiff, getBusinessForUser } from "@/lib/business/service";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;
  const business = await getBusinessForUser(id, user.id);
  if (!business) notFound();

  const diff = await getBusinessDiff(id, user.id);

  return (
    <div>
      <Link
        href={`/dashboard/businesses/${id}`}
        className="text-sm text-indigo-600 hover:underline"
      >
        ← Back to {business.businessName}
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Week-over-week comparison</h1>
      <p className="mt-1 text-slate-600">
        Latest audit vs previous run for {business.businessName}
      </p>

      <div className="mt-8">
        {diff ? <WeekOverWeekDiff diff={diff} /> : <p>No comparison data available.</p>}
      </div>
    </div>
  );
}
