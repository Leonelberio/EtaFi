"use client";

import ProjectTemplateList from "@/components/ProjectTemplateList";
import { useRouter } from "next/navigation";

export default function ProjectTemplatesPage() {
  const router = useRouter();

  const handleTemplateApplied = (template: any) => {
    // Redirect to projects page after successful template application
    router.push("/dashboard/projects");
  };

  return (
    <div className="container mx-auto py-6">
      <ProjectTemplateList onApply={handleTemplateApplied} />
    </div>
  );
}
