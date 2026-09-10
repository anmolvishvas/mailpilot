import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { templateService } from "@/services/template.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await templateService.getTemplateById(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch template" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await templateService.deleteCustomTemplate(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to delete template" }, { status });
  }
}
