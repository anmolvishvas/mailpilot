import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { organizationService } from "@/services/organization.service";
import { updateRoleSchema } from "@/lib/validations";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, memberId } = await params;
    const json = await req.json();
    const validated = updateRoleSchema.parse(json);

    const updated = await organizationService.updateMemberRole(id, user.id, memberId, validated);
    return NextResponse.json(updated);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json({ error: error.message || "Failed to update member role" }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, memberId } = await params;

    await organizationService.removeMember(id, user.id, memberId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json({ error: error.message || "Failed to remove member" }, { status });
  }
}
