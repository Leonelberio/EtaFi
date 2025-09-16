import { Suspense } from "react";
import { PurchaseInvoiceForm } from "@/components/PurchaseInvoiceForm";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

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
            Modifier une facture d'achat existante
          </p>
        </div>
      </div>

      {/* Purchase Invoice Form Component */}
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <PurchaseInvoiceForm invoiceId={invoiceId} />
      </Suspense>
    </div>
  );
}
