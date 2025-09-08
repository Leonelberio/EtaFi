import { Suspense } from "react";
import { VendorForm } from "@/components/VendorForm";
import { getCurrentOrgId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Truck } from "lucide-react";

export default async function NewVendorPage() {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/auth/login");
  }

  const chartAccounts = await prisma.chartAccount.findMany({
    where: { organizationId: orgId },
    select: { id: true, number: true, name: true },
    orderBy: { number: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Truck className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Vendor</h1>
          <p className="text-gray-600">Create a new vendor account</p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<div>Loading form...</div>}>
        <VendorForm chartAccounts={chartAccounts} />
      </Suspense>
    </div>
  );
}
