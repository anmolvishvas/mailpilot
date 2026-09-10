import { prisma } from "@/lib/db/prisma";
import { saveEmailSchema } from "@/lib/validations";
import { z } from "zod";

export class HistoryService {
  async getHistory(params: {
    userId: string;
    type?: string;
    search?: string;
    limit?: number;
  }) {
    const { userId, type, search, limit = 50 } = params;

    const where: any = { userId };

    if (type && type !== "ALL") {
      where.type = type.toUpperCase();
    }

    if (search) {
      where.OR = [
        { prompt: { contains: search } },
        { outputSubject: { contains: search } },
        { outputBody: { contains: search } },
      ];
    }

    return await prisma.emailGeneration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getSavedEmails(params: {
    userId: string;
    category?: string;
    search?: string;
  }) {
    const { userId, category, search } = params;

    const where: any = { userId };

    if (category && category !== "ALL") {
      where.category = category.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subject: { contains: search } },
        { body: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    return await prisma.savedEmail.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async saveEmail(userId: string, input: z.infer<typeof saveEmailSchema>) {
    const validated = saveEmailSchema.parse(input);

    return await prisma.savedEmail.create({
      data: {
        userId,
        title: validated.title,
        category: validated.category.toUpperCase(),
        subject: validated.subject || null,
        body: validated.body,
        originalPrompt: validated.originalPrompt || null,
        recipient: validated.recipient || null,
        tone: validated.tone || null,
        tags: validated.tags || null,
      },
    });
  }

  async deleteSavedEmail(userId: string, id: string) {
    const saved = await prisma.savedEmail.findUnique({
      where: { id },
    });

    if (!saved || saved.userId !== userId) {
      throw new Error("Saved email not found or unauthorized");
    }

    return await prisma.savedEmail.delete({
      where: { id },
    });
  }

  async deleteGenerationLog(userId: string, id: string) {
    const log = await prisma.emailGeneration.findUnique({
      where: { id },
    });

    if (!log || log.userId !== userId) {
      throw new Error("Log not found or unauthorized");
    }

    return await prisma.emailGeneration.delete({
      where: { id },
    });
  }
}

export const historyService = new HistoryService();
