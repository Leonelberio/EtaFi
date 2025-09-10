import { Suspense } from "react";
import { InvoiceList } from "@/components/InvoiceList";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

export default async function InvoicesPage() {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600">Gestion des factures et facturation par projet</p>
        </div>
      </div>

      {/* Invoice List Component */}
      <Suspense fallback={<div>Chargement des factures...</div>}>
        <InvoiceList />
      </Suspense>
    </div>
  );
}
