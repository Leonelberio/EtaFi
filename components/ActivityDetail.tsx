"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  BarChart3,
  Package,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Calendar,
  User,
  Target,
} from "lucide-react";

interface Activity {
  id: string;
  code: string;
  name: string;
  description?: string;
  budgetAmount?: number;
  costToDate?: number;
  budgetM?: number;
  budgetS?: number;
  budgetD?: number;
  budgetE?: number;
  budgetMOD?: number;
  actualM?: number;
  actualS?: number;
  actualD?: number;
  actualE?: number;
  actualMOD?: number;
  budgetMODHours?: number;
  actualMODHours?: number;
  costType?: "FIXED" | "VARIABLE";
  costCategory?: "CONTRACTUAL" | "CLIENT_EXTRA" | "SUBCONTRACTOR_EXTRA";
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    code: string;
    name: string;
    status: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  subActivities: Array<{
    id: string;
    code: string;
    name: string;
    description?: string;
    budgetAmount?: number;
    costToDate?: number;
    budgetM?: number;
    budgetS?: number;
    budgetD?: number;
    budgetE?: number;
    budgetMOD?: number;
    actualM?: number;
    actualS?: number;
    actualD?: number;
    actualE?: number;
    actualMOD?: number;
    budgetMODHours?: number;
    actualMODHours?: number;
    costType?: "FIXED" | "VARIABLE";
    costCategory?: "CONTRACTUAL" | "CLIENT_EXTRA" | "SUBCONTRACTOR_EXTRA";
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
  _count?: {
    subActivities: number;
    journalLines: number;
  };
}

interface ActivityDetailProps {
  activity: Activity;
  projectId: string;
}

// Cost group configurations
const COST_GROUPS = [
  { key: "M", name: "Matériel", icon: Package, color: "text-blue-600" },
  { key: "S", name: "Sous-traitance", icon: Users, color: "text-purple-600" },
  { key: "D", name: "Divers", icon: FileText, color: "text-amber-600" },
  { key: "E", name: "Équipement", icon: Wrench, color: "text-green-600" },
  { key: "MOD", name: "Main-d'œuvre", icon: Users, color: "text-red-600" },
];

export function ActivityDetail({ activity, projectId }: ActivityDetailProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount?: number): string => {
    if (!amount) return "$0.00";
    return amount.toLocaleString("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    });
  };

  const calculateProgress = (actual?: number, budget?: number): number => {
    if (!budget || budget === 0) return 0;
    return Math.min(((actual || 0) / budget) * 100, 100);
  };

  const getBudgetVariance = (
    actual?: number,
    budget?: number
  ): { amount: number; percentage: number; isOverBudget: boolean } => {
    const actualAmount = actual || 0;
    const budgetAmount = budget || 0;
    const variance = actualAmount - budgetAmount;
    const percentage = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

    return {
      amount: variance,
      percentage,
      isOverBudget: variance > 0,
    };
  };

  const progress = calculateProgress(
    activity.costToDate,
    activity.budgetAmount
  );
  const variance = getBudgetVariance(
    activity.costToDate,
    activity.budgetAmount
  );

  const handleDelete = async (subActivityId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/projects/${projectId}/activities/${activity.id}/sub-activities/${subActivityId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete sub-activity");
      }

      toast.success("Sub-activity deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting sub-activity:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete sub-activity"
      );
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/projects/${projectId}/activities`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activity.name}
            </h1>
            <p className="text-gray-600">
              {activity.project.code} - {activity.project.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/dashboard/projects/${projectId}/activities/${activity.id}/edit`
              )
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Activity
          </Button>
        </div>
      </div>

      {/* Activity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(activity.budgetAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total allocated budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Cost</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(activity.costToDate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost incurred to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.toFixed(0)}%</div>
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                variance.isOverBudget ? "text-red-600" : "text-green-600"
              }`}
            >
              {variance.isOverBudget ? "+" : ""}
              {formatCurrency(variance.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {variance.percentage > 0 ? "+" : ""}
              {variance.percentage.toFixed(1)}% vs budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Information</CardTitle>
            <CardDescription>Basic details about this activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Code
                </label>
                <p className="font-mono">{activity.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={activity.isActive ? "default" : "secondary"}
                    className={
                      activity.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {activity.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {activity.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="mt-1">{activity.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Cost Type
                </label>
                <p className="mt-1">{activity.costType || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Cost Category
                </label>
                <p className="mt-1">{activity.costCategory || "—"}</p>
              </div>
            </div>

            {activity.createdBy && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Créé par
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{activity.createdBy.name}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created
                </label>
                <p className="mt-1">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="mt-1">
                  {new Date(activity.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Breakdown</CardTitle>
            <CardDescription>5-group budget allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {COST_GROUPS.map((group) => {
                const budgetValue = activity[
                  `budget${group.key}` as keyof Activity
                ] as number;
                const actualValue = activity[
                  `actual${group.key}` as keyof Activity
                ] as number;
                const groupProgress = calculateProgress(
                  actualValue,
                  budgetValue
                );
                const groupVariance = getBudgetVariance(
                  actualValue,
                  budgetValue
                );

                if (!budgetValue) return null;

                return (
                  <div key={group.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <group.icon className={`h-4 w-4 ${group.color}`} />
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(budgetValue)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Actual: {formatCurrency(actualValue)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={groupProgress} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span>{groupProgress.toFixed(0)}%</span>
                        <span
                          className={
                            groupVariance.isOverBudget
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {groupVariance.isOverBudget ? "+" : ""}
                          {formatCurrency(groupVariance.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Activities */}
      {activity.subActivities && activity.subActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sub-Activities</CardTitle>
            <CardDescription>
              Detailed breakdown of this activity (
              {activity.subActivities.length} sub-activities)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.subActivities.map((subActivity) => {
                  const subProgress = calculateProgress(
                    subActivity.costToDate,
                    subActivity.budgetAmount
                  );
                  const subVariance = getBudgetVariance(
                    subActivity.costToDate,
                    subActivity.budgetAmount
                  );

                  return (
                    <TableRow key={subActivity.id}>
                      <TableCell>
                        <div className="font-mono font-medium">
                          {subActivity.code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subActivity.name}</div>
                          {subActivity.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {subActivity.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(subActivity.budgetAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(subActivity.costToDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={subProgress}
                              className="w-16 h-2"
                            />
                            <span className="text-xs text-gray-600">
                              {subProgress.toFixed(0)}%
                            </span>
                          </div>
                          <div
                            className={`text-xs ${
                              subVariance.isOverBudget
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {subVariance.isOverBudget ? "+" : ""}
                            {formatCurrency(subVariance.amount)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            subActivity.isActive ? "default" : "secondary"
                          }
                          className={
                            subActivity.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {subActivity.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/projects/${projectId}/activities/${activity.id}/sub-activities/${subActivity.id}/edit`
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(subActivity.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sub-Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sub-activity? This action
              cannot be undone and may affect existing journal entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
