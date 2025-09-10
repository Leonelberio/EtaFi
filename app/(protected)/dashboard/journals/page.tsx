import { Suspense } from "react";
import { JournalList } from "@/components/JournalList";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calculator } from "lucide-react";

export default async function JournalsPage() {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600">
            Manage your accounting journal entries
          </p>
        </div>
      </div>

      {/* Journal List */}
      <Suspense fallback={<div>Loading journals...</div>}>
        <JournalList initialJournals={[]} />
      </Suspense>
    </div>
  );
}
