import { prisma } from "@/lib/db/prisma";
import { getTodayDateString } from "@/lib/utils";
import type { UserUsageStatus } from "@/types";

export const DAILY_GENERATION_LIMIT = 10;

export class UsageService {
  private dailyLimit: number;

  constructor(limit = DAILY_GENERATION_LIMIT) {
    this.dailyLimit = limit;
  }

  /**
   * Get user's current daily usage status
   */
  async getUsageStatus(userId: string): Promise<UserUsageStatus> {
    const today = getTodayDateString();

    const usage = await prisma.usage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const usedToday = usage ? usage.count : 0;
    const remainingToday = Math.max(0, this.dailyLimit - usedToday);
    const canGenerate = remainingToday > 0;

    // Calculate next midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      dailyLimit: this.dailyLimit,
      usedToday,
      remainingToday,
      canGenerate,
      resetsAt: tomorrow.toISOString(),
    };
  }

  /**
   * Check if user has quota remaining before running AI generation
   * Throws an error with friendly message if quota is exceeded
   */
  async checkGenerationLimit(userId: string): Promise<UserUsageStatus> {
    const status = await this.getUsageStatus(userId);
    if (!status.canGenerate) {
      throw new Error(
        "You've used all 10 AI generations for today. Your limit will reset tomorrow."
      );
    }
    return status;
  }

  /**
   * Record a successful AI generation atomically
   * Only called AFTER the AI provider successfully returns the output
   */
  async recordSuccessfulGeneration(params: {
    userId: string;
    type: string;
    organizationId?: string;
    templateId?: string;
    tone?: string;
  }): Promise<UserUsageStatus> {
    const today = getTodayDateString();

    // Upsert usage record atomically incrementing by 1
    const updatedUsage = await prisma.usage.upsert({
      where: {
        userId_date: {
          userId: params.userId,
          date: today,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        userId: params.userId,
        date: today,
        count: 1,
      },
    });

    // Record usage event for analytics
    await prisma.usageEvent.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId || null,
        type: params.type,
        templateId: params.templateId || null,
        tone: params.tone || null,
        isSuccessful: true,
      },
    });

    const remainingToday = Math.max(0, this.dailyLimit - updatedUsage.count);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      dailyLimit: this.dailyLimit,
      usedToday: updatedUsage.count,
      remainingToday,
      canGenerate: remainingToday > 0,
      resetsAt: tomorrow.toISOString(),
    };
  }
}

export const usageService = new UsageService();
