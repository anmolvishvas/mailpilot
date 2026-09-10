import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  defaultTone: z.string().optional(),
  defaultLength: z.string().optional(),
  defaultLanguage: z.string().optional(),
  customInstructions: z.string().max(1000).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        defaultTone: true,
        defaultLength: true,
        defaultLanguage: true,
        customInstructions: true,
        createdAt: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json();
    const validated = updateProfileSchema.parse(json);

    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.defaultTone !== undefined) updateData.defaultTone = validated.defaultTone;
    if (validated.defaultLength !== undefined) updateData.defaultLength = validated.defaultLength;
    if (validated.defaultLanguage !== undefined) updateData.defaultLanguage = validated.defaultLanguage;
    if (validated.customInstructions !== undefined) updateData.customInstructions = validated.customInstructions;

    if (validated.newPassword) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser?.password && validated.currentPassword) {
        const matches = await bcrypt.compare(validated.currentPassword, dbUser.password);
        if (!matches) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }
      updateData.password = await bcrypt.hash(validated.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        defaultTone: true,
        defaultLength: true,
        defaultLanguage: true,
        customInstructions: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status });
  }
}
