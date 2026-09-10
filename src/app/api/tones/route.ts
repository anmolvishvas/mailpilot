import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { toneService } from "@/services/tone.service";
import { customToneSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireAuth();
    const tones = await toneService.getTones(user.id);
    return NextResponse.json(tones);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch tones" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json();
    const validated = customToneSchema.parse(json);

    const created = await toneService.createTone(user.id, validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to create custom tone" }, { status });
  }
}
