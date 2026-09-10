import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/ai-factory";
import { usageService } from "@/lib/usage/usage-service";
import { replyEmailSchema } from "@/lib/validations";
import type { ReplyInput, EmailGenerationOutput, UserUsageStatus } from "@/types";

export interface ReplyGenerationResponse {
  data: EmailGenerationOutput;
  usage: UserUsageStatus;
  generationId?: string;
}

export class ReplyService {
  async generateReply(userId: string, input: z.infer<typeof replyEmailSchema>): Promise<ReplyGenerationResponse> {
    const validated = replyEmailSchema.parse(input);

    // 1. Check daily limit
    await usageService.checkGenerationLimit(userId);

    // 2. Resolve organization tone if provided
    let companyToneStr: string | undefined;
    let brandVoiceObj: { personality?: string; wordsToUse?: string; wordsToAvoid?: string } | undefined;

    if (validated.organizationId) {
      const [compTone, brVoice] = await Promise.all([
        prisma.companyTone.findUnique({
          where: { organizationId: validated.organizationId },
        }),
        prisma.brandVoice.findUnique({
          where: { organizationId: validated.organizationId },
        }),
      ]);

      if (compTone?.isActive) {
        companyToneStr = compTone.description;
      }
      if (brVoice) {
        brandVoiceObj = {
          personality: brVoice.personality,
          wordsToUse: brVoice.wordsToUse,
          wordsToAvoid: brVoice.wordsToAvoid,
        };
      }
    }

    const aiInput: ReplyInput = {
      receivedEmail: validated.receivedEmail,
      userIntent: validated.userIntent,
      intentPreset: validated.intentPreset,
      tone: validated.tone || "professional",
      length: (validated.length as any) || "medium",
      companyTone: companyToneStr,
      brandVoice: brandVoiceObj,
    };

    // 3. Call AI
    const aiProvider = getAIProvider();
    const result = await aiProvider.generateReply(aiInput);

    if (!result || !result.body) {
      throw new Error("Failed to generate reply. Please try again.");
    }

    // 4. Record successful usage
    const updatedUsage = await usageService.recordSuccessfulGeneration({
      userId,
      type: "REPLY",
      organizationId: validated.organizationId,
      tone: aiInput.tone,
    });

    // 5. Save generation history
    const generationLog = await prisma.emailGeneration.create({
      data: {
        userId,
        type: "REPLY",
        prompt: validated.userIntent || validated.intentPreset || "Reply to email",
        sourceText: validated.receivedEmail,
        tone: aiInput.tone,
        length: aiInput.length,
        outputSubject: result.subject,
        outputBody: result.body,
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

export const replyService = new ReplyService();
