import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ActivityForm } from "@/components/ActivityForm";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/auth";

interface EditActivityPageProps {
  params: Promise<{ projectId: string; activityId: string }>;
}

export default async function EditActivityPage({
  params,
}: EditActivityPageProps) {
  const { projectId, activityId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  // Fetch the activity
  const activity = await db.activity.findFirst({
    where: {
      id: activityId,
      projectId: projectId,
    },
  });

  if (!activity) {
    notFound();
  }

  // Convert Decimal fields to numbers and null to undefined for client component
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
        <ActivityForm
          projectId={projectId}
          activity={activityForClient}
          isEditing={true}
        />
      </Suspense>
    </div>
  );
}
