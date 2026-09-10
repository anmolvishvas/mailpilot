import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { organizationService } from "@/services/organization.service";
import { inviteMemberSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const json = await req.json();
    const validated = inviteMemberSchema.parse(json);

    const member = await organizationService.inviteMember(id, user.id, validated);
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json({ error: error.message || "Failed to invite member" }, { status });
  }
}
