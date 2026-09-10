import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { usageService } from "@/lib/usage/usage-service";

export async function GET() {
  try {
    const user = await requireAuth();
    const status = await usageService.getUsageStatus(user.id);
    return NextResponse.json(status);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch usage status" }, { status });
  }
}
