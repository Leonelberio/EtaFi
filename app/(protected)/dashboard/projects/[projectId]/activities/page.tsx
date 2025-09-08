import { Suspense } from "react";
import { ActivityList } from "@/components/ActivityList";
import { Loader2 } from "lucide-react";

interface ActivitiesPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ActivitiesPage({ params }: ActivitiesPageProps) {
  const { projectId } = await params;

  return (
    <div className="p-6">
      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <ActivityList projectId={projectId} />
      </Suspense>
    </div>
  );
}
