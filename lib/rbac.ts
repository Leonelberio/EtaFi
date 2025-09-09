/**
 * Simple Role-Based Access Control (RBAC) System
 *
 * This is a simplified version that provides basic role checking
 * without the complex ERP module system
 */

import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Simple role definitions
export const ROLES = {
  OWNER: "OWNER",
  ADMINISTRATOR: "ADMINISTRATOR",
  CPA_CONTROLEUR: "CPA_CONTROLEUR",
  TECHNICIEN: "TECHNICIEN",
  GESTIONNAIRE: "GESTIONNAIRE",
  DEMANDEUR: "DEMANDEUR",
  LECTURE: "LECTURE",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Simple permission checking
export async function hasPermission(
  userId: string,
  organizationId: string | undefined,
  requiredRole: Role
): Promise<boolean> {
  try {
    if (!organizationId) return false;
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
      },
    });

    if (!membership) return false;

    // Simple role hierarchy - higher roles have access to lower roles
    const roleHierarchy = {
      [ROLES.OWNER]: 100,
      [ROLES.ADMINISTRATOR]: 90,
      [ROLES.CPA_CONTROLEUR]: 80,
      [ROLES.TECHNICIEN]: 60,
      [ROLES.GESTIONNAIRE]: 50,
      [ROLES.DEMANDEUR]: 30,
      [ROLES.LECTURE]: 10,
      [ROLES.MEMBER]: 5,
    };

    const userRoleLevel = roleHierarchy[membership.role as Role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}

// Get user's role in an organization
export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<Role | null> {
  try {
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
      },
    });

    return (membership?.role as Role) || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Check if user is owner
export async function isOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerId: userId,
      },
    });

    return !!organization;
  } catch (error) {
    console.error("Error checking ownership:", error);
    return false;
  }
}

// Simple role gate component helper
export function canAccessResource(
  userRole: Role | null,
  requiredRole: Role
): boolean {
  if (!userRole) return false;

  const roleHierarchy = {
    [ROLES.OWNER]: 100,
    [ROLES.ADMINISTRATOR]: 90,
    [ROLES.CPA_CONTROLEUR]: 80,
    [ROLES.TECHNICIEN]: 60,
    [ROLES.GESTIONNAIRE]: 50,
    [ROLES.DEMANDEUR]: 30,
    [ROLES.LECTURE]: 10,
    [ROLES.MEMBER]: 5,
  };

  const userRoleLevel = roleHierarchy[userRole] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
}
