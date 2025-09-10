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
      {/* Grand Livre Component */}
      <Suspense fallback={<div>Chargement du grand livre...</div>}>
        <GrandLivre />
      </Suspense>
    </div>
  );
}
