import { Suspense } from "react";
import { VendorForm } from "@/components/VendorForm";
import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Truck } from "lucide-react";

interface EditVendorPageProps {
  params: Promise<{ vendorId: string }>;
}

export default async function EditVendorPage({ params }: EditVendorPageProps) {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/auth/login");
  }

  const { vendorId } = await params;

  // Fetch vendor and chart accounts in parallel
  const [vendor, chartAccounts] = await Promise.all([
    db.vendor.findFirst({
      where: {
        id: vendorId,
        organizationId: orgId,
      },
      include: {
        payableAccount: {
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

  if (!vendor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Truck className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
          <p className="text-gray-600">Update vendor information</p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<div>Loading form...</div>}>
        <VendorForm 
          chartAccounts={chartAccounts} 
          vendor={{
            ...vendor,
            email: vendor.email || undefined,
            phone: vendor.phone || undefined,
            address: vendor.address || undefined,
            city: vendor.city || undefined,
            postalCode: vendor.postalCode || undefined,
            country: vendor.country || undefined,
            payableAccountId: vendor.payableAccountId || "",
            withholdingRate: vendor.withholdingRate ? Number(vendor.withholdingRate) : undefined,
            taxable: vendor.taxable ?? true,
            taxExempt: vendor.taxExempt ?? false,
            taxNumber: vendor.taxNumber || undefined,
            gstNumber: vendor.gstNumber || undefined,
            qstNumber: vendor.qstNumber || undefined,
            defaultCostGroup: vendor.defaultCostGroup || undefined,
          }}
          isEditing={true}
        />
      </Suspense>
    </div>
  );
}
