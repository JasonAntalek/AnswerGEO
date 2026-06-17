import { NextResponse } from "next/server";
import { getAuditById } from "@/lib/audit/service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const report = await getAuditById(id);

  if (!report) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}
