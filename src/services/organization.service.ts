import { prisma } from "@/lib/db/prisma";
import {
  verifyOrgAccess,
  canManageMembers,
  canManageRoles,
  canManageSharedTemplates,
  canManageVoiceAndTone,
  canViewAnalytics,
  canDeleteOrganization,
} from "@/lib/permissions/rbac";
import {
  createOrganizationSchema,
  inviteMemberSchema,
  updateRoleSchema,
  updateBrandVoiceSchema,
  updateCompanyToneSchema,
} from "@/lib/validations";
import { z } from "zod";
import type { OrgRole } from "@/types";

export class OrganizationService {
  async getUserOrganizations(userId: string) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                sharedTemplates: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return memberships.map((m) => ({
      ...m.organization,
      userRole: m.role as OrgRole,
      joinedAt: m.joinedAt,
    }));
  }

  async getOrganizationDetails(organizationId: string, userId: string) {
    const { role } = await verifyOrgAccess(organizationId, userId);

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        settings: true,
        companyTone: true,
        brandVoice: true,
        sharedTemplates: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    return {
      ...org,
      currentUserRole: role,
    };
  }

  async createOrganization(userId: string, input: z.infer<typeof createOrganizationSchema>) {
    const validated = createOrganizationSchema.parse(input);

    const existingSlug = await prisma.organization.findUnique({
      where: { slug: validated.slug },
    });

    if (existingSlug) {
      throw new Error("Organization slug is already taken. Please choose another.");
    }

    return await prisma.organization.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
        settings: {
          create: {
            allowMemberTemplates: true,
            enforceBrandVoice: false,
          },
        },
        companyTone: {
          create: {
            description: "Clear, friendly, and professional.",
            isActive: true,
          },
        },
        brandVoice: {
          create: {
            personality: "Friendly, Confident, Professional",
            wordsToUse: "Customer, Partner, Team",
            wordsToAvoid: "Unfortunately, Esteemed, Kindly",
          },
        },
      },
    });
  }

  async inviteMember(organizationId: string, currentUserId: string, input: z.infer<typeof inviteMemberSchema>) {
    const { role } = await verifyOrgAccess(organizationId, currentUserId);
    if (!canManageMembers(role)) {
      throw new Error("Unauthorized: Only Owners and Admins can invite members.");
    }

    const validated = inviteMemberSchema.parse(input);

    let targetUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (!targetUser) {
      // Auto-create a stub user so they can join when registering
      targetUser = await prisma.user.create({
        data: {
          email: validated.email.toLowerCase().trim(),
          name: validated.email.split("@")[0],
        },
      });
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      throw new Error("This user is already a member of the organization.");
    }

    return await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: targetUser.id,
        role: validated.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async updateMemberRole(organizationId: string, currentUserId: string, memberId: string, input: z.infer<typeof updateRoleSchema>) {
    const { role } = await verifyOrgAccess(organizationId, currentUserId);
    if (!canManageRoles(role)) {
      throw new Error("Unauthorized: Only the Organization Owner can modify member roles.");
    }

    const validated = updateRoleSchema.parse(input);

    return await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: validated.role },
    });
  }

  async removeMember(organizationId: string, currentUserId: string, memberId: string) {
    const { role } = await verifyOrgAccess(organizationId, currentUserId);
    if (!canManageMembers(role)) {
      throw new Error("Unauthorized: Only Owners and Admins can remove members.");
    }

    const targetMember = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember) {
      throw new Error("Member not found.");
    }

    if (targetMember.role === "OWNER") {
      throw new Error("Cannot remove the organization owner.");
    }

    return await prisma.organizationMember.delete({
      where: { id: memberId },
    });
  }

  async updateCompanyTone(organizationId: string, currentUserId: string, input: z.infer<typeof updateCompanyToneSchema>) {
    const { role } = await verifyOrgAccess(organizationId, currentUserId);
    if (!canManageVoiceAndTone(role)) {
      throw new Error("Unauthorized: Only Owners and Admins can update company tone.");
    }

    const validated = updateCompanyToneSchema.parse(input);

    return await prisma.companyTone.upsert({
      where: { organizationId },
      update: {
        description: validated.description,
        rules: validated.rules,
        isActive: validated.isActive,
      },
      create: {
        organizationId,
        description: validated.description,
        rules: validated.rules,
        isActive: validated.isActive ?? true,
      },
    });
  }

  async updateBrandVoice(organizationId: string, currentUserId: string, input: z.infer<typeof updateBrandVoiceSchema>) {
    const { role } = await verifyOrgAccess(organizationId, currentUserId);
    if (!canManageVoiceAndTone(role)) {
      throw new Error("Unauthorized: Only Owners and Admins can update brand voice.");
    }

    const validated = updateBrandVoiceSchema.parse(input);

    return await prisma.brandVoice.upsert({
      where: { organizationId },
      update: {
        personality: validated.personality,
        wordsToUse: validated.wordsToUse,
        wordsToAvoid: validated.wordsToAvoid,
      },
      create: {
        organizationId,
        personality: validated.personality,
        wordsToUse: validated.wordsToUse,
        wordsToAvoid: validated.wordsToAvoid,
      },
    });
  }

  async createSharedTemplate(organizationId: string, currentUserId: string, data: {
    title: string;
    description: string;
    category?: string;
    fields: string;
    promptTemplate: string;
    defaultRecipient?: string;
    defaultTone?: string;
  }) {
    const { role } = await verifyOrgAccess(organizationId, currentUserId);
    if (!canManageSharedTemplates(role)) {
      throw new Error("Unauthorized: Only Owners and Admins can create shared templates.");
    }

    return await prisma.sharedTemplate.create({
      data: {
        organizationId,
        createdById: currentUserId,
        title: data.title,
        description: data.description,
        category: (data.category || "WORK").toUpperCase(),
        fields: data.fields,
        promptTemplate: data.promptTemplate,
        defaultRecipient: data.defaultRecipient,
        defaultTone: data.defaultTone || "professional",
      },
    });
  }

  async deleteSharedTemplate(organizationId: string, currentUserId: string, templateId: string) {
    const { role } = await verifyOrgAccess(organizationId, currentUserId);
    if (!canManageSharedTemplates(role)) {
      throw new Error("Unauthorized: Only Owners and Admins can delete shared templates.");
    }

    return await prisma.sharedTemplate.delete({
      where: { id: templateId },
    });
  }

  /**
   * Organization Analytics:
   * Aggregates usage statistics without exposing private email bodies or prompts (Rule 36: Privacy)
   */
  async getAnalytics(organizationId: string, currentUserId: string) {
    const { role } = await verifyOrgAccess(organizationId, currentUserId);
    if (!canViewAnalytics(role)) {
      throw new Error("Unauthorized: Only Owners and Admins can view analytics.");
    }

    // Get all members of the organization
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const memberUserIds = members.map((m) => m.userId);

    // Get usage events for this organization
    const usageEvents = await prisma.usageEvent.findMany({
      where: {
        OR: [
          { organizationId },
          { userId: { in: memberUserIds } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const totalGenerations = usageEvents.length;

    // Feature breakdown
    const featureBreakdown: Record<string, number> = {
      GENERATE: 0,
      REPLY: 0,
      IMPROVE: 0,
      ANALYZE: 0,
      HUMANIZE: 0,
      TRANSLATE: 0,
      TEMPLATE: 0,
    };

    usageEvents.forEach((ev) => {
      const type = ev.type || "GENERATE";
      featureBreakdown[type] = (featureBreakdown[type] || 0) + 1;
    });

    // Daily trends (last 7 days)
    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = 0;
    }

    usageEvents.forEach((ev) => {
      const day = ev.createdAt.toISOString().split("T")[0];
      if (dailyMap[day] !== undefined) {
        dailyMap[day] += 1;
      }
    });

    const dailyTrends = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Member usage distribution (aggregated counts only)
    const memberUsageMap: Record<string, number> = {};
    usageEvents.forEach((ev) => {
      memberUsageMap[ev.userId] = (memberUsageMap[ev.userId] || 0) + 1;
    });

    const memberUsage = members.map((m) => ({
      memberId: m.id,
      name: m.user.name || m.user.email.split("@")[0],
      email: m.user.email,
      role: m.role,
      totalGenerations: memberUsageMap[m.userId] || 0,
    }));

    return {
      totalGenerations,
      featureBreakdown,
      dailyTrends,
      memberUsage,
      memberCount: members.length,
    };
  }
}

export const organizationService = new OrganizationService();
