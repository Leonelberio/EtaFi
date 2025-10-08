import { Suspense } from "react";
import { JournalForm } from "@/components/JournalForm";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calculator } from "lucide-react";

export default async function NewJournalPage() {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nouvelle écriture de journal
          </h1>
          <p className="text-gray-600">Créer une nouvelle écriture comptable</p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <JournalForm />
      </Suspense>
    </div>
  );
}
