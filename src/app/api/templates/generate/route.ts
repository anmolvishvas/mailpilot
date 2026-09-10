import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { templateService } from "@/services/template.service";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json();

    const { templateId, fieldValues, recipient, tone, length, organizationId } = json;

    if (!templateId || !fieldValues) {
      return NextResponse.json({ error: "templateId and fieldValues are required" }, { status: 400 });
    }

    const result = await templateService.generateFromTemplate({
      userId: user.id,
      templateId,
      fieldValues,
      recipient,
      tone,
      length,
      organizationId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Template generation error:", error);
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to generate from template" }, { status });
  }
}
