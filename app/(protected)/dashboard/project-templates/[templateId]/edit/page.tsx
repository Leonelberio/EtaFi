import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import ProjectTemplateForm from "@/components/ProjectTemplateForm";

interface EditProjectTemplatePageProps {
  params: Promise<{ templateId: string }>;
}

export default async function EditProjectTemplatePage({
  params,
}: EditProjectTemplatePageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { templateId } = await params;

  // Get user's organization
  const membership = await db.organizationMembership.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });

  if (!membership) {
    notFound();
  }

  // Get the template
  const template = await db.projectTemplate.findFirst({
    where: {
      id: templateId,
      organizationId: membership.organizationId, // Only allow editing own organization's templates
    },
    include: {
      templateActivities: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          templateSubActivities: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <ProjectTemplateForm template={template} />
    </div>
  );
}
