import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { organizationService } from "@/services/organization.service";
import { createOrganizationSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireAuth();
    const orgs = await organizationService.getUserOrganizations(user.id);
    return NextResponse.json(orgs);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch organizations" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json();
    const validated = createOrganizationSchema.parse(json);

    const created = await organizationService.createOrganization(user.id, validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to create organization" }, { status });
  }
}
