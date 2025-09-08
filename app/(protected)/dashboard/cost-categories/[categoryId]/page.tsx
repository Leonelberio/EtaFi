import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, TrendingUp } from "lucide-react";

interface CostCategoryDetailPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function CostCategoryDetailPage({
  params,
}: CostCategoryDetailPageProps) {
  const { categoryId } = await params;
  const organizationId = await getCurrentOrgId();

  if (!organizationId) {
    notFound();
  }

  const category = await db.costCategory.findFirst({
    where: {
      id: categoryId,
      organizationId,
    },
  });

  if (!category) {
    notFound();
  }

  // Get usage statistics
  const usageStats = await db.journalLine.count({
    where: {
      costGroup: category.code,
      organizationId,
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cost-categories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: category.color }}
            >
              {category.icon || category.code}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-600">Cost Category Details</p>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/cost-categories/${category.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Category
          </Button>
        </Link>
      </div>

      {/* Category Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>
              Basic details about this cost category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Code
                </label>
                <p className="font-mono font-bold text-lg">{category.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-gray-900">{category.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Description
              </label>
              <p className="text-gray-900">{category.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Color
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-mono text-sm">{category.color}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Sort Order
                </label>
                <p className="text-gray-900">{category.sortOrder}</p>
              </div>
            </div>

            {category.icon && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Icon
                </label>
                <p className="text-gray-900">{category.icon}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              How this category is being used in your accounting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Journal Entries
                </p>
                <p className="text-2xl font-bold text-gray-900">{usageStats}</p>
                <p className="text-sm text-gray-500">
                  Total entries using this category
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>
            System information about this category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-600">Created At</label>
              <p className="text-gray-900">
                {new Date(category.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-600">Last Updated</label>
              <p className="text-gray-900">
                {new Date(category.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
