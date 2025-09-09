import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProjectCostGroupManager } from "@/components/ProjectCostGroupManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

interface ProjectCostGroupsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectCostGroupsPage({
  params,
}: ProjectCostGroupsPageProps) {
  const { projectId } = await params;
  const orgId = await getCurrentOrgId();

  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  // Fetch project data
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      organizationId: orgId,
    },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Projet
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Configuration des Groupes de Coûts
              </h1>
              <p className="text-muted-foreground">
                Projet: {project.code} - {project.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          À propos de la Configuration des Groupes
        </h3>
        <p className="text-sm text-blue-800">
          Assignez des comptes du plan comptable général (GL) aux 5 groupes de
          coûts (M, S, D, E, MOD) spécifiquement pour ce projet. Cela permet une
          imputation automatique et précise des coûts selon la nature des
          dépenses.
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>
            • <strong>M</strong> - Matériel & Fournitures
          </li>
          <li>
            • <strong>S</strong> - Sous-traitance & Services
          </li>
          <li>
            • <strong>D</strong> - Frais Généraux & Divers
          </li>
          <li>
            • <strong>E</strong> - Équipement & Outillage
          </li>
          <li>
            • <strong>MOD</strong> - Main-d'œuvre Directe
          </li>
        </ul>
      </div>

      {/* Cost Group Manager */}
      <ProjectCostGroupManager
        projectId={project.id}
        projectName={`${project.code} - ${project.name}`}
      />
    </div>
  );
}
