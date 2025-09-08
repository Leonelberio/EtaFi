"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Building2,
  DollarSign,
  Users,
  Settings,
} from "lucide-react";
import { ProjectTemplateInput } from "@/lib/validations";

interface TemplateActivity {
  code: string;
  name: string;
  description?: string;
  budgetAmount?: number;
  budgetM?: number;
  budgetS?: number;
  budgetD?: number;
  budgetE?: number;
  budgetMOD?: number;
  isActive: boolean;
  sortOrder: number;
  subActivities?: TemplateSubActivity[];
}

interface TemplateSubActivity {
  code: string;
  name: string;
  description?: string;
  budgetAmount?: number;
  budgetM?: number;
  budgetS?: number;
  budgetD?: number;
  budgetE?: number;
  budgetMOD?: number;
  isActive: boolean;
  sortOrder: number;
}

interface ProjectTemplateFormProps {
  template?: any; // Existing template for editing
  onSave?: (template: ProjectTemplateInput) => void;
  onCancel?: () => void;
}

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

export default function ProjectTemplateForm({
  template,
  onSave,
  onCancel,
}: ProjectTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDetailedBudget, setShowDetailedBudget] = useState(false);

  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    category: template?.category || "",
    industry: template?.industry || "",
    totalBudget: template?.totalBudget || "",
    currency: template?.currency || "CAD",
    isPublic: template?.isPublic || false,
    isActive: template?.isActive !== false,
  });

  const [activities, setActivities] = useState<TemplateActivity[]>(
    template?.templateActivities?.map((activity: any) => ({
      code: activity.code,
      name: activity.name,
      description: activity.description,
      budgetAmount: activity.budgetAmount,
      budgetM: activity.budgetM,
      budgetS: activity.budgetS,
      budgetD: activity.budgetD,
      budgetE: activity.budgetE,
      budgetMOD: activity.budgetMOD,
      isActive: activity.isActive,
      sortOrder: activity.sortOrder,
      subActivities:
        activity.templateSubActivities?.map((sub: any) => ({
          code: sub.code,
          name: sub.name,
          description: sub.description,
          budgetAmount: sub.budgetAmount,
          budgetM: sub.budgetM,
          budgetS: sub.budgetS,
          budgetD: sub.budgetD,
          budgetE: sub.budgetE,
          budgetMOD: sub.budgetMOD,
          isActive: sub.isActive,
          sortOrder: sub.sortOrder,
        })) || [],
    })) || []
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addActivity = () => {
    const newActivity: TemplateActivity = {
      code: "",
      name: "",
      description: "",
      budgetAmount: 0,
      budgetM: 0,
      budgetS: 0,
      budgetD: 0,
      budgetE: 0,
      budgetMOD: 0,
      isActive: true,
      sortOrder: activities.length,
      subActivities: [],
    };
    setActivities([...activities, newActivity]);
  };

  const updateActivity = (index: number, field: string, value: any) => {
    const updatedActivities = [...activities];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    setActivities(updatedActivities);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const addSubActivity = (activityIndex: number) => {
    const updatedActivities = [...activities];
    const activity = updatedActivities[activityIndex];
    const newSubActivity: TemplateSubActivity = {
      code: "",
      name: "",
      description: "",
      budgetAmount: 0,
      budgetM: 0,
      budgetS: 0,
      budgetD: 0,
      budgetE: 0,
      budgetMOD: 0,
      isActive: true,
      sortOrder: activity.subActivities?.length || 0,
    };
    activity.subActivities = [
      ...(activity.subActivities || []),
      newSubActivity,
    ];
    setActivities(updatedActivities);
  };

  const updateSubActivity = (
    activityIndex: number,
    subIndex: number,
    field: string,
    value: any
  ) => {
    const updatedActivities = [...activities];
    const subActivities = updatedActivities[activityIndex].subActivities || [];
    subActivities[subIndex] = { ...subActivities[subIndex], [field]: value };
    updatedActivities[activityIndex].subActivities = subActivities;
    setActivities(updatedActivities);
  };

  const removeSubActivity = (activityIndex: number, subIndex: number) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].subActivities =
      updatedActivities[activityIndex].subActivities?.filter(
        (_, i) => i !== subIndex
      ) || [];
    setActivities(updatedActivities);
  };

  const calculateTotalBudget = () => {
    return activities.reduce((total, activity) => {
      return total + (activity.budgetAmount || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const templateData: ProjectTemplateInput = {
        ...formData,
        totalBudget: formData.totalBudget
          ? parseFloat(formData.totalBudget.toString())
          : calculateTotalBudget(),
        activities: activities.map((activity) => ({
          ...activity,
          budgetAmount: activity.budgetAmount || 0,
          budgetM: activity.budgetM || 0,
          budgetS: activity.budgetS || 0,
          budgetD: activity.budgetD || 0,
          budgetE: activity.budgetE || 0,
          budgetMOD: activity.budgetMOD || 0,
          subActivities:
            activity.subActivities?.map((sub) => ({
              ...sub,
              budgetAmount: sub.budgetAmount || 0,
              budgetM: sub.budgetM || 0,
              budgetS: sub.budgetS || 0,
              budgetD: sub.budgetD || 0,
              budgetE: sub.budgetE || 0,
              budgetMOD: sub.budgetMOD || 0,
            })) || [],
        })),
      };

      if (onSave) {
        onSave(templateData);
      } else {
        const url = template
          ? `/api/project-templates/${template.id}`
          : "/api/project-templates";
        const method = template ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(templateData),
        });

        if (response.ok) {
          router.push("/dashboard/project-templates");
        } else {
          console.error("Failed to save template");
        }
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {template ? "Edit Template" : "Create Template"}
            </h1>
            <p className="text-muted-foreground">
              {template
                ? "Update your project template"
                : "Create a reusable project template with predefined activities"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>
              Define the basic properties of your project template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Residential Construction Template"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe what this template is used for..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    handleInputChange("industry", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
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
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    handleInputChange("isPublic", checked)
                  }
                />
                <Label htmlFor="isPublic">Make this template public</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Template Activities</span>
                </CardTitle>
                <CardDescription>
                  Define the activities and sub-activities for this template
                </CardDescription>
              </div>
              <Button type="button" onClick={addActivity} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>
                  No activities defined yet. Add your first activity to get
                  started.
                </p>
              </div>
            ) : (
              activities.map((activity, activityIndex) => (
                <Card
                  key={activityIndex}
                  className="border-l-4 border-l-blue-500"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          Activity {activityIndex + 1}
                        </Badge>
                        <span className="font-medium">
                          {activity.name || "Untitled Activity"}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActivity(activityIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Activity Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Activity Code *</Label>
                        <Input
                          value={activity.code}
                          onChange={(e) =>
                            updateActivity(
                              activityIndex,
                              "code",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 01010"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Activity Name *</Label>
                        <Input
                          value={activity.name}
                          onChange={(e) =>
                            updateActivity(
                              activityIndex,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Excavation and Foundations"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={activity.description || ""}
                        onChange={(e) =>
                          updateActivity(
                            activityIndex,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe this activity..."
                        rows={2}
                      />
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Budget</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={showDetailedBudget}
                            onCheckedChange={setShowDetailedBudget}
                          />
                          <Label className="text-sm">
                            Detailed Budget (5-Group)
                          </Label>
                        </div>
                      </div>

                      {showDetailedBudget ? (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Total</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={activity.budgetAmount || ""}
                              onChange={(e) =>
                                updateActivity(
                                  activityIndex,
                                  "budgetAmount",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-blue-600">
                              M (Matériel)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={activity.budgetM || ""}
                              onChange={(e) =>
                                updateActivity(
                                  activityIndex,
                                  "budgetM",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-purple-600">
                              S (Sous-traitance)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={activity.budgetS || ""}
                              onChange={(e) =>
                                updateActivity(
                                  activityIndex,
                                  "budgetS",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-amber-600">
                              D (Divers)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={activity.budgetD || ""}
                              onChange={(e) =>
                                updateActivity(
                                  activityIndex,
                                  "budgetD",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-green-600">
                              E (Équipement)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={activity.budgetE || ""}
                              onChange={(e) =>
                                updateActivity(
                                  activityIndex,
                                  "budgetE",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-red-600">
                              MOD (Main-d'œuvre)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={activity.budgetMOD || ""}
                              onChange={(e) =>
                                updateActivity(
                                  activityIndex,
                                  "budgetMOD",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={activity.budgetAmount || ""}
                            onChange={(e) =>
                              updateActivity(
                                activityIndex,
                                "budgetAmount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Total budget amount"
                          />
                        </div>
                      )}
                    </div>

                    {/* Sub-Activities */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Sub-Activities
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSubActivity(activityIndex)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Sub-Activity
                        </Button>
                      </div>

                      {activity.subActivities?.map((subActivity, subIndex) => (
                        <Card key={subIndex} className="bg-gray-50">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="secondary">
                                Sub-Activity {subIndex + 1}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeSubActivity(activityIndex, subIndex)
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm">
                                  Sub-Activity Code
                                </Label>
                                <Input
                                  value={subActivity.code}
                                  onChange={(e) =>
                                    updateSubActivity(
                                      activityIndex,
                                      subIndex,
                                      "code",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., 01010-01"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">
                                  Sub-Activity Name
                                </Label>
                                <Input
                                  value={subActivity.name}
                                  onChange={(e) =>
                                    updateSubActivity(
                                      activityIndex,
                                      subIndex,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., Excavation"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )) || []}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading
              ? "Saving..."
              : template
                ? "Update Template"
                : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  );
}
