import { prisma } from "./prisma";

export async function createActivity({
  organizationId,
  name,
}: {
  organizationId: string;
  name: string;
}) {
  const last = await prisma.activity.findFirst({
    where: { organizationId },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  const nextNum = last ? parseInt(last.code, 10) + 1 : 1;
  const code = String(nextNum).padStart(6, "0");

  return prisma.activity.create({
    data: {
      organizationId,
      name,
      code,
    },
  });
}

export async function getActivities(organizationId: string) {
  return prisma.activity.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: { code: "asc" },
  });
}

export async function updateActivity(
  organizationId: string,
  activityId: string,
  data: { name?: string; isActive?: boolean }
) {
  return prisma.activity.updateMany({
    where: {
      id: activityId,
      organizationId,
    },
    data,
  });
}

export async function deleteActivity(
  organizationId: string,
  activityId: string
) {
  // Soft delete en désactivant l'activité
  return prisma.activity.updateMany({
    where: {
      id: activityId,
      organizationId,
    },
    data: { isActive: false },
  });
}
