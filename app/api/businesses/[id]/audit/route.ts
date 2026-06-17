import { NextResponse } from "next/server";
import { ensureProfile, requireUser } from "@/lib/auth/session";
import { runBusinessAudit } from "@/lib/business/service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    await ensureProfile(user.id, user.email ?? "");
    const { id } = await context.params;
    const report = await runBusinessAudit(id, user.id);
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status =
      message === "Unauthorized" ? 401 : message === "Business not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
