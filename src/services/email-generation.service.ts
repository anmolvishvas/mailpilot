import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/ai-factory";
import { usageService } from "@/lib/usage/usage-service";
import { generateEmailSchema } from "@/lib/validations";
import type { EmailGenerationInput, EmailGenerationOutput, UserUsageStatus } from "@/types";

export interface EmailGenerationResponse {
  data: EmailGenerationOutput;
  usage: UserUsageStatus;
  generationId?: string;
}

export class EmailGenerationService {
  async generate(userId: string, input: z.infer<typeof generateEmailSchema>): Promise<EmailGenerationResponse> {
    const validated = generateEmailSchema.parse(input);

    // 1. Check daily limit before proceeding
    await usageService.checkGenerationLimit(userId);

    // 2. Resolve User's profile & custom instructions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { customInstructions: true, defaultTone: true, defaultLength: true },
    });

    let companyToneStr: string | undefined;
    let brandVoiceObj: { personality?: string; wordsToUse?: string; wordsToAvoid?: string } | undefined;

    // 3. Resolve Organization context if provided
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
        companyToneStr = compTone.description + (compTone.rules ? ` (${compTone.rules})` : "");
      }
      if (brVoice) {
        brandVoiceObj = {
          personality: brVoice.personality,
          wordsToUse: brVoice.wordsToUse,
          wordsToAvoid: brVoice.wordsToAvoid,
        };
      }
    }

    const hasImages = Boolean(validated.images && validated.images.length > 0);
    const aiInput: EmailGenerationInput = {
      prompt: validated.prompt || (hasImages ? "Draft email based on attached image" : ""),
      recipient: validated.recipient || "Colleague",
      tone: validated.tone || user?.defaultTone || "professional",
      length: (validated.length as any) || (user?.defaultLength as any) || "medium",
      customToneInstructions: validated.customToneInstructions,
      companyTone: companyToneStr,
      brandVoice: brandVoiceObj,
      additionalInstructions: validated.additionalInstructions || user?.customInstructions || undefined,
      images: validated.images,
    };

    // 4. Call AI Provider
    const aiProvider = getAIProvider();
    const result = await aiProvider.generateEmail(aiInput);

    if (!result || !result.body) {
      throw new Error("Failed to generate email content. Please try again.");
    }

    // 5. Atomically record usage only on success
    const updatedUsage = await usageService.recordSuccessfulGeneration({
      userId,
      type: "GENERATE",
      organizationId: validated.organizationId,
      tone: aiInput.tone,
    });

    // 6. Log generation to history
    const promptLog = validated.prompt || (hasImages ? "[Image/Screenshot Uploaded]" : "Email generation");
    const generationLog = await prisma.emailGeneration.create({
      data: {
        userId,
        type: "GENERATE",
        prompt: promptLog,
        recipient: validated.recipient,
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

export const emailGenerationService = new EmailGenerationService();
