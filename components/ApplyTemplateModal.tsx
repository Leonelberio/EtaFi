"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

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

interface ApplyTemplateModalProps {
  template: ProjectTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
  clients: Array<{ id: string; name: string }>;
  managers: Array<{ id: string; name: string; email: string }>;
}

export function ApplyTemplateModal({
  template,
  isOpen,
  onClose,
  onSuccess,
  clients,
  managers,
}: ApplyTemplateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectCode: "",
    projectName: "",
    projectDescription: "",
    clientId: "",
    managerId: "",
    tempManagerId: "",
    tempManagerEnd: "",
    startDate: "",
    endDate: "",
    totalBudget: "",
    currency: "CAD",
    kind: "BILLABLE",
    status: "ACTIVE",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/project-templates/${template.id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            totalBudget: formData.totalBudget
              ? parseFloat(formData.totalBudget)
              : null,
            tempManagerEnd: formData.tempManagerEnd || null,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            clientId: formData.clientId || null,
            managerId: formData.managerId || null,
            tempManagerId: formData.tempManagerId || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create project from template");
      }

      const result = await response.json();
      toast.success(result.message);
      onSuccess(result.project);
      onClose();

      // Reset form
      setFormData({
        projectCode: "",
        projectName: "",
        projectDescription: "",
        clientId: "",
        managerId: "",
        tempManagerId: "",
        tempManagerEnd: "",
        startDate: "",
        endDate: "",
        totalBudget: "",
        currency: "CAD",
        kind: "BILLABLE",
        status: "ACTIVE",
      });
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Failed to create project from template");
    } finally {
      setIsLoading(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Project from Template</DialogTitle>
          <DialogDescription>
            Create a new project using the template "{template.name}".
            {template.description && ` ${template.description}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectCode">Project Code *</Label>
              <Input
                id="projectCode"
                value={formData.projectCode}
                onChange={(e) =>
                  handleInputChange("projectCode", e.target.value)
                }
                placeholder="e.g., PROJ-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) =>
                  handleInputChange("projectName", e.target.value)
                }
                placeholder="Enter project name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">Description</Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription}
              onChange={(e) =>
                handleInputChange("projectDescription", e.target.value)
              }
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => handleInputChange("clientId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerId">Project Manager</Label>
              <Select
                value={formData.managerId}
                onValueChange={(value) => handleInputChange("managerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No manager</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget</Label>
              <Input
                id="totalBudget"
                type="number"
                step="0.01"
                value={formData.totalBudget}
                onChange={(e) =>
                  handleInputChange("totalBudget", e.target.value)
                }
                placeholder={template.totalBudget?.toString() || "0.00"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kind">Project Type</Label>
              <Select
                value={formData.kind}
                onValueChange={(value) => handleInputChange("kind", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BILLABLE">Billable</SelectItem>
                  <SelectItem value="NON_BILLABLE">Non-Billable</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
