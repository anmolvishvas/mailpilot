import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { historyService } from "@/services/history.service";
import { saveEmailSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const view = searchParams.get("view") || "generations"; // "generations" or "saved"

    if (view === "saved") {
      const saved = await historyService.getSavedEmails({
        userId: user.id,
        category,
        search,
      });
      return NextResponse.json(saved);
    }

    const generations = await historyService.getHistory({
      userId: user.id,
      type,
      search,
    });
    return NextResponse.json(generations);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json();
    const validated = saveEmailSchema.parse(json);

    const saved = await historyService.saveEmail(user.id, validated);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to save email" }, { status });
  }
}
