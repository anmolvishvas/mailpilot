import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { emailGenerationService } from "@/services/email-generation.service";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json();

    const result = await emailGenerationService.generate(user.id, json);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Email generation API error:", error);
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json(
      { error: error.message || "Failed to generate email" },
      { status }
    );
  }
}
