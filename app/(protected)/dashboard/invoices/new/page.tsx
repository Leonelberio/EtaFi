import { Suspense } from "react";
import { SalesInvoiceFormEnhanced } from "@/components/SalesInvoiceFormEnhanced";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { db } from "@/lib/db";

export default async function NewInvoicePage() {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  // Charger les données nécessaires
  const [customers, projects, chartAccounts, taxCodes] = await Promise.all([
    db.customer.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    db.project.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        invoicePrefix: true,
        lastInvoiceNumber: true,
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
            Nouvelle facture de vente
          </h1>
          <p className="text-gray-600">
            Facturation contractuelle conforme NCECF
          </p>
        </div>
      </div>

      {/* Sales Invoice Form Component - ENHANCED */}
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <SalesInvoiceFormEnhanced
          customers={customers}
          projects={projects}
          chartAccounts={chartAccounts}
          taxCodes={taxCodes}
        />
      </Suspense>
    </div>
  );
}
