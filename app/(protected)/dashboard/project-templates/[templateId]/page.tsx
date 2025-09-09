import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  Edit,
  Copy,
  ArrowLeft,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface ProjectTemplatePageProps {
  params: Promise<{ templateId: string }>;
}

export default async function ProjectTemplatePage({
  params,
}: ProjectTemplatePageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { templateId } = await params;

  // Get user's organization
  const membership = await db.organizationMembership.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });

  if (!membership) {
    notFound();
  }

  // Get the template
  const template = await db.projectTemplate.findFirst({
    where: {
      id: templateId,
      OR: [{ organizationId: membership.organizationId }, { isPublic: true }],
    },
    include: {
      templateActivities: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          templateSubActivities: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          templateActivities: true,
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  const formatCurrency = (amount?: number, currency = "CAD") => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Construction: "bg-blue-100 text-blue-800",
      Renovation: "bg-purple-100 text-purple-800",
      Maintenance: "bg-green-100 text-green-800",
      Development: "bg-orange-100 text-orange-800",
      Consulting: "bg-pink-100 text-pink-800",
    };
    return colors[category || ""] || "bg-gray-100 text-gray-800";
  };

  const getIndustryColor = (industry?: string) => {
    const colors: Record<string, string> = {
      Residential: "bg-blue-100 text-blue-800",
      Commercial: "bg-green-100 text-green-800",
      Industrial: "bg-orange-100 text-orange-800",
      Infrastructure: "bg-purple-100 text-purple-800",
      Services: "bg-pink-100 text-pink-800",
    };
    return colors[industry || ""] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/project-templates">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">
              {template.description || "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/project-templates/${template.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/projects/new?template=${template.id}`}>
              <Copy className="w-4 h-4 mr-2" />
              Apply Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Template Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Template Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={template.isActive ? "default" : "secondary"}>
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Visibility</span>
              <Badge variant={template.isPublic ? "default" : "outline"}>
                {template.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">
                {new Date(template.createdAt).toLocaleDateString()}
              </span>
            </div>
            {template.createdBy && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Created by
                </span>
                <span className="text-sm">
                  {template.createdBy.name || template.createdBy.email}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Activities
              </span>
              <span className="text-lg font-semibold">
                {template._count.templateActivities}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Sub-Activities
              </span>
              <span className="text-lg font-semibold">
                {template.templateActivities.reduce(
                  (sum, activity) =>
                    sum + (activity.templateSubActivities?.length || 0),
                  0
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Budget</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Budget
              </span>
              <span className="text-lg font-semibold">
                {formatCurrency(
                  parseFloat(template.totalBudget?.toString() || "0"),
                  template.currency
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Currency</span>
              <span className="text-sm font-medium">{template.currency}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      {(template.category || template.industry) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {template.category && (
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              )}
              {template.industry && (
                <Badge className={getIndustryColor(template.industry)}>
                  {template.industry}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Activities</CardTitle>
          <CardDescription>
            Predefined activities and sub-activities for this template
          </CardDescription>
        </CardHeader>
        <CardContent>
          {template.templateActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No activities defined in this template.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {template.templateActivities.map((activity, index) => (
                <Card
                  key={activity.id}
                  className="border-l-4 border-l-blue-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">Activity {index + 1}</Badge>
                        <div>
                          <h4 className="font-medium">{activity.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Code: {activity.code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(
                            parseFloat(
                              activity.budgetAmount?.toString() || "0"
                            ),
                            template.currency
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Budget
                        </div>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {activity.description}
                      </p>
                    )}
                  </CardHeader>

                  {activity.templateSubActivities &&
                    activity.templateSubActivities.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">
                            Sub-Activities:
                          </h5>
                          <div className="grid gap-2">
                            {activity.templateSubActivities.map(
                              (subActivity, subIndex) => (
                                <div
                                  key={subActivity.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {subActivity.code}
                                    </span>
                                    <span className="text-sm">
                                      {subActivity.name}
                                    </span>
                                  </div>
                                  {subActivity.budgetAmount && (
                                    <span className="text-xs font-medium">
                                      {formatCurrency(
                                        parseFloat(
                                          subActivity.budgetAmount?.toString() ||
                                            "0"
                                        ),
                                        template.currency
                                      )}
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
