import { Suspense } from "react";
import { PurchaseInvoiceFormEnhanced } from "@/components/PurchaseInvoiceFormEnhanced";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { db } from "@/lib/db";

interface EditPurchaseInvoicePageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function EditPurchaseInvoicePage({
  params,
}: EditPurchaseInvoicePageProps) {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  const { invoiceId } = await params;

  // Charger la facture existante
  const invoice = await db.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId: orgId,
      type: "PURCHASE",
    },
    include: {
      vendor: true,
      project: true,
      lines: {
        orderBy: { sortOrder: "asc" },
        include: {
          project: true,
          activity: true,
          subActivity: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Charger les données nécessaires
  const [vendors, projects, chartAccounts, taxCodes] = await Promise.all([
    db.vendor
      .findMany({
        where: { organizationId: orgId },
        orderBy: { code: "asc" },
        select: {
          id: true,
          code: true,
          name: true,
          defaultCostGroup: true,
          withholdingRate: true,
          taxable: true,
          taxExempt: true,
          payableAccountId: true,
        },
      })
      .then((vendors) =>
        vendors.map((vendor) => ({
          ...vendor,
          withholdingRate: vendor.withholdingRate
            ? Number(vendor.withholdingRate)
            : null,
        }))
      ),
    db.project.findMany({
      where: { organizationId: orgId },
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
    db.chartAccount.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        name: true,
        type: true,
      },
    }),
    db.taxCode
      .findMany({
        where: { organizationId: orgId, isActive: true },
        orderBy: { code: "asc" },
        select: {
          id: true,
          code: true,
          name: true,
          rate: true,
        },
      })
      .then((codes) =>
        codes.map((code) => ({
          ...code,
          rate: Number(code.rate),
        }))
      ),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier la facture d'achat
          </h1>
          <p className="text-gray-600">
            Facture {invoice.number} - {invoice.vendor?.name}
          </p>
        </div>
      </div>

      {/* Purchase Invoice Form Component - ENHANCED */}
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <PurchaseInvoiceFormEnhanced
          invoice={invoice}
          vendors={vendors}
          projects={projects}
          chartAccounts={chartAccounts}
          taxCodes={taxCodes}
          isEditing={true}
        />
      </Suspense>
    </div>
  );
}
