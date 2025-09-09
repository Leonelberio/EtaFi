import { Suspense } from "react";
import { ProjectList } from "@/components/ProjectList";
import { getCurrentOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectList initialProjects={[]} />
      </Suspense>
    </div>
  );
}
