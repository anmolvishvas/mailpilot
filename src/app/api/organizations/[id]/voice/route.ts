import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { organizationService } from "@/services/organization.service";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const json = await req.json();

    if (json.type === "brandVoice") {
      const updated = await organizationService.updateBrandVoice(id, user.id, json.data);
      return NextResponse.json(updated);
    } else if (json.type === "companyTone") {
      const updated = await organizationService.updateCompanyTone(id, user.id, json.data);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid type. Must be 'brandVoice' or 'companyTone'" }, { status: 400 });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json({ error: error.message || "Failed to update voice/tone settings" }, { status });
  }
}
