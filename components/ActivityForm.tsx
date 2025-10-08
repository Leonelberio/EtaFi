"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { activitySchema, type ActivityInput } from "@/lib/validations";
import { useUnsavedChanges } from "@/lib/contexts/unsaved-changes-context";
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
  Plus,
  Trash2,
} from "lucide-react";

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

interface SubActivity {
  id: string;
  code?: string;
  name: string;
  description: string;
  estimatedHours?: number;
  estimatedCost?: number;
  costType?: "FIXED" | "VARIABLE";
  costCategory?: "CONTRACTUAL" | "CLIENT_EXTRA" | "SUBCONTRACTOR_EXTRA";
  // Cost group budgets
  budgetM?: number;
  budgetS?: number;
  budgetD?: number;
  budgetE?: number;
  budgetMOD?: number;
  budgetMODHours?: number;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

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
    budgetMODHours?: number;
    actualMODHours?: number;
    costType?: "FIXED" | "VARIABLE";
    costCategory?: "CONTRACTUAL" | "CLIENT_EXTRA" | "SUBCONTRACTOR_EXTRA";
    isActive: boolean;
    createdBy?: {
      id: string;
      name: string;
      email: string;
    };
  };
  isEditing?: boolean;
}

export function ActivityForm({
  projectId,
  activity,
  isEditing = false,
}: ActivityFormProps) {
  const router = useRouter();
  const { setHasUnsavedChanges, hasUnsavedChanges } = useUnsavedChanges();
  const [isLoading, setIsLoading] = useState(false);
  const [useDetailedBudget, setUseDetailedBudget] = useState(false);
  const [useMultiGroups, setUseMultiGroups] = useState(false);
  const [chartAccounts, setChartAccounts] = useState<any[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [newSubActivity, setNewSubActivity] = useState<SubActivity>({
    id: "",
    name: "",
    description: "",
    estimatedHours: undefined,
    estimatedCost: undefined,
    costType: "FIXED",
    costCategory: "CONTRACTUAL",
    budgetM: 0,
    budgetS: 0,
    budgetD: 0,
    budgetE: 0,
    budgetMOD: 0,
    budgetMODHours: 0,
  });
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
      budgetMODHours: activity?.budgetMODHours || 0,
      actualMODHours: activity?.actualMODHours || 0,
      costType: activity?.costType || "FIXED",
      costCategory: activity?.costCategory || "CONTRACTUAL",
      isActive: activity?.isActive ?? true,
    },
  });

  // 🆕 Data loss prevention using global context
  const initialFormData = useRef<string>("");

  // Track form changes (including sub-activities)
  useEffect(() => {
    const subscription = form.watch((value) => {
      const currentData = JSON.stringify(value);
      if (initialFormData.current === "") {
        initialFormData.current = currentData;
      }
      const hasFormChanges = currentData !== initialFormData.current;
      setHasUnsavedChanges(hasFormChanges);
    });
    return () => subscription.unsubscribe();
  }, [form, setHasUnsavedChanges]);

  // Track sub-activities changes
  useEffect(() => {
    const initialSubs = (activity && (activity as any).subActivities) || [];
    const initialSubActivities = JSON.stringify(initialSubs);
    const currentSubActivities = JSON.stringify(subActivities);
    const hasSubActivityChanges = initialSubActivities !== currentSubActivities;

    if (hasSubActivityChanges) {
      setHasUnsavedChanges(true);
    }
  }, [subActivities, setHasUnsavedChanges]);

  // Handle navigation (now handled by global context)
  const handleNavigation = (path: string) => {
    router.push(path);
  };

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

          // Load existing sub-activities
          const activityResponse = await fetch(
            `/api/projects/${projectId}/activities/${activity.id}`
          );
          if (activityResponse.ok) {
            const activityData = await activityResponse.json();
            if (activityData.subActivities) {
              setSubActivities(
                activityData.subActivities.map((sub: any, index: number) => ({
                  id: sub.id,
                  code:
                    sub.code ||
                    `${activityData.code}-${String(index + 1).padStart(2, "0")}`,
                  name: sub.name,
                  description: sub.description || "",
                  estimatedHours: sub.estimatedHours || undefined,
                  estimatedCost: sub.budgetAmount || undefined,
                  costType: sub.costType || "FIXED",
                  costCategory: sub.costCategory || "CONTRACTUAL",
                  budgetM: sub.budgetM || 0,
                  budgetS: sub.budgetS || 0,
                  budgetD: sub.budgetD || 0,
                  budgetE: sub.budgetE || 0,
                  budgetMOD: sub.budgetMOD || 0,
                  budgetMODHours: sub.budgetMODHours || 0,
                  createdBy: sub.createdBy,
                }))
              );
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [activity?.id]);

  const addSubActivity = () => {
    if (newSubActivity.name.trim()) {
      const nextIndex = subActivities.length + 1;
      const activityCode = activity?.code || form.getValues("code");
      const code = activityCode
        ? `${activityCode}-${String(nextIndex).padStart(2, "0")}`
        : undefined;

      const subActivity: SubActivity = {
        ...newSubActivity,
        id: `sub-${Date.now()}`,
        code,
      };
      setSubActivities((prev) => [...prev, subActivity]);
      setNewSubActivity({
        id: "",
        name: "",
        description: "",
        estimatedHours: undefined,
        estimatedCost: undefined,
        costType: "FIXED",
        costCategory: "CONTRACTUAL",
        budgetM: 0,
        budgetS: 0,
        budgetD: 0,
        budgetE: 0,
        budgetMOD: 0,
        budgetMODHours: 0,
      });
    }
  };

  const removeSubActivity = (id: string) => {
    setSubActivities((prev) => {
      const filtered = prev.filter((sub) => sub.id !== id);
      const activityCode = activity?.code || form.getValues("code");
      return filtered.map((sub, index) => ({
        ...sub,
        code: activityCode
          ? `${activityCode}-${String(index + 1).padStart(2, "0")}`
          : undefined,
      }));
    });
  };

  // Validation: Calculate total sub-activity budgets
  const calculateSubActivityTotals = () => {
    return subActivities.reduce(
      (totals, sub) => ({
        total: totals.total + (sub.estimatedCost || 0),
        budgetM: totals.budgetM + (sub.budgetM || 0),
        budgetS: totals.budgetS + (sub.budgetS || 0),
        budgetD: totals.budgetD + (sub.budgetD || 0),
        budgetE: totals.budgetE + (sub.budgetE || 0),
        budgetMOD: totals.budgetMOD + (sub.budgetMOD || 0),
      }),
      { total: 0, budgetM: 0, budgetS: 0, budgetD: 0, budgetE: 0, budgetMOD: 0 }
    );
  };

  // Validation: Check if sub-activities budgets match activity budget
  const validateSubActivityBudgets = (): {
    isValid: boolean;
    message?: string;
  } => {
    if (subActivities.length === 0) {
      return { isValid: true };
    }

    const activityBudget = parseFloat(
      String(form.getValues("budgetAmount") || 0)
    );
    const activityBudgetM = parseFloat(String(form.getValues("budgetM") || 0));
    const activityBudgetS = parseFloat(String(form.getValues("budgetS") || 0));
    const activityBudgetD = parseFloat(String(form.getValues("budgetD") || 0));
    const activityBudgetE = parseFloat(String(form.getValues("budgetE") || 0));
    const activityBudgetMOD = parseFloat(
      String(form.getValues("budgetMOD") || 0)
    );

    const subTotals = calculateSubActivityTotals();

    // Check total budget
    if (Math.abs(subTotals.total - activityBudget) > 0.01) {
      return {
        isValid: false,
        message: `Le budget total des sous-activités (${subTotals.total.toFixed(2)} $) doit égaler le budget de l'activité (${activityBudget.toFixed(2)} $)`,
      };
    }

    // Check cost group budgets if using detailed budgets
    if (useDetailedBudget) {
      if (Math.abs(subTotals.budgetM - activityBudgetM) > 0.01) {
        return {
          isValid: false,
          message: `Le budget M des sous-activités (${subTotals.budgetM.toFixed(2)} $) doit égaler le budget M de l'activité (${activityBudgetM.toFixed(2)} $)`,
        };
      }
      if (Math.abs(subTotals.budgetS - activityBudgetS) > 0.01) {
        return {
          isValid: false,
          message: `Le budget S des sous-activités (${subTotals.budgetS.toFixed(2)} $) doit égaler le budget S de l'activité (${activityBudgetS.toFixed(2)} $)`,
        };
      }
      if (Math.abs(subTotals.budgetD - activityBudgetD) > 0.01) {
        return {
          isValid: false,
          message: `Le budget D des sous-activités (${subTotals.budgetD.toFixed(2)} $) doit égaler le budget D de l'activité (${activityBudgetD.toFixed(2)} $)`,
        };
      }
      if (Math.abs(subTotals.budgetE - activityBudgetE) > 0.01) {
        return {
          isValid: false,
          message: `Le budget E des sous-activités (${subTotals.budgetE.toFixed(2)} $) doit égaler le budget E de l'activité (${activityBudgetE.toFixed(2)} $)`,
        };
      }
      if (Math.abs(subTotals.budgetMOD - activityBudgetMOD) > 0.01) {
        return {
          isValid: false,
          message: `Le budget MOD des sous-activités (${subTotals.budgetMOD.toFixed(2)} $) doit égaler le budget MOD de l'activité (${activityBudgetMOD.toFixed(2)} $)`,
        };
      }
    }

    return { isValid: true };
  };

  const onSubmit = async (data: ActivityInput) => {
    try {
      // Validate sub-activity budgets before submitting
      const validation = validateSubActivityBudgets();
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }

      setIsLoading(true);

      const url = isEditing
        ? `/api/projects/${projectId}/activities/${activity?.id}`
        : `/api/projects/${projectId}/activities`;
      const method = isEditing ? "PUT" : "POST";

      // Include sub-activities in the request
      const requestData = {
        ...data,
        subActivities: subActivities.map((sub) => ({
          name: sub.name,
          description: sub.description,
          estimatedHours: sub.estimatedHours,
          estimatedCost: sub.estimatedCost,
          costType: sub.costType,
          costCategory: sub.costCategory,
          budgetM: sub.budgetM || 0,
          budgetS: sub.budgetS || 0,
          budgetD: sub.budgetD || 0,
          budgetE: sub.budgetE || 0,
          budgetMOD: sub.budgetMOD || 0,
          budgetMODHours: sub.budgetMODHours || 0,
        })),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
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

      // Reset unsaved changes state
      setHasUnsavedChanges(false);
      initialFormData.current = JSON.stringify(data);

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
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigation(`/dashboard/projects/${projectId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Activity" : "New Activity"}
              </h1>
              {hasUnsavedChanges && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 animate-pulse"
                >
                  ⚠️ Modifications non sauvegardées
                </Badge>
              )}
            </div>
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
            {activity?.createdBy && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600">
                  Créé par:{" "}
                  <span className="font-medium text-gray-900">
                    {activity.createdBy.name}
                  </span>
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
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
                      onCheckedChange={(checked) => {
                        setUseDetailedBudget(checked);
                        if (checked) {
                          setUseMultiGroups(false); // Deactivate Multi-Groups when Detailed Breakdown is activated
                        }
                      }}
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
                      onCheckedChange={(checked) => {
                        setUseMultiGroups(checked);
                        if (checked) {
                          setUseDetailedBudget(false); // Deactivate Detailed Breakdown when Multi-Groups is activated
                        }
                      }}
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
                    totalBudget={budgetAmount || 0}
                  />
                )}
              </div>

              {/* 🆕 MOD Hours & Cost Classification */}
              <Separator />

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Heures MOD & Classification des Coûts
                  </h3>

                  {/* MOD Hours Section */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-md font-medium text-gray-900">
                      Heures MOD
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budgetMODHours">
                          Heures MOD Budgétées
                        </Label>
                        <Input
                          id="budgetMODHours"
                          type="number"
                          step="0.5"
                          min="0"
                          {...form.register("budgetMODHours", {
                            valueAsNumber: true,
                          })}
                          placeholder="0.0"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">
                          Nombre d'heures de main-d'œuvre directe budgétées
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="actualMODHours">
                          Heures MOD Réelles
                        </Label>
                        <Input
                          id="actualMODHours"
                          type="number"
                          step="0.5"
                          min="0"
                          {...form.register("actualMODHours", {
                            valueAsNumber: true,
                          })}
                          placeholder="0.0"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">
                          Nombre d'heures de main-d'œuvre directe réellement
                          utilisées
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Type Section */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-md font-medium text-gray-900">
                      Type de Coût
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="costType">Classification du Coût</Label>
                      <Select
                        value={form.watch("costType")}
                        onValueChange={(value) =>
                          form.setValue(
                            "costType",
                            value as "FIXED" | "VARIABLE"
                          )
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type de coût" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED">Coût Fixe</SelectItem>
                          <SelectItem value="VARIABLE">
                            Coût Variable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Fixe: coût constant indépendant du volume | Variable:
                        coût qui varie avec le volume
                      </p>
                    </div>
                  </div>

                  {/* Cost Category Section */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Catégorie de Coût
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="costCategory">
                        Classification de la Catégorie
                      </Label>
                      <Select
                        value={form.watch("costCategory")}
                        onValueChange={(value) =>
                          form.setValue(
                            "costCategory",
                            value as
                              | "CONTRACTUAL"
                              | "CLIENT_EXTRA"
                              | "SUBCONTRACTOR_EXTRA"
                          )
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la catégorie de coût" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONTRACTUAL">
                            Coût Contractuel
                          </SelectItem>
                          <SelectItem value="CLIENT_EXTRA">
                            Coût Supplémentaire Rechargeable au Client
                          </SelectItem>
                          <SelectItem value="SUBCONTRACTOR_EXTRA">
                            Coût Supplémentaire Rechargeable à un Sous-traitant
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Contractuel: inclus dans le contrat | Supplémentaire
                        Client: facturable au client | Supplémentaire
                        Sous-traitant: facturable au sous-traitant
                      </p>
                    </div>
                  </div>
                </div>
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

              {/* Sub-Activities Section */}
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Sous-activités
                    </Label>
                    <p className="text-sm text-gray-600">
                      Ajoutez des sous-activités détaillées (optionnel)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subActivityName">
                      Nom de la sous-activité
                    </Label>
                    <Input
                      id="subActivityName"
                      placeholder="ex: Installation des prises"
                      value={newSubActivity.name}
                      onChange={(e) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subActivityHours">Heures estimées</Label>
                    <Input
                      id="subActivityHours"
                      type="number"
                      placeholder="0"
                      value={newSubActivity.estimatedHours ?? ""}
                      onChange={(e) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          estimatedHours:
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subActivityDescription">Description</Label>
                    <Input
                      id="subActivityDescription"
                      placeholder="Description de la sous-activité"
                      value={newSubActivity.description}
                      onChange={(e) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subActivityCost">Coût estimé</Label>
                    <Input
                      id="subActivityCost"
                      type="number"
                      placeholder="0.00"
                      value={newSubActivity.estimatedCost ?? ""}
                      onChange={(e) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          estimatedCost:
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Cost Type and Category for Sub-Activities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subActivityCostType">Type de Coût</Label>
                    <Select
                      value={newSubActivity.costType || "FIXED"}
                      onValueChange={(value) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          costType: value as "FIXED" | "VARIABLE",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Coût Fixe</SelectItem>
                        <SelectItem value="VARIABLE">Coût Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subActivityCostCategory">
                      Catégorie de Coût
                    </Label>
                    <Select
                      value={newSubActivity.costCategory || "CONTRACTUAL"}
                      onValueChange={(value) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          costCategory: value as
                            | "CONTRACTUAL"
                            | "CLIENT_EXTRA"
                            | "SUBCONTRACTOR_EXTRA",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONTRACTUAL">Contractuel</SelectItem>
                        <SelectItem value="CLIENT_EXTRA">
                          Supplémentaire Rechargeable Client
                        </SelectItem>
                        <SelectItem value="SUBCONTRACTOR_EXTRA">
                          Coût Supp. Rechargeable Sous-traitant
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cost Group Budgets for Sub-Activity */}
                {useDetailedBudget && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Budgets par Groupe de Coûts
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="subBudgetM" className="text-xs">
                          Groupe M ($)
                        </Label>
                        <Input
                          id="subBudgetM"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newSubActivity.budgetM || ""}
                          onChange={(e) =>
                            setNewSubActivity((prev) => ({
                              ...prev,
                              budgetM:
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subBudgetS" className="text-xs">
                          Groupe S ($)
                        </Label>
                        <Input
                          id="subBudgetS"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newSubActivity.budgetS || ""}
                          onChange={(e) =>
                            setNewSubActivity((prev) => ({
                              ...prev,
                              budgetS:
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subBudgetD" className="text-xs">
                          Groupe D ($)
                        </Label>
                        <Input
                          id="subBudgetD"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newSubActivity.budgetD || ""}
                          onChange={(e) =>
                            setNewSubActivity((prev) => ({
                              ...prev,
                              budgetD:
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subBudgetE" className="text-xs">
                          Groupe E ($)
                        </Label>
                        <Input
                          id="subBudgetE"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newSubActivity.budgetE || ""}
                          onChange={(e) =>
                            setNewSubActivity((prev) => ({
                              ...prev,
                              budgetE:
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subBudgetMOD" className="text-xs">
                          Groupe MOD ($)
                        </Label>
                        <Input
                          id="subBudgetMOD"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newSubActivity.budgetMOD || ""}
                          onChange={(e) =>
                            setNewSubActivity((prev) => ({
                              ...prev,
                              budgetMOD:
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xs text-amber-600">
                      ⚠️ La somme des budgets de groupes des sous-activités doit
                      égaler les budgets de groupes de l'activité
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSubActivity}
                  disabled={!newSubActivity.name.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter la sous-activité
                </Button>

                {subActivities.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sous-activités ajoutées</Label>
                    <div className="space-y-2">
                      {subActivities.map((subActivity) => (
                        <div
                          key={subActivity.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {subActivity.code ? (
                                <span className="text-gray-500 mr-2">
                                  {subActivity.code}
                                </span>
                              ) : null}
                              {subActivity.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {subActivity.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subActivity.estimatedHours
                                ? `${subActivity.estimatedHours}h`
                                : "Pas d'heures"}{" "}
                              -{" "}
                              {subActivity.estimatedCost
                                ? new Intl.NumberFormat("fr-CA", {
                                    style: "currency",
                                    currency: "CAD",
                                  }).format(subActivity.estimatedCost)
                                : "Pas de coût"}
                            </p>
                            {useDetailedBudget && (
                              <div className="flex gap-1 mt-1 text-xs text-gray-500">
                                {subActivity.budgetM ? (
                                  <span className="bg-blue-50 px-2 py-0.5 rounded">
                                    M: {subActivity.budgetM}$
                                  </span>
                                ) : null}
                                {subActivity.budgetS ? (
                                  <span className="bg-purple-50 px-2 py-0.5 rounded">
                                    S: {subActivity.budgetS}$
                                  </span>
                                ) : null}
                                {subActivity.budgetD ? (
                                  <span className="bg-amber-50 px-2 py-0.5 rounded">
                                    D: {subActivity.budgetD}$
                                  </span>
                                ) : null}
                                {subActivity.budgetE ? (
                                  <span className="bg-green-50 px-2 py-0.5 rounded">
                                    E: {subActivity.budgetE}$
                                  </span>
                                ) : null}
                                {subActivity.budgetMOD ? (
                                  <span className="bg-red-50 px-2 py-0.5 rounded">
                                    MOD: {subActivity.budgetMOD}$
                                  </span>
                                ) : null}
                              </div>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {subActivity.costType === "FIXED"
                                  ? "Coût Fixe"
                                  : "Coût Variable"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {subActivity.costCategory === "CONTRACTUAL"
                                  ? "Contractuel"
                                  : subActivity.costCategory === "CLIENT_EXTRA"
                                    ? "Supp. Client"
                                    : "Supp. Sous-traitant"}
                              </Badge>
                            </div>
                            {subActivity.createdBy && (
                              <p className="text-xs text-gray-500 mt-1">
                                Créé par: {subActivity.createdBy.name}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSubActivity(subActivity.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Budget Summary */}
                    {useDetailedBudget && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                          Résumé des Budgets
                        </h4>
                        {(() => {
                          const subTotals = calculateSubActivityTotals();
                          const activityBudget = parseFloat(
                            String(form.getValues("budgetAmount") || 0)
                          );
                          const activityBudgetM = parseFloat(
                            String(form.getValues("budgetM") || 0)
                          );
                          const activityBudgetS = parseFloat(
                            String(form.getValues("budgetS") || 0)
                          );
                          const activityBudgetD = parseFloat(
                            String(form.getValues("budgetD") || 0)
                          );
                          const activityBudgetE = parseFloat(
                            String(form.getValues("budgetE") || 0)
                          );
                          const activityBudgetMOD = parseFloat(
                            String(form.getValues("budgetMOD") || 0)
                          );

                          const budgetMatches =
                            Math.abs(subTotals.total - activityBudget) < 0.01;
                          const mMatches =
                            Math.abs(subTotals.budgetM - activityBudgetM) <
                            0.01;
                          const sMatches =
                            Math.abs(subTotals.budgetS - activityBudgetS) <
                            0.01;
                          const dMatches =
                            Math.abs(subTotals.budgetD - activityBudgetD) <
                            0.01;
                          const eMatches =
                            Math.abs(subTotals.budgetE - activityBudgetE) <
                            0.01;
                          const modMatches =
                            Math.abs(subTotals.budgetMOD - activityBudgetMOD) <
                            0.01;

                          return (
                            <div className="space-y-2 text-sm">
                              <div
                                className={`flex justify-between ${budgetMatches ? "text-green-700" : "text-red-700 font-semibold"}`}
                              >
                                <span>Budget Total:</span>
                                <span>
                                  {subTotals.total.toFixed(2)}$ /{" "}
                                  {activityBudget.toFixed(2)}${" "}
                                  {budgetMatches ? "✓" : "✗"}
                                </span>
                              </div>
                              <div
                                className={`flex justify-between ${mMatches ? "text-green-700" : "text-red-700"}`}
                              >
                                <span>Groupe M:</span>
                                <span>
                                  {subTotals.budgetM.toFixed(2)}$ /{" "}
                                  {activityBudgetM.toFixed(2)}${" "}
                                  {mMatches ? "✓" : "✗"}
                                </span>
                              </div>
                              <div
                                className={`flex justify-between ${sMatches ? "text-green-700" : "text-red-700"}`}
                              >
                                <span>Groupe S:</span>
                                <span>
                                  {subTotals.budgetS.toFixed(2)}$ /{" "}
                                  {activityBudgetS.toFixed(2)}${" "}
                                  {sMatches ? "✓" : "✗"}
                                </span>
                              </div>
                              <div
                                className={`flex justify-between ${dMatches ? "text-green-700" : "text-red-700"}`}
                              >
                                <span>Groupe D:</span>
                                <span>
                                  {subTotals.budgetD.toFixed(2)}$ /{" "}
                                  {activityBudgetD.toFixed(2)}${" "}
                                  {dMatches ? "✓" : "✗"}
                                </span>
                              </div>
                              <div
                                className={`flex justify-between ${eMatches ? "text-green-700" : "text-red-700"}`}
                              >
                                <span>Groupe E:</span>
                                <span>
                                  {subTotals.budgetE.toFixed(2)}$ /{" "}
                                  {activityBudgetE.toFixed(2)}${" "}
                                  {eMatches ? "✓" : "✗"}
                                </span>
                              </div>
                              <div
                                className={`flex justify-between ${modMatches ? "text-green-700" : "text-red-700"}`}
                              >
                                <span>Groupe MOD:</span>
                                <span>
                                  {subTotals.budgetMOD.toFixed(2)}$ /{" "}
                                  {activityBudgetMOD.toFixed(2)}${" "}
                                  {modMatches ? "✓" : "✗"}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
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
