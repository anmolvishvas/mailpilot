import { prisma } from "@/lib/db/prisma";
import { emailGenerationService } from "./email-generation.service";

export class TemplateService {
  async getTemplates(category?: string, userId?: string) {
    const where: any = {
      OR: [
        { isBuiltIn: true },
        ...(userId ? [{ userId }] : []),
      ],
    };

    if (category && category !== "ALL") {
      where.category = category.toUpperCase();
    }

    return await prisma.template.findMany({
      where,
      orderBy: [{ isBuiltIn: "desc" }, { createdAt: "desc" }],
    });
  }

  async getTemplateById(id: string) {
    return await prisma.template.findUnique({
      where: { id },
    });
  }

  renderPrompt(promptTemplate: string, fieldValues: Record<string, string>): string {
    let rendered = promptTemplate;
    for (const [key, value] of Object.entries(fieldValues)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      rendered = rendered.replace(regex, value || "");
    }
    // Clean up any unfilled leftover tags
    rendered = rendered.replace(/{{\s*[^}]+\s*}}/g, "").trim();
    return rendered;
  }

  async generateFromTemplate(params: {
    userId: string;
    templateId: string;
    fieldValues: Record<string, string>;
    recipient?: string;
    tone?: string;
    length?: "short" | "medium" | "detailed" | "long";
    organizationId?: string;
  }) {
    const template = await this.getTemplateById(params.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const compiledPrompt = this.renderPrompt(template.promptTemplate, params.fieldValues);

    return await emailGenerationService.generate(params.userId, {
      prompt: compiledPrompt,
      recipient: params.recipient || template.defaultRecipient || "Colleague",
      tone: params.tone || template.defaultTone || "professional",
      length: params.length || "medium",
      organizationId: params.organizationId,
    });
  }

  async createCustomTemplate(userId: string, data: {
    title: string;
    description: string;
    category: string;
    fields: string;
    promptTemplate: string;
    defaultRecipient?: string;
    defaultTone?: string;
  }) {
    return await prisma.template.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        category: data.category.toUpperCase(),
        fields: data.fields,
        promptTemplate: data.promptTemplate,
        defaultRecipient: data.defaultRecipient,
        defaultTone: data.defaultTone || "professional",
        isBuiltIn: false,
      },
    });
  }

  async deleteCustomTemplate(userId: string, templateId: string) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template || template.userId !== userId) {
      throw new Error("Template not found or unauthorized");
    }

    return await prisma.template.delete({
      where: { id: templateId },
    });
  }
}

export const templateService = new TemplateService();
