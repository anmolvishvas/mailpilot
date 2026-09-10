import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/ai-factory";
import { usageService } from "@/lib/usage/usage-service";
import { improveEmailSchema } from "@/lib/validations";
import type { EmailImprovementInput, EmailImprovementOutput, UserUsageStatus } from "@/types";

export interface ImproveEmailResponse {
  data: EmailImprovementOutput;
  usage: UserUsageStatus;
  generationId?: string;
}

export class ImprovementService {
  async improve(userId: string, input: z.infer<typeof improveEmailSchema>): Promise<ImproveEmailResponse> {
    const validated = improveEmailSchema.parse(input);

    await usageService.checkGenerationLimit(userId);

    const aiInput: EmailImprovementInput = {
      emailToImprove: validated.emailToImprove,
      desiredTone: validated.desiredTone,
      customInstructions: validated.customInstructions,
      images: validated.images,
    };

    const aiProvider = getAIProvider();
    const result = await aiProvider.improveEmail(aiInput);

    if (!result || !result.improved) {
      throw new Error("Failed to improve email. Please try again.");
    }

    const updatedUsage = await usageService.recordSuccessfulGeneration({
      userId,
      type: "IMPROVE",
      tone: validated.desiredTone,
    });

    const generationLog = await prisma.emailGeneration.create({
      data: {
        userId,
        type: "IMPROVE",
        prompt: `Improve email (${validated.desiredTone})`,
        sourceText: validated.emailToImprove || (validated.images && validated.images.length > 0 ? `[Image attached: ${validated.images.length} image(s)]` : ""),
        tone: validated.desiredTone,
        outputSubject: result.subject || "Improved Email",
        outputBody: result.improved,
        metadata: JSON.stringify({
          changesSummary: result.changesSummary,
          readabilityScore: result.readabilityScore,
          hasImages: Boolean(validated.images && validated.images.length > 0),
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

export const improvementService = new ImprovementService();
