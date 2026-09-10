import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/ai-factory";
import { usageService } from "@/lib/usage/usage-service";
import { translateEmailSchema } from "@/lib/validations";
import type { TranslationInput, TranslationOutput, UserUsageStatus } from "@/types";

export interface TranslationResponse {
  data: TranslationOutput;
  usage: UserUsageStatus;
  generationId?: string;
}

export class TranslationService {
  async translate(userId: string, input: z.infer<typeof translateEmailSchema>): Promise<TranslationResponse> {
    const validated = translateEmailSchema.parse(input);

    await usageService.checkGenerationLimit(userId);

    const aiInput: TranslationInput = {
      email: validated.email,
      targetLanguage: validated.targetLanguage,
      sourceLanguage: validated.sourceLanguage,
      preserveTone: validated.preserveTone,
    };

    const aiProvider = getAIProvider();
    const result = await aiProvider.translateEmail(aiInput);

    if (!result || !result.translatedText) {
      throw new Error("Failed to translate email. Please try again.");
    }

    const updatedUsage = await usageService.recordSuccessfulGeneration({
      userId,
      type: "TRANSLATE",
    });

    const generationLog = await prisma.emailGeneration.create({
      data: {
        userId,
        type: "TRANSLATE",
        prompt: `Translate to ${validated.targetLanguage}`,
        sourceText: validated.email,
        language: validated.targetLanguage,
        outputSubject: `Translation (${validated.targetLanguage})`,
        outputBody: result.translatedText,
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

export const translationService = new TranslationService();
