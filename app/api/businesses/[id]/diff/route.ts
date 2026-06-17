import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getBusinessDiff } from "@/lib/business/service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const diff = await getBusinessDiff(id, user.id);
    return NextResponse.json({ diff });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
