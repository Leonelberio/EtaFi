import { Suspense } from "react";
import { GrandLivre } from "@/components/GrandLivre";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

export default async function LedgerPage() {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grand Livre</h1>
          <p className="text-gray-600">
            Gestion du grand livre et états financiers
          </p>
        </div>
      </div>

      {/* Grand Livre Component */}
      <Suspense fallback={<div>Chargement du grand livre...</div>}>
        <GrandLivre />
      </Suspense>
    </div>
  );
}
