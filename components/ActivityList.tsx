"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Package,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Loader2,
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
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  subActivities?: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  _count?: {
    subActivities: number;
    journalLines: number;
  };
}

interface ActivityListProps {
  projectId: string;
  projectName?: string;
}

// Cost group configurations
const COST_GROUPS = [
  { key: "M", name: "Matériel", icon: Package, color: "text-blue-600" },
  { key: "S", name: "Sous-traitance", icon: Users, color: "text-purple-600" },
  { key: "D", name: "Divers", icon: FileText, color: "text-amber-600" },
  { key: "E", name: "Équipement", icon: Wrench, color: "text-green-600" },
  { key: "MOD", name: "Main-d'œuvre", icon: Users, color: "text-red-600" },
];

export function ActivityList({ projectId, projectName }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  useEffect(() => {
    const filtered = activities.filter(
      (activity) =>
        activity.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.description &&
          activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredActivities(filtered);
  }, [activities, searchTerm]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/activities`);

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/activities/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update activity");
      }

      toast.success(
        currentStatus ? "Activity deactivated" : "Activity activated"
      );
      fetchActivities();
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Failed to update activity");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/projects/${projectId}/activities/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to delete activity");
      }

      toast.success("Activity deleted successfully");
      setDeleteId(null);
      fetchActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete activity"
      );
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Activities</CardTitle>
          <CardDescription>Loading activities...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Project Activities
                {projectName && <Badge variant="outline">{projectName}</Badge>}
              </CardTitle>
              <CardDescription>
                Manage activities and track budget vs actual costs by 5-group
                system
              </CardDescription>
            </div>
            <Button
              onClick={() =>
                router.push(`/dashboard/projects/${projectId}/activities/new`)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              New Activity
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by code, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Activities Table */}
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm
                  ? "No activities found"
                  : "No activities configured"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first project activity with budget breakdown"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/projects/${projectId}/activities/new`
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Activity
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Activity Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Created By
                    </TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Actual
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Progress
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Variance
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Sub-Activities
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const progress = calculateProgress(
                      activity.costToDate,
                      activity.budgetAmount
                    );
                    const variance = getBudgetVariance(
                      activity.costToDate,
                      activity.budgetAmount
                    );

                    return (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="font-mono font-medium">
                            {activity.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/projects/${projectId}/activities/${activity.id}`
                                )
                              }
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {activity.name}
                            </button>
                            {activity.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {activity.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {activity.createdBy ? (
                            <div className="font-medium">
                              {activity.createdBy.name}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatCurrency(activity.budgetAmount)}
                            </div>
                            {activity.budgetM ||
                            activity.budgetS ||
                            activity.budgetD ||
                            activity.budgetE ||
                            activity.budgetMOD ? (
                              <div className="flex gap-1">
                                {COST_GROUPS.map((group) => {
                                  const value = activity[
                                    `budget${group.key}` as keyof Activity
                                  ] as number;
                                  if (!value) return null;

                                  return (
                                    <Badge
                                      key={group.key}
                                      variant="outline"
                                      className="text-xs px-1"
                                    >
                                      {group.key}: ${Math.round(value / 1000)}k
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="font-medium">
                            {formatCurrency(activity.costToDate)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="w-16 h-2" />
                              <span className="text-xs text-gray-600">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div
                            className={`text-sm font-medium ${
                              variance.isOverBudget
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {variance.isOverBudget ? "+" : ""}
                            {formatCurrency(variance.amount)}
                          </div>
                          <div
                            className={`text-xs ${
                              variance.isOverBudget
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {variance.percentage > 0 ? "+" : ""}
                            {variance.percentage.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {activity._count?.subActivities || 0}
                            </span>
                            {(activity._count?.subActivities || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Sub-activities
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={
                              activity.isActive ? "default" : "secondary"
                            }
                            className={
                              activity.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {activity.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/projects/${projectId}/activities/${activity.id}`
                                  )
                                }
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/projects/${projectId}/activities/${activity.id}/edit`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleActive(
                                    activity.id,
                                    activity.isActive
                                  )
                                }
                              >
                                {activity.isActive ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteId(activity.id)}
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
            </div>
          )}

          {/* Summary Stats */}
          {filteredActivities.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
              <div>
                Showing {filteredActivities.length} of {activities.length}{" "}
                activities
              </div>
              <div className="flex gap-4">
                <span>
                  Active: {activities.filter((a) => a.isActive).length}
                </span>
                <span>
                  Inactive: {activities.filter((a) => !a.isActive).length}
                </span>
                <span>
                  Total Budget:{" "}
                  {formatCurrency(
                    activities.reduce(
                      (sum, a) => sum + (a.budgetAmount || 0),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot
              be undone and may affect existing journal entries and
              sub-activities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
    </>
  );
}
