import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { auditResults, audits, businesses, recommendations } from "@/lib/db/schema";
import { runAuditPipeline, toAuditReport } from "@/lib/audit/pipeline";
import {
  createFileAudit,
  getFileAudit,
  newAuditId,
  updateFileAudit,
} from "@/lib/storage/file-store";
import type { AuditContext, AuditInput, AuditReport } from "@/lib/types";

function reportFromAuditRow(
  audit: {
    id: string;
    businessName: string;
    city: string;
    state: string;
    category: string;
    email: string | null;
    status: AuditReport["status"];
    visibilityScore: number | null;
    errorMessage: string | null;
    createdAt: Date;
    userId?: string | null;
    businessId?: string | null;
    runNumber?: number;
  },
  pipeline?: Awaited<ReturnType<typeof runAuditPipeline>>,
): AuditReport {
  const input: AuditInput = {
    businessName: audit.businessName,
    city: audit.city,
    state: audit.state,
    category: audit.category,
    email: audit.email ?? undefined,
  };

  const report = toAuditReport(
    audit.id,
    input,
    audit.status,
    audit.createdAt.toISOString(),
    pipeline,
    audit.errorMessage ?? undefined,
  );

  return {
    ...report,
    userId: audit.userId,
    businessId: audit.businessId,
    runNumber: audit.runNumber,
  };
}

async function persistPipelineResults(
  auditId: string,
  pipeline: Awaited<ReturnType<typeof runAuditPipeline>>,
) {
  const db = getDb();
  if (!db) return;

  await db
    .update(audits)
    .set({
      status: "complete",
      visibilityScore: pipeline.visibilityScore,
    })
    .where(eq(audits.id, auditId));

  for (const result of pipeline.platformResults) {
    await db.insert(auditResults).values({
      auditId,
      platform: result.platform,
      query: result.query,
      rawResponse:
        result.rawResponse ||
        ("error" in result ? result.error : undefined) ||
        "Unavailable",
      businesses: result.businesses,
      userMentioned: result.userMentioned,
      userPosition: result.userPosition,
    });
  }

  for (const rec of pipeline.recommendations) {
    await db.insert(recommendations).values({
      auditId,
      priority: rec.priority,
      title: rec.title,
      description: rec.description,
      metricTarget: rec.metricTarget,
    });
  }
}

export async function createAndRunAudit(
  input: AuditInput,
  context: AuditContext = {},
): Promise<AuditReport> {
  const createdAt = new Date().toISOString();
  const db = getDb();

  if (!db) {
    const id = newAuditId();
    const pending = toAuditReport(id, input, "running", createdAt);
    await createFileAudit(pending);

    try {
      const pipeline = await runAuditPipeline(input);
      const complete = toAuditReport(id, input, "complete", createdAt, pipeline);
      return updateFileAudit(complete);
    } catch (error) {
      const failed = toAuditReport(
        id,
        input,
        "failed",
        createdAt,
        undefined,
        error instanceof Error ? error.message : "Audit failed",
      );
      return updateFileAudit(failed);
    }
  }

  const [audit] = await db
    .insert(audits)
    .values({
      userId: context.userId,
      businessId: context.businessId,
      runNumber: context.runNumber ?? 1,
      businessName: input.businessName,
      city: input.city,
      state: input.state,
      category: input.category,
      email: input.email,
      status: "running",
    })
    .returning();

  try {
    const pipeline = await runAuditPipeline(input);
    await persistPipelineResults(audit.id, pipeline);

    if (context.businessId) {
      await db
        .update(businesses)
        .set({ lastAuditedAt: new Date() })
        .where(eq(businesses.id, context.businessId));
    }

    return reportFromAuditRow(audit, pipeline);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audit failed";
    await db
      .update(audits)
      .set({ status: "failed", errorMessage: message })
      .where(eq(audits.id, audit.id));

    return reportFromAuditRow({ ...audit, status: "failed", errorMessage: message });
  }
}

export async function getAuditById(id: string): Promise<AuditReport | null> {
  const db = getDb();

  if (!db) {
    return getFileAudit(id);
  }

  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, id),
    with: {
      auditResults: true,
      recommendations: true,
    },
  });

  if (!audit) return null;

  if (audit.status !== "complete") {
    return reportFromAuditRow(audit);
  }

  const platformResults = audit.auditResults.map((result) => ({
    platform: result.platform,
    query: result.query,
    rawResponse: result.rawResponse,
    businesses: result.businesses,
    userMentioned: result.userMentioned,
    userPosition: result.userPosition,
    available: Boolean(result.rawResponse) && result.rawResponse !== "Unavailable",
  }));

  const competitorsMap = new Map<string, number>();
  for (const result of platformResults) {
    for (const business of result.businesses) {
      competitorsMap.set(business, (competitorsMap.get(business) ?? 0) + 1);
    }
  }

  const competitors = [...competitorsMap.entries()]
    .map(([name, mentions]) => ({ name, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5)
    .filter((entry) => entry.name.toLowerCase() !== audit.businessName.toLowerCase());

  const pipeline = {
    visibilityScore: audit.visibilityScore ?? 0,
    visibilityLabel:
      (audit.visibilityScore ?? 0) >= 75
        ? "Competitive"
        : (audit.visibilityScore ?? 0) >= 40
          ? "Emerging"
          : "Invisible",
    summary: `${audit.businessName} visibility score is ${audit.visibilityScore ?? 0}.`,
    platformResults,
    competitors,
    recommendations: audit.recommendations
      .sort((a, b) => a.priority - b.priority)
      .map((rec) => ({
        priority: rec.priority as 1 | 2 | 3,
        title: rec.title,
        description: rec.description,
        metricTarget: rec.metricTarget ?? undefined,
      })),
  };

  return reportFromAuditRow(audit, pipeline);
}

export function getStorageMode() {
  return isDatabaseConfigured() ? "postgres" : "file";
}
