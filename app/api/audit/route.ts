import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAndRunAudit } from "@/lib/audit/service";
import { ensureProfile, getCurrentUser } from "@/lib/auth/session";
import { findOrCreateBusiness, getNextRunNumber } from "@/lib/business/service";
import { isDatabaseConfigured } from "@/lib/db";
import { isRateLimited } from "@/lib/storage/rate-limit";

const auditSchema = z.object({
  businessName: z.string().min(2).max(120),
  city: z.string().min(2).max(80),
  state: z.string().length(2),
  category: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  saveToAccount: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = auditSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const input = {
      businessName: parsed.data.businessName.trim(),
      city: parsed.data.city.trim(),
      state: parsed.data.state.toUpperCase(),
      category: parsed.data.category.trim(),
      email: parsed.data.email || undefined,
    };

    const user = await getCurrentUser();
    let context = {};

    if (user && isDatabaseConfigured() && parsed.data.saveToAccount !== false) {
      await ensureProfile(user.id, user.email ?? "");
      const business = await findOrCreateBusiness(user.id, input);
      const runNumber = await getNextRunNumber(business.id);
      context = { userId: user.id, businessId: business.id, runNumber };
    }

    const report = await createAndRunAudit(input, context);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to run audit",
      },
      { status: 500 },
    );
  }
}
