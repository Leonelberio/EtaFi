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

  const membership = await db.organizationMembership.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });

  return membership?.organizationId ?? null;
};

export const requireOrgId = async (): Promise<string> => {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    throw new Error("Organization ID required");
  }
  return orgId;
};
