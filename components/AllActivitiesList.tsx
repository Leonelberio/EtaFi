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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FolderOpen,
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
  project: {
    id: string;
    name: string;
    code: string;
    status: string;
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

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
}

// Cost group configurations
const COST_GROUPS = [
  { key: "M", name: "Matériel", icon: Package, color: "text-blue-600" },
  { key: "S", name: "Sous-traitance", icon: Users, color: "text-purple-600" },
  { key: "D", name: "Divers", icon: FileText, color: "text-amber-600" },
  { key: "E", name: "Équipement", icon: Wrench, color: "text-green-600" },
  { key: "MOD", name: "Main-d'œuvre", icon: Users, color: "text-red-600" },
];

export function AllActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchActivities();
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.project.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (activity.description &&
            activity.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by project
    if (selectedProject !== "all") {
      filtered = filtered.filter(
        (activity) => activity.project.id === selectedProject
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      const isActive = selectedStatus === "active";
      filtered = filtered.filter((activity) => activity.isActive === isActive);
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, selectedProject, selectedStatus]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/activities");

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

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // Find the activity to get its project ID
      const activity = activities.find((a) => a.id === id);
      if (!activity) return;

      const response = await fetch(
        `/api/projects/${activity.project.id}/activities/${id}`,
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
      // Find the activity to get its project ID
      const activity = activities.find((a) => a.id === id);
      if (!activity) return;

      const response = await fetch(
        `/api/projects/${activity.project.id}/activities/${id}`,
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
          <CardTitle>All Project Activities</CardTitle>
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
                All Project Activities
              </CardTitle>
              <CardDescription>
                Manage and track activities across all projects with 5-group
                budget system
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/dashboard/projects")}>
              <FolderOpen className="h-4 w-4 mr-2" />
              View Projects
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by code, name, project, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activities Table */}
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ||
                selectedProject !== "all" ||
                selectedStatus !== "all"
                  ? "No activities found"
                  : "No activities configured"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                selectedProject !== "all" ||
                selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating activities in your projects"}
              </p>
              <Button onClick={() => router.push("/dashboard/projects")}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Go to Projects
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Activity Name</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Sub-Activities</TableHead>
                    <TableHead>Status</TableHead>
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
                          <div>
                            <div className="font-medium">
                              {activity.project.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.project.code}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {activity.project.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono font-medium">
                            {activity.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{activity.name}</div>
                            {activity.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {activity.description}
                              </div>
                            )}
                          </div>
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
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(activity.costToDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="w-16 h-2" />
                              <span className="text-xs text-gray-600">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
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
                        <TableCell>
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
                                    `/dashboard/projects/${activity.project.id}/activities/${activity.id}`
                                  )
                                }
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/projects/${activity.project.id}/activities/${activity.id}/edit`
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
