import { NextResponse } from "next/server";
import { getAuthSession, requireAuth } from "@/lib/auth/auth-options";
import { templateService } from "@/services/template.service";
import { createTemplateSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const session = await getAuthSession();
    const userId = session?.user?.id;

    const templates = await templateService.getTemplates(category, userId);
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json();
    const validated = createTemplateSchema.parse(json);

    const created = await templateService.createCustomTemplate(user.id, validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to create template" }, { status });
  }
}
