import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { ActivityDetail } from "@/components/ActivityDetail";
import { Loader2 } from "lucide-react";

interface ActivityDetailPageProps {
  params: Promise<{ projectId: string; activityId: string }>;
}

export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  const { projectId, activityId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  // Fetch the activity with related data
  const activity = await db.activity.findFirst({
    where: {
      id: activityId,
      projectId: projectId,
      organizationId: orgId,
    },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      subActivities: {
        orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
      },
      _count: {
        select: {
          subActivities: true,
          journalLines: true,
        },
      },
    },
  });

  if (!activity) {
    notFound();
  }

  // Convert Decimal fields to numbers for client component
  const activityForClient = {
    ...activity,
    description: activity.description || undefined,
    budgetAmount: activity.budgetAmount
      ? Number(activity.budgetAmount)
      : undefined,
    costToDate: activity.costToDate ? Number(activity.costToDate) : 0,
    budgetM: activity.budgetM ? Number(activity.budgetM) : undefined,
    budgetS: activity.budgetS ? Number(activity.budgetS) : undefined,
    budgetD: activity.budgetD ? Number(activity.budgetD) : undefined,
    budgetE: activity.budgetE ? Number(activity.budgetE) : undefined,
    budgetMOD: activity.budgetMOD ? Number(activity.budgetMOD) : undefined,
    actualM: activity.actualM ? Number(activity.actualM) : 0,
    actualS: activity.actualS ? Number(activity.actualS) : 0,
    actualD: activity.actualD ? Number(activity.actualD) : 0,
    actualE: activity.actualE ? Number(activity.actualE) : 0,
    actualMOD: activity.actualMOD ? Number(activity.actualMOD) : 0,
    budgetMODHours: activity.budgetMODHours
      ? Number(activity.budgetMODHours)
      : undefined,
    actualMODHours: activity.actualMODHours
      ? Number(activity.actualMODHours)
      : undefined,
    costType: (activity.costType as "FIXED" | "VARIABLE") || undefined,
    costCategory:
      (activity.costCategory as
        | "CONTRACTUAL"
        | "CLIENT_EXTRA"
        | "SUBCONTRACTOR_EXTRA") || undefined,
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
    createdBy: activity.createdBy ? {
      id: activity.createdBy.id,
      name: activity.createdBy.name || "",
      email: activity.createdBy.email || "",
    } : undefined,
    subActivities: activity.subActivities.map((sub) => ({
      ...sub,
      description: sub.description || undefined,
      budgetAmount: sub.budgetAmount ? Number(sub.budgetAmount) : undefined,
      costToDate: sub.costToDate ? Number(sub.costToDate) : 0,
      budgetM: sub.budgetM ? Number(sub.budgetM) : undefined,
      budgetS: sub.budgetS ? Number(sub.budgetS) : undefined,
      budgetD: sub.budgetD ? Number(sub.budgetD) : undefined,
      budgetE: sub.budgetE ? Number(sub.budgetE) : undefined,
      budgetMOD: sub.budgetMOD ? Number(sub.budgetMOD) : undefined,
      actualM: sub.actualM ? Number(sub.actualM) : 0,
      actualS: sub.actualS ? Number(sub.actualS) : 0,
      actualD: sub.actualD ? Number(sub.actualD) : 0,
      actualE: sub.actualE ? Number(sub.actualE) : 0,
      actualMOD: sub.actualMOD ? Number(sub.actualMOD) : 0,
      budgetMODHours: sub.budgetMODHours
        ? Number(sub.budgetMODHours)
        : undefined,
      actualMODHours: sub.actualMODHours
        ? Number(sub.actualMODHours)
        : undefined,
      costType: (sub.costType as "FIXED" | "VARIABLE") || undefined,
      costCategory:
        (sub.costCategory as
          | "CONTRACTUAL"
          | "CLIENT_EXTRA"
          | "SUBCONTRACTOR_EXTRA") || undefined,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    })),
  };

  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <ActivityDetail activity={activityForClient} projectId={projectId} />
      </Suspense>
    </div>
  );
}
