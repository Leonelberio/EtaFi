import { Suspense } from "react";
import { AllActivitiesList } from "@/components/AllActivitiesList";
import { Loader2 } from "lucide-react";

export default function ActivitiesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Project Activities
        </h1>
        <p className="text-muted-foreground">
          Manage and track all project activities across your organization
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <AllActivitiesList />
      </Suspense>
    </div>
  );
}
