import { auth } from "@/auth";
import { db } from "./db";

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};

export const getOrgId = async (req: Request): Promise<string | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Récupérer l'organisation de l'utilisateur
  const membership = await db.organizationMembership.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });

  return membership?.organizationId ?? null;
};

export const getCurrentOrgId = async (): Promise<string | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  // First, try to get user's preferred current organization
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { currentOrganizationId: true },
  });

  // If user has a current organization preference, verify they still have access
  if (user?.currentOrganizationId) {
    const membership = await db.organizationMembership.findFirst({
      where: {
        userId: session.user.id,
        organizationId: user.currentOrganizationId,
        isActive: true,
      },
      select: { organizationId: true },
    });

    if (membership) {
      return membership.organizationId;
    }
  }

  // Fallback: get the first organization they're a member of
  const fallbackMembership = await db.organizationMembership.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    select: { organizationId: true },
  });

  return fallbackMembership?.organizationId ?? null;
};

export const requireOrgId = async (): Promise<string> => {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    throw new Error("Organization ID required");
  }
  return orgId;
};
