import Link from "next/link";
import { BusinessCard } from "@/components/dashboard/BusinessCard";
import { getCurrentUser } from "@/lib/auth/session";
import { listBusinesses } from "@/lib/business/service";
import { isDatabaseConfigured } from "@/lib/db";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const businesses = user ? await listBusinesses(user.id) : [];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your businesses</h1>
          <p className="mt-1 text-slate-600">
            Track AI visibility and compare audit runs over time.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Run new audit
        </Link>
      </div>

      {!isDatabaseConfigured() ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          Add DATABASE_URL (Supabase Postgres) to enable saved businesses and history.
        </div>
      ) : businesses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">No tracked businesses yet.</p>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
            Run your first audit →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}
