import { prisma } from "@/lib/db/prisma";
import { customToneSchema } from "@/lib/validations";
import { z } from "zod";

export class ToneService {
  async getTones(userId: string) {
    return await prisma.customTone.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async getToneById(userId: string, id: string) {
    const tone = await prisma.customTone.findUnique({
      where: { id },
    });

    if (!tone || tone.userId !== userId) {
      throw new Error("Custom tone not found");
    }

    return tone;
  }

  async createTone(userId: string, input: z.infer<typeof customToneSchema>) {
    const validated = customToneSchema.parse(input);

    if (validated.isDefault) {
      // Unset any existing default
      await prisma.customTone.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return await prisma.customTone.create({
      data: {
        userId,
        name: validated.name,
        description: validated.description,
        instructions: validated.instructions,
        isDefault: validated.isDefault || false,
      },
    });
  }

  async updateTone(userId: string, id: string, input: z.infer<typeof customToneSchema>) {
    const validated = customToneSchema.parse(input);
    await this.getToneById(userId, id);

    if (validated.isDefault) {
      await prisma.customTone.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return await prisma.customTone.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description,
        instructions: validated.instructions,
        isDefault: validated.isDefault,
      },
    });
  }

  async deleteTone(userId: string, id: string) {
    await this.getToneById(userId, id);
    return await prisma.customTone.delete({
      where: { id },
    });
  }

  async setDefaultTone(userId: string, id: string) {
    await this.getToneById(userId, id);

    await prisma.customTone.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return await prisma.customTone.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}

export const toneService = new ToneService();
