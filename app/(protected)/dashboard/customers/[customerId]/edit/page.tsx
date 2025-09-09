import { CustomerForm } from "@/components/CustomerForm";
import { notFound } from "next/navigation";
import { getCurrentOrgId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface EditCustomerPageProps {
  params: Promise<{ customerId: string }>;
}

async function getCustomer(customerId: string, orgId: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId: orgId,
    },
  });

  return customer;
}

async function getChartAccounts(orgId: string) {
  const accounts = await prisma.chartAccount.findMany({
    where: {
      organizationId: orgId,
      type: "ASSET", // Receivable accounts are typically asset accounts
    },
    select: {
      id: true,
      number: true,
      name: true,
    },
    orderBy: {
      number: "asc",
    },
  });

  return accounts;
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    notFound();
  }

  const { customerId } = await params;
  const customer = await getCustomer(customerId, orgId);

  if (!customer) {
    notFound();
  }

  const chartAccounts = await getChartAccounts(orgId);

  // Transform customer data to match the form interface
  const customerData = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    postalCode: customer.postalCode,
    country: customer.country,
    receivableAccountId: customer.receivableAccountId,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
          <p className="text-gray-600">Update customer information</p>
        </div>
      </div>

      <CustomerForm
        chartAccounts={chartAccounts}
        customer={{
          ...customerData,
          email: customerData.email || undefined,
          phone: customerData.phone || undefined,
          address: customerData.address || undefined,
          city: customerData.city || undefined,
          postalCode: customerData.postalCode || undefined,
          country: customerData.country || undefined,
          receivableAccountId: customerData.receivableAccountId || "",
        }}
        isEditing={true}
      />
    </div>
  );
}
