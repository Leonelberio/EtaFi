import { OrganizationForm } from "@/components/OrganizationForm";
import { OrganizationSettingsProvider } from "@/contexts/OrganizationSettingsContext";
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
            in: ["OWNER", "ADMIN"],
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      businessDomain: true,
      address: true,
      city: true,
      postalCode: true,
      country: true,
      phone: true,
      email: true,
      website: true,
      taxNumber: true,
      nasNumber: true,
      gstNumber: true,
      qstNumber: true,
      fiscalYearEnd: true,
    },
  });

  return organization;
}

export default async function EditOrganizationPage({
  params,
}: EditOrganizationPageProps) {
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
    <OrganizationSettingsProvider>
      <OrganizationForm
        organization={{
          ...organization,
          description: organization.description || undefined,
          email: organization.email || undefined,
          phone: organization.phone || undefined,
          address: organization.address || undefined,
          city: organization.city || undefined,
          postalCode: organization.postalCode || undefined,
          country: organization.country || undefined,
          businessDomain: organization.businessDomain || undefined,
          nasNumber: organization.nasNumber || undefined,
          website: organization.website || undefined,
          taxNumber: organization.taxNumber || undefined,
          gstNumber: organization.gstNumber || undefined,
          qstNumber: organization.qstNumber || undefined,
          fiscalYearEnd: organization.fiscalYearEnd || undefined,
        }}
        isEditing={true}
      />
    </OrganizationSettingsProvider>
  );
}
