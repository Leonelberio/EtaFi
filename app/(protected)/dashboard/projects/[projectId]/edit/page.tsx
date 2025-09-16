import { ProjectForm } from "@/components/ProjectForm";
import { getCurrentOrgId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

interface EditProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { projectId } = await params;
  const orgId = await getCurrentOrgId();

  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  // Fetch project data
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId: orgId,
    },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      executionAddress: true,
      projectDomain: true,
      clientId: true,
      managerId: true,
      tempManagerId: true,
      tempManagerEnd: true,
      kind: true,
      status: true,
      totalBudget: true,
      totalBudgetCosting: true,
      totalBudgetSelling: true,
      initialProfitDollars: true,
      initialProfitPercent: true,
      currency: true,
      startDate: true,
      endDate: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tempManager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <ProjectForm
      project={{
        ...project,
        description: project.description || undefined,
        clientId: project.clientId || undefined,
        managerId: project.managerId || undefined,
        tempManagerId: project.tempManagerId || undefined,
        tempManagerEnd:
          project.tempManagerEnd?.toISOString().split("T")[0] || undefined,
        startDate: project.startDate?.toISOString().split("T")[0] || undefined,
        endDate: project.endDate?.toISOString().split("T")[0] || undefined,
        kind: project.kind as "ADMIN" | "BILLABLE",
        status: project.status as
          | "ACTIVE"
          | "ON_HOLD"
          | "COMPLETED"
          | "CANCELLED",
        totalBudget: project.totalBudget
          ? parseFloat(project.totalBudget.toString())
          : undefined,
      }}
      clients={[]}
      managers={[]}
      isEditing
    />
  );
}
