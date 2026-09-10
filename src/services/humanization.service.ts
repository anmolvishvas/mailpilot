import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/ai-factory";
import { usageService } from "@/lib/usage/usage-service";
import { humanizeEmailSchema } from "@/lib/validations";
import type { HumanizeInput, HumanizeOutput, UserUsageStatus } from "@/types";

export interface HumanizeEmailResponse {
  data: HumanizeOutput;
  usage: UserUsageStatus;
  generationId?: string;
}

export class HumanizationService {
  async humanize(userId: string, input: z.infer<typeof humanizeEmailSchema>): Promise<HumanizeEmailResponse> {
    const validated = humanizeEmailSchema.parse(input);

    await usageService.checkGenerationLimit(userId);

    const aiInput: HumanizeInput = {
      email: validated.email,
      level: validated.level,
    };

    const aiProvider = getAIProvider();
    const result = await aiProvider.humanizeEmail(aiInput);

    if (!result || !result.humanizedText) {
      throw new Error("Failed to humanize email. Please try again.");
    }

    const updatedUsage = await usageService.recordSuccessfulGeneration({
      userId,
      type: "HUMANIZE",
    });

    const generationLog = await prisma.emailGeneration.create({
      data: {
        userId,
        type: "HUMANIZE",
        prompt: `Humanize email (${validated.level})`,
        sourceText: validated.email,
        outputSubject: "Humanized Email",
        outputBody: result.humanizedText,
        metadata: JSON.stringify({
          adjustmentsSummary: result.adjustmentsSummary,
        }),
        isSuccessful: true,
      },
    });

    return {
      data: result,
      usage: updatedUsage,
      generationId: generationLog.id,
    };
  }
}

export const humanizationService = new HumanizationService();
