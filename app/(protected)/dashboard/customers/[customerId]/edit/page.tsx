import { Suspense } from "react";
import { CustomerForm } from "@/components/CustomerForm";
import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Users } from "lucide-react";

interface EditCustomerPageProps {
  params: Promise<{ customerId: string }>;
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/auth/login");
  }

  const { customerId } = await params;

  // Fetch customer and chart accounts in parallel
  const [customer, chartAccounts] = await Promise.all([
    db.customer.findFirst({
      where: {
        id: customerId,
        organizationId: orgId,
      },
      include: {
        receivableAccount: {
          select: { id: true, number: true, name: true },
        },
      },
    }),
    db.chartAccount.findMany({
      where: { organizationId: orgId },
      select: { id: true, number: true, name: true },
      orderBy: { number: "asc" },
    }),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Users className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
          <p className="text-gray-600">Update customer information</p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<div>Loading form...</div>}>
        <CustomerForm 
          chartAccounts={chartAccounts} 
          customer={{
            ...customer,
            email: customer.email || undefined,
            phone: customer.phone || undefined,
            address: customer.address || undefined,
            city: customer.city || undefined,
            postalCode: customer.postalCode || undefined,
            country: customer.country || undefined,
            receivableAccountId: customer.receivableAccountId || "",
          }}
          isEditing={true}
        />
      </Suspense>
    </div>
  );
}