import Link from "next/link";
import { notFound } from "next/navigation";
import { CompetitorList } from "@/components/CompetitorList";
import { DiffBanner } from "@/components/DiffBanner";
import { FixChecklist } from "@/components/FixChecklist";
import { PlatformCards } from "@/components/PlatformCards";
import { SaveBusinessPrompt } from "@/components/SaveBusinessPrompt";
import { ScoreGauge } from "@/components/ScoreGauge";
import { getAuditById } from "@/lib/audit/service";
import { getCurrentUser } from "@/lib/auth/session";
import { getBusinessDiff } from "@/lib/business/service";

export default async function AuditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getAuditById(id);
  const user = await getCurrentUser();

  if (!report) {
    notFound();
  }

  const diff =
    user && report.businessId
      ? await getBusinessDiff(report.businessId, user.id)
      : null;

  if (report.status === "failed") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">Audit failed</h1>
        <p className="mt-3 text-slate-600">{report.errorMessage}</p>
        <Link href="/" className="mt-6 inline-block text-indigo-600 hover:underline">
          Run another audit
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              AI Visibility Report
              {report.runNumber ? ` · Run #${report.runNumber}` : ""}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{report.businessName}</h1>
            <p className="text-slate-600">
              {report.category} in {report.city}, {report.state}
            </p>
          </div>
          <div className="flex gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
            ) : null}
            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              New audit
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {!user ? <SaveBusinessPrompt /> : null}

          {diff && report.businessId ? (
            <DiffBanner diff={diff} businessId={report.businessId} />
          ) : null}

          <ScoreGauge score={report.visibilityScore ?? 0} label={report.visibilityLabel} />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <p className="mt-2 text-slate-600">{report.summary}</p>
          </div>

          <PlatformCards results={report.platformResults} />
          <CompetitorList competitors={report.competitors} />
          <FixChecklist recommendations={report.recommendations} />
        </div>
      </main>
    </div>
  );
}
