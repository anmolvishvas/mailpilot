import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { analysisService } from "@/services/analysis.service";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json();

    const result = await analysisService.analyze(user.id, json);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Analyze email API error:", error);
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json(
      { error: error.message || "Failed to analyze email" },
      { status }
    );
  }
}
