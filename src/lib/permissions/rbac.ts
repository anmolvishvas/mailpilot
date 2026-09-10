import { prisma } from "@/lib/db/prisma";
import type { OrgRole } from "@/types";

export interface OrgPermissionContext {
  organizationId: string;
  userId: string;
  role: OrgRole;
}

export async function getMemberRole(organizationId: string, userId: string): Promise<OrgRole | null> {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
    select: { role: true },
  });

  return (member?.role as OrgRole) || null;
}

export async function verifyOrgAccess(organizationId: string, userId: string): Promise<OrgPermissionContext> {
  const role = await getMemberRole(organizationId, userId);
  if (!role) {
    throw new Error("Access denied: You are not a member of this organization");
  }

  return {
    organizationId,
    userId,
    role,
  };
}

export function canManageMembers(role: OrgRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageRoles(role: OrgRole): boolean {
  return role === "OWNER";
}

export function canManageSharedTemplates(role: OrgRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageVoiceAndTone(role: OrgRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canViewAnalytics(role: OrgRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canDeleteOrganization(role: OrgRole): boolean {
  return role === "OWNER";
}
