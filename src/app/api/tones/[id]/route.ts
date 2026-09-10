import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { toneService } from "@/services/tone.service";
import { customToneSchema } from "@/lib/validations";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const tone = await toneService.getToneById(user.id, id);
    return NextResponse.json(tone);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 404;
    return NextResponse.json({ error: error.message || "Tone not found" }, { status });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const json = await req.json();

    if (json.action === "setDefault") {
      const updated = await toneService.setDefaultTone(user.id, id);
      return NextResponse.json(updated);
    }

    const validated = customToneSchema.parse(json);
    const updated = await toneService.updateTone(user.id, id, validated);
    return NextResponse.json(updated);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to update tone" }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await toneService.deleteTone(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to delete tone" }, { status });
  }
}
