import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { historyService } from "@/services/history.service";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isSaved = searchParams.get("isSaved") === "true";

    if (isSaved) {
      await historyService.deleteSavedEmail(user.id, id);
    } else {
      await historyService.deleteGenerationLog(user.id, id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to delete history item" }, { status });
  }
}
