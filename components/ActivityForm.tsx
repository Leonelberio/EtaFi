"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { activitySchema, type ActivityInput } from "@/lib/validations";
import { MultiGroupSelector } from "@/components/MultiGroupSelector";
import {
  ArrowLeft,
  Calculator,
  Package,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Target,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Cost group definitions with icons and colors
const COST_GROUPS = [
  {
    key: "budgetM" as const,
    code: "M",
    name: "Matériel & Fournitures",
    icon: Package,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Raw materials, supplies, components",
  },
  {
    key: "budgetS" as const,
    code: "S",
    name: "Sous-traitance & Services",
    icon: Users,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Subcontracting, external services",
  },
  {
    key: "budgetD" as const,
    code: "D",
    name: "Frais généraux & Divers",
    icon: FileText,
    color: "bg-amber-100 text-amber-800 border-amber-200",
    description: "General expenses, miscellaneous costs",
  },
  {
    key: "budgetE" as const,
    code: "E",
    name: "Équipement & Immobilisations",
    icon: Wrench,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Equipment, fixed assets",
  },
  {
    key: "budgetMOD" as const,
    code: "MOD",
    name: "Main-d'œuvre & Charges",
    icon: Users,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Labor, social charges",
  },
] as const;

interface ActivityFormProps {
  projectId: string;
  activity?: {
    id: string;
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
  };
  isEditing?: boolean;
}

export function ActivityForm({
  projectId,
  activity,
  isEditing = false,
}: ActivityFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [useDetailedBudget, setUseDetailedBudget] = useState(false);
  const [useMultiGroups, setUseMultiGroups] = useState(false);
  const [chartAccounts, setChartAccounts] = useState<any[]>([]);
  const [costGroups, setCostGroups] = useState<any[]>([]);

  const form = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      code: activity?.code || "",
      name: activity?.name || "",
      description: activity?.description || "",
      budgetAmount: activity?.budgetAmount || 0,
      budgetM: activity?.budgetM || 0,
      budgetS: activity?.budgetS || 0,
      budgetD: activity?.budgetD || 0,
      budgetE: activity?.budgetE || 0,
      budgetMOD: activity?.budgetMOD || 0,
      isActive: activity?.isActive ?? true,
      sortOrder: activity?.sortOrder || 0,
    },
  });

  // Watch budget values for calculations
  const budgetAmount = form.watch("budgetAmount");
  const budgetM = form.watch("budgetM");
  const budgetS = form.watch("budgetS");
  const budgetD = form.watch("budgetD");
  const budgetE = form.watch("budgetE");
  const budgetMOD = form.watch("budgetMOD");

  // Calculate total from breakdown
  const totalFromBreakdown =
    (budgetM || 0) +
    (budgetS || 0) +
    (budgetD || 0) +
    (budgetE || 0) +
    (budgetMOD || 0);

  // Set detailed budget mode if any breakdown values exist
  useEffect(() => {
    if (
      activity &&
      (activity.budgetM ||
        activity.budgetS ||
        activity.budgetD ||
        activity.budgetE ||
        activity.budgetMOD)
    ) {
      setUseDetailedBudget(true);
    }
  }, [activity]);

  // Sync total budget when using detailed breakdown
  useEffect(() => {
    if (useDetailedBudget && totalFromBreakdown !== budgetAmount) {
      form.setValue("budgetAmount", totalFromBreakdown);
    }
  }, [useDetailedBudget, totalFromBreakdown, budgetAmount, form]);

  // Load chart accounts and existing cost groups
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load chart accounts
        const accountsResponse = await fetch(`/api/chart-accounts`);
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          setChartAccounts(accountsData.accounts || []);
        } else {
          console.error(
            "Failed to load chart accounts:",
            accountsResponse.status
          );
        }

        // Load existing cost groups if editing
        if (activity?.id) {
          const groupsResponse = await fetch(
            `/api/activities/${activity.id}/cost-groups`
          );
          if (groupsResponse.ok) {
            const groupsData = await groupsResponse.json();
            setCostGroups(groupsData.costGroups || []);
            setUseMultiGroups(groupsData.costGroups?.length > 0);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [activity?.id]);

  const onSubmit = async (data: ActivityInput) => {
    try {
      setIsLoading(true);

      const url = isEditing
        ? `/api/projects/${projectId}/activities/${activity?.id}`
        : `/api/projects/${projectId}/activities`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} activity`
        );
      }

      toast.success(
        isEditing
          ? "Activity updated successfully!"
          : "Activity created successfully!"
      );

      // Navigate back to activities list
      router.push(`/dashboard/projects/${projectId}/activities`);
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} activity:`,
        error
      );
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} activity`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Activity" : "New Activity"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Update activity details"
                : "Create a new project activity"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Details</CardTitle>
            <CardDescription>
              Configure the activity with budget breakdown by cost groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Activity Code *</Label>
                  <Input
                    id="code"
                    {...form.register("code")}
                    placeholder="01010, 01135, 01220"
                    disabled={isLoading}
                  />
                  {form.formState.errors.code && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.code.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Unique code within project (e.g., 01010 for Foundation)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    {...form.register("sortOrder", { valueAsNumber: true })}
                    placeholder="0"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Display order in project (0 = first)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Activity Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Foundation Work, Structural Steel, Electrical Installation"
                  disabled={isLoading}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Detailed description of the activity scope and deliverables..."
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Budget Configuration */}
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      Budget Configuration
                    </h3>
                    <p className="text-sm text-gray-600">
                      Configure activity budget using 5-group cost breakdown
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="detailed-budget" className="text-sm">
                      Detailed Breakdown
                    </Label>
                    <Switch
                      id="detailed-budget"
                      checked={useDetailedBudget}
                      onCheckedChange={setUseDetailedBudget}
                    />
                  </div>
                </div>

                {!useDetailedBudget ? (
                  // Simple budget input
                  <div className="space-y-2">
                    <Label htmlFor="budgetAmount">Total Budget (CAD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="budgetAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register("budgetAmount", {
                          valueAsNumber: true,
                        })}
                        placeholder="0.00"
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                  </div>
                ) : (
                  // Detailed budget breakdown
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COST_GROUPS.map((group) => {
                        const Icon = group.icon;
                        return (
                          <div key={group.key} className="space-y-2">
                            <Label
                              htmlFor={group.key}
                              className="flex items-center gap-2"
                            >
                              <Icon className="h-4 w-4" />
                              {group.code} - {group.name}
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id={group.key}
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register(group.key, {
                                  valueAsNumber: true,
                                })}
                                placeholder="0.00"
                                disabled={isLoading}
                                className="pl-10"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              {group.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Display */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Budget:</span>
                        <span className="text-lg font-bold text-green-600">
                          $
                          {totalFromBreakdown.toLocaleString("en-CA", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          CAD
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 🆕 Multi-Group Cost Management */}
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      Gestion Multi-Groupes
                    </h3>
                    <p className="text-sm text-gray-600">
                      Assignez des pourcentages spécifiques aux groupes de coûts
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="multi-groups" className="text-sm">
                      Groupes Multiples
                    </Label>
                    <Switch
                      id="multi-groups"
                      checked={useMultiGroups}
                      onCheckedChange={setUseMultiGroups}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {useMultiGroups && (
                  <MultiGroupSelector
                    projectId={projectId}
                    activityId={activity?.id}
                    initialGroups={costGroups}
                    chartAccounts={chartAccounts}
                    onGroupsChange={setCostGroups}
                    disabled={isLoading}
                  />
                )}
              </div>

              {/* Activity Options */}
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-gray-500">
                    Whether this activity is available for cost allocation
                  </p>
                </div>
                <Switch
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) =>
                    form.setValue("isActive", checked)
                  }
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>{isEditing ? "Updating..." : "Creating..."}</>
                  ) : (
                    <>{isEditing ? "Update Activity" : "Create Activity"}</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Budget Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Budget Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {useDetailedBudget ? (
              <>
                <div className="space-y-3">
                  {COST_GROUPS.map((group) => {
                    const value = form.watch(group.key) || 0;
                    const percentage =
                      totalFromBreakdown > 0
                        ? (value / totalFromBreakdown) * 100
                        : 0;

                    return (
                      <div key={group.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={group.color}>
                            {group.code}
                          </Badge>
                          <span className="text-sm font-medium">
                            ${value.toLocaleString("en-CA")}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600">
                          {percentage.toFixed(1)}% of total budget
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Enable detailed breakdown to see budget distribution
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
