import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureProfile, requireUser } from "@/lib/auth/session";
import { findOrCreateBusiness, listBusinesses } from "@/lib/business/service";
import { isDatabaseConfigured } from "@/lib/db";

const businessSchema = z.object({
  businessName: z.string().min(2).max(120),
  city: z.string().min(2).max(80),
  state: z.string().length(2),
  category: z.string().min(2).max(80),
});

export async function GET() {
  try {
    const user = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ businesses: [] });
    }

    const businesses = await listBusinesses(user.id);
    return NextResponse.json({ businesses });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database is required" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = businessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await ensureProfile(user.id, user.email ?? "");
    const business = await findOrCreateBusiness(user.id, {
      businessName: parsed.data.businessName.trim(),
      city: parsed.data.city.trim(),
      state: parsed.data.state.toUpperCase(),
      category: parsed.data.category.trim(),
    });

    return NextResponse.json({ business });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
