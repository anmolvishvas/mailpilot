import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { organizationService } from "@/services/organization.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const analytics = await organizationService.getAnalytics(id, user.id);
    return NextResponse.json(analytics);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch organization analytics" }, { status });
  }
}
