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
    const org = await organizationService.getOrganizationDetails(id, user.id);
    return NextResponse.json(org);
  } catch (error: any) {
    const status = error.message?.includes("Access denied")
      ? 403
      : error.message?.includes("Unauthorized")
      ? 401
      : 404;
    return NextResponse.json({ error: error.message || "Failed to fetch organization" }, { status });
  }
}
