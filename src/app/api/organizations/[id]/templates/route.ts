import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { organizationService } from "@/services/organization.service";
import { createTemplateSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const json = await req.json();
    const validated = createTemplateSchema.parse(json);

    const created = await organizationService.createSharedTemplate(id, user.id, validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json({ error: error.message || "Failed to create shared template" }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    await organizationService.deleteSharedTemplate(id, user.id, templateId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json({ error: error.message || "Failed to delete shared template" }, { status });
  }
}
