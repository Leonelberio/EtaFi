"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderOpen,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  DollarSign,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  kind: "ADMIN" | "BILLABLE";
  totalBudget?: number;
  calculatedBudget?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  client?: {
    id: string;
    name: string;
    email?: string;
  };
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  tempManager?: {
    id: string;
    name: string;
    email: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  activities: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    _count: {
      subActivities: number;
    };
  }>;
  _count: {
    activities: number;
    invoices: number;
    journalLines: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectListProps {
  initialProjects?: Project[];
}

export function ProjectList({ initialProjects = [] }: ProjectListProps) {
  const router = useRouter();
  const { currentOrganization } = useOrganizationContext();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (statusFilter !== "all") {
        queryParams.set("status", statusFilter);
      }
      if (kindFilter !== "all") {
        queryParams.set("kind", kindFilter);
      }

      const response = await fetch(`/api/projects?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch projects on mount and when filters change
    fetchProjects();
  }, [statusFilter, kindFilter]);

  // 🆕 Re-fetch projects when organization changes
  useEffect(() => {
    if (currentOrganization) {
      console.log(
        "Organization changed, re-fetching projects for:",
        currentOrganization.id
      );
      fetchProjects();
    }
  }, [currentOrganization?.id]);

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.manager?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle project deletion
  const handleDelete = async (projectId: string, projectCode: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project");
      }

      toast.success("Project deleted successfully");
      await fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project"
      );
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "ON_HOLD":
        return "secondary";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get kind badge variant
  const getKindVariant = (kind: string) => {
    switch (kind) {
      case "BILLABLE":
        return "default";
      case "ADMIN":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Format currency
  const formatCurrency = (amount?: number, currency = "CAD") => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-CA");
  };

  // Calculate project stats
  const projectStats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "ACTIVE").length,
    onHold: projects.filter((p) => p.status === "ON_HOLD").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
    billable: projects.filter((p) => p.kind === "BILLABLE").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">
            Manage your project portfolio and track progress
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/projects/new")}>
          <FolderOpen className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-2xl font-bold">{projectStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{projectStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-2xl font-bold">{projectStats.onHold}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{projectStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Billable</p>
                <p className="text-2xl font-bold">{projectStats.billable}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project List</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kindFilter} onValueChange={setKindFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="BILLABLE">Billable</SelectItem>
                <SelectItem value="ADMIN">Administrative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all" || kindFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first project"}
              </p>
              {!searchTerm &&
                statusFilter === "all" &&
                kindFilter === "all" && (
                  <Button
                    onClick={() => router.push("/dashboard/projects/new")}
                  >
                    Create New Project
                  </Button>
                )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Manager
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created By
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Activities
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <button
                          onClick={() =>
                            router.push(`/dashboard/projects/${project.id}`)
                          }
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {project.code}
                        </button>
                        <div className="text-sm text-gray-500">
                          {project.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.client ? (
                        <div>
                          <div className="font-medium">
                            {project.client.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.client.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.manager ? (
                        <div>
                          <div className="font-medium">
                            {project.manager.name}
                          </div>
                          {project.tempManager && (
                            <div className="text-sm text-orange-600">
                              Temp: {project.tempManager.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.createdBy ? (
                        <div className="font-medium">
                          {project.createdBy.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(project.status)}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getKindVariant(project.kind)}>
                        {project.kind === "BILLABLE" ? "Billable" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(
                        project.totalBudget || project.calculatedBudget,
                        project.currency
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {project._count.activities}
                        </span>
                        <span className="text-sm text-gray-500">
                          activities
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">
                        <div>Start: {formatDate(project.startDate)}</div>
                        <div>End: {formatDate(project.endDate)}</div>
                      </div>
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/projects/${project.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/projects/${project.id}/edit`
                              )
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the project "{project.code}
                                  " and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(project.id, project.code)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
