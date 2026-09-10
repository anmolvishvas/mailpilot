import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/ai-factory";
import { usageService } from "@/lib/usage/usage-service";
import { analyzeEmailSchema } from "@/lib/validations";
import type { EmailAnalysisOutput, UserUsageStatus } from "@/types";

export interface AnalyzeEmailResponse {
  data: EmailAnalysisOutput;
  usage: UserUsageStatus;
  generationId?: string;
}

export class AnalysisService {
  async analyze(userId: string, input: z.infer<typeof analyzeEmailSchema>): Promise<AnalyzeEmailResponse> {
    const validated = analyzeEmailSchema.parse(input);

    await usageService.checkGenerationLimit(userId);

    const hasImages = Boolean(validated.images && validated.images.length > 0);
    const aiProvider = getAIProvider();
    const result = await aiProvider.analyzeEmail(validated.email || "", validated.images);

    if (!result || !result.summary) {
      throw new Error("Failed to analyze email. Please try again.");
    }

    const updatedUsage = await usageService.recordSuccessfulGeneration({
      userId,
      type: "ANALYZE",
      tone: result.tone,
    });

    const sourceLog = validated.email || (hasImages ? "[Screenshot / Image of Email]" : "Email Analysis");
    const generationLog = await prisma.emailGeneration.create({
      data: {
        userId,
        type: "ANALYZE",
        prompt: "Analyze email / screenshot content",
        sourceText: sourceLog,
        tone: result.tone,
        outputSubject: `Analysis: ${result.intent.slice(0, 40)}`,
        outputBody: result.summary,
        metadata: JSON.stringify(result),
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

export const analysisService = new AnalysisService();
