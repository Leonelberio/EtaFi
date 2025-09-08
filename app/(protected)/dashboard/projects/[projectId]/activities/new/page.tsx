import { Suspense } from "react";
import { ActivityForm } from "@/components/ActivityForm";
import { Loader2 } from "lucide-react";

interface NewActivityPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function NewActivityPage({ params }: NewActivityPageProps) {
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
        <ActivityForm 
          projectId={projectId}
          onSuccess={() => {
            window.location.href = `/dashboard/projects/${projectId}/activities`;
          }}
        />
      </Suspense>
    </div>
  );
}
