import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, DollarSign, Users, FolderOpen } from "lucide-react";
import Link from "next/link";

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
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
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tempManager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      activities: {
        select: {
          id: true,
          code: true,
          name: true,
          isActive: true,
          budgetAmount: true,
          costToDate: true,
        },
        orderBy: { code: "asc" },
      },
      _count: {
        select: {
          activities: true,
          journalLines: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getKindColor = (kind: string) => {
    switch (kind) {
      case "BILLABLE":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">Project Code: {project.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          <Badge className={getKindColor(project.kind)}>{project.kind}</Badge>
          <Button asChild>
            <Link href={`/dashboard/projects/${project.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Info</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm font-medium">
                  {project.description || "No description provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="text-sm font-medium">
                  {project.currency || "CAD"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="text-sm font-medium">
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Manager</p>
                <p className="text-sm font-medium">
                  {project.manager?.name || "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="text-sm font-medium">
                  {project.client?.name || "Not assigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Activities</CardTitle>
              <CardDescription>
                {project._count.activities} activities with budget tracking
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href={`/dashboard/projects/${project.id}/activities`}>
                Manage Activities
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.activities.length > 0 ? (
            <div className="space-y-2">
              {project.activities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {activity.code} - {activity.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Budget: $
                      {activity.budgetAmount?.toLocaleString("en-CA") || "0"}{" "}
                      CAD
                      {activity.costToDate && (
                        <>
                          {" "}
                          • Actual: $
                          {activity.costToDate.toLocaleString("en-CA")} CAD
                        </>
                      )}
                    </p>
                  </div>
                  <Badge variant={activity.isActive ? "default" : "secondary"}>
                    {activity.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
              {project.activities.length > 5 && (
                <div className="text-center pt-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/projects/${project.id}/activities`}>
                      View all {project.activities.length} activities
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                No activities created yet.
              </p>
              <Button asChild>
                <Link href={`/dashboard/projects/${project.id}/activities/new`}>
                  Create First Activity
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
