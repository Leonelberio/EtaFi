import { Suspense } from "react";
import { PurchaseInvoiceForm } from "@/components/PurchaseInvoiceForm";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

export default async function NewPurchaseInvoicePage() {
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
          <h1 className="text-2xl font-bold text-gray-900">
            Nouvelle facture d'achat
          </h1>
          <p className="text-gray-600">Créer une nouvelle facture d'achat</p>
        </div>
      </div>

      {/* Purchase Invoice Form Component */}
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <PurchaseInvoiceForm />
      </Suspense>
    </div>
  );
}
