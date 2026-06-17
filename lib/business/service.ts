import { and, desc, eq, sql } from "drizzle-orm";
import { buildAuditDiff } from "@/lib/audit/diff";
import { createAndRunAudit, getAuditById } from "@/lib/audit/service";
import { getDb } from "@/lib/db";
import { audits, businesses } from "@/lib/db/schema";
import type { AuditInput, AuditDiff, TrackedBusiness, AuditHistoryItem } from "@/lib/types";

function businessKey(input: AuditInput) {
  return `${input.businessName}|${input.city}|${input.state}|${input.category}`.toLowerCase();
}

export async function findOrCreateBusiness(userId: string, input: AuditInput) {
  const db = getDb();
  if (!db) throw new Error("Database is required for tracked businesses");

  const existing = await db.query.businesses.findMany({
    where: eq(businesses.userId, userId),
  });

  const match = existing.find(
    (row) =>
      businessKey({
        businessName: row.businessName,
        city: row.city,
        state: row.state,
        category: row.category,
      }) === businessKey(input),
  );

  if (match) return match;

  const [created] = await db
    .insert(businesses)
    .values({
      userId,
      businessName: input.businessName,
      city: input.city,
      state: input.state,
      category: input.category,
    })
    .returning();

  return created;
}

export async function listBusinesses(userId: string): Promise<TrackedBusiness[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db.query.businesses.findMany({
    where: eq(businesses.userId, userId),
    orderBy: [desc(businesses.lastAuditedAt)],
    with: {
      audits: {
        where: eq(audits.status, "complete"),
        orderBy: [desc(audits.createdAt)],
        limit: 1,
      },
    },
  });

  const counts = await db
    .select({
      businessId: audits.businessId,
      count: sql<number>`count(*)::int`,
    })
    .from(audits)
    .where(and(eq(audits.userId, userId), eq(audits.status, "complete")))
    .groupBy(audits.businessId);

  const countMap = new Map(counts.map((row) => [row.businessId, row.count]));

  return rows.map((row) => ({
    id: row.id,
    businessName: row.businessName,
    city: row.city,
    state: row.state,
    category: row.category,
    lastAuditedAt: row.lastAuditedAt?.toISOString() ?? null,
    latestScore: row.audits[0]?.visibilityScore ?? null,
    auditCount: countMap.get(row.id) ?? 0,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getBusinessForUser(businessId: string, userId: string) {
  const db = getDb();
  if (!db) return null;

  return db.query.businesses.findFirst({
    where: and(eq(businesses.id, businessId), eq(businesses.userId, userId)),
  });
}

export async function getBusinessHistory(
  businessId: string,
  userId: string,
): Promise<AuditHistoryItem[]> {
  const db = getDb();
  if (!db) return [];

  const owned = await getBusinessForUser(businessId, userId);
  if (!owned) return [];

  const rows = await db.query.audits.findMany({
    where: and(eq(audits.businessId, businessId), eq(audits.userId, userId)),
    orderBy: [desc(audits.createdAt)],
  });

  return rows.map((row) => ({
    id: row.id,
    runNumber: row.runNumber,
    visibilityScore: row.visibilityScore,
    createdAt: row.createdAt.toISOString(),
    status: row.status,
  }));
}

export async function getNextRunNumber(businessId: string) {
  const db = getDb();
  if (!db) return 1;

  const rows = await db.query.audits.findMany({
    where: eq(audits.businessId, businessId),
    orderBy: [desc(audits.runNumber)],
    limit: 1,
  });

  return (rows[0]?.runNumber ?? 0) + 1;
}

export async function runBusinessAudit(businessId: string, userId: string) {
  const business = await getBusinessForUser(businessId, userId);
  if (!business) throw new Error("Business not found");

  const runNumber = await getNextRunNumber(businessId);
  const input: AuditInput = {
    businessName: business.businessName,
    city: business.city,
    state: business.state,
    category: business.category,
  };

  const report = await createAndRunAudit(input, {
    userId,
    businessId,
    runNumber,
  });

  const db = getDb();
  if (db) {
    await db
      .update(businesses)
      .set({ lastAuditedAt: new Date() })
      .where(eq(businesses.id, businessId));
  }

  return report;
}

export async function getBusinessDiff(
  businessId: string,
  userId: string,
): Promise<AuditDiff | null> {
  const history = await getBusinessHistory(businessId, userId);
  const complete = history.filter((item) => item.status === "complete");

  if (complete.length === 0) return null;

  const current = await getAuditById(complete[0].id);
  if (!current) return null;

  const previous = complete[1] ? await getAuditById(complete[1].id) : null;
  return buildAuditDiff(previous, current);
}
