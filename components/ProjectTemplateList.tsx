"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Building2,
  Users,
  DollarSign,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";
import { ApplyTemplateModal } from "@/components/ApplyTemplateModal";

interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  industry?: string;
  totalBudget?: number;
  currency: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  templateActivities: Array<{
    id: string;
    code: string;
    name: string;
    budgetAmount?: number;
    templateSubActivities: Array<{
      id: string;
      code: string;
      name: string;
    }>;
  }>;
  createdBy?: {
    id: string;
    name?: string;
    email?: string;
  };
  _count: {
    templateActivities: number;
  };
}

interface ProjectTemplateListProps {
  onEdit?: (template: ProjectTemplate) => void;
  onDelete?: (templateId: string) => void;
  onApply?: (template: ProjectTemplate) => void;
}

export default function ProjectTemplateList({
  onEdit,
  onDelete,
  onApply,
}: ProjectTemplateListProps) {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [managers, setManagers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);

  const categories = [
    "Construction",
    "Renovation",
    "Maintenance",
    "Development",
    "Consulting",
  ];
  const industries = [
    "Residential",
    "Commercial",
    "Industrial",
    "Infrastructure",
    "Services",
  ];

  useEffect(() => {
    fetchTemplates();
    fetchClients();
    fetchManagers();
  }, [categoryFilter, industryFilter, statusFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (industryFilter !== "all") params.append("industry", industryFilter);
      if (statusFilter !== "all")
        params.append("isActive", statusFilter === "active" ? "true" : "false");

      const response = await fetch(
        `/api/project-templates?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setClients(data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        // Extract managers from organization members
        const managers =
          data.organizations?.flatMap(
            (org: any) =>
              org.members?.map((member: any) => ({
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
              })) || []
          ) || [];
        setManagers(managers);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleApplyTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setIsApplyModalOpen(true);
  };

  const handleTemplateApplied = (project: any) => {
    // Call the original onApply if provided
    if (onApply) {
      onApply(selectedTemplate!);
    }
    // Optionally refresh the templates list
    fetchTemplates();
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/project-templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTemplates(templates.filter((t) => t.id !== templateId));
        onDelete?.(templateId);
      } else {
        console.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Project Templates</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Templates</h2>
          <p className="text-muted-foreground">
            Reusable project structures with predefined activities and budgets
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/project-templates/new">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ||
              categoryFilter !== "all" ||
              industryFilter !== "all" ||
              statusFilter !== "all"
                ? "Try adjusting your filters to see more templates."
                : "Create your first project template to get started."}
            </p>
            {!searchTerm &&
              categoryFilter === "all" &&
              industryFilter === "all" &&
              statusFilter === "all" && (
                <Button asChild>
                  <Link href="/dashboard/project-templates/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Link>
                </Button>
              )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    {template.isPublic && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                    <Badge
                      variant={template.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Categories */}
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{template._count.templateActivities} activities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>
                      {formatCurrency(template.totalBudget, template.currency)}
                    </span>
                  </div>
                </div>

                {/* Created by */}
                {template.createdBy && (
                  <div className="text-sm text-muted-foreground">
                    Created by{" "}
                    {template.createdBy.name || template.createdBy.email}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/project-templates/${template.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {onApply && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApplyTemplate(template)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Apply
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Apply Template Modal */}
      <ApplyTemplateModal
        template={selectedTemplate}
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSuccess={handleTemplateApplied}
        clients={clients}
        managers={managers}
      />
    </div>
  );
}
