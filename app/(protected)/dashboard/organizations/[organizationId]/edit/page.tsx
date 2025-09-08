import { OrganizationForm } from "@/components/OrganizationForm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

interface EditOrganizationPageProps {
  params: Promise<{ organizationId: string }>;
}

async function getOrganization(organizationId: string, userId: string) {
  const organization = await db.organization.findFirst({
    where: {
      id: organizationId,
      members: {
        some: {
          userId: userId,
          role: {
            in: ['OWNER', 'ADMIN'],
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  return organization;
}

export default async function EditOrganizationPage({ params }: EditOrganizationPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { organizationId } = await params;
  const organization = await getOrganization(organizationId, session.user.id);

  if (!organization) {
    notFound();
  }

  return (
    <OrganizationForm 
      organization={organization} 
      isEditing={true} 
    />
  );
}
