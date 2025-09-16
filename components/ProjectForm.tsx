"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, ArrowLeft } from "lucide-react";

// Form validation schema
const projectSchema = z.object({
  code: z
    .string()
    .min(3, "Project code must be at least 3 characters")
    .max(20, "Project code must be at most 20 characters")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Project code must contain only uppercase letters, numbers, underscore, and dash"
    ),
  name: z.string().min(2, "Project name is required").max(100),
  description: z.string().min(1, "Description is required"),
  executionAddress: z.string().optional(),
  projectDomain: z.string().min(1, "Project domain is required"),
  clientId: z.string().optional(),
  managerId: z.string().optional(),
  tempManagerId: z.string().optional(),
  tempManagerEnd: z.string().optional(),
  kind: z.enum(["ADMIN", "BILLABLE"]),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  totalBudget: z.number().positive().optional(),
  totalBudgetCosting: z.number().positive().optional(),
  totalBudgetSelling: z.number().positive().optional(),
  initialProfitDollars: z.number().optional(),
  initialProfitPercent: z.number().min(0).max(100).optional(),
  currency: z.string().default("CAD"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: {
    id: string;
    code: string;
    name: string;
    description?: string;
    executionAddress?: string;
    projectDomain?: string;
    clientId?: string;
    managerId?: string;
    tempManagerId?: string;
    tempManagerEnd?: string;
    kind: "ADMIN" | "BILLABLE";
    status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
    totalBudget?: number;
    totalBudgetCosting?: number;
    totalBudgetSelling?: number;
    initialProfitDollars?: number;
    initialProfitPercent?: number;
    currency: string;
    startDate?: string;
    endDate?: string;
  };
  clients: Array<{ id: string; name: string; email?: string }>;
  managers: Array<{ id: string; name: string; email: string }>;
  isEditing?: boolean;
}

export function ProjectForm({
  project,
  clients = [],
  managers = [],
  isEditing = false,
}: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      code: project?.code || "",
      name: project?.name || "",
      description: project?.description || "",
      executionAddress: project?.executionAddress || "",
      projectDomain: project?.projectDomain || "",
      clientId: project?.clientId || "",
      managerId: project?.managerId || "",
      tempManagerId: project?.tempManagerId || "",
      tempManagerEnd: project?.tempManagerEnd
        ? new Date(project.tempManagerEnd).toISOString().split("T")[0]
        : "",
      kind: project?.kind || "BILLABLE",
      status: project?.status || "ACTIVE",
      totalBudget: project?.totalBudget || undefined,
      totalBudgetCosting: project?.totalBudgetCosting || undefined,
      totalBudgetSelling: project?.totalBudgetSelling || undefined,
      initialProfitDollars: project?.initialProfitDollars || undefined,
      initialProfitPercent: project?.initialProfitPercent || undefined,
      currency: project?.currency || "CAD",
      startDate: project?.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      endDate: project?.endDate
        ? new Date(project.endDate).toISOString().split("T")[0]
        : "",
    },
  });

  // 🆕 Data loss prevention
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const initialFormData = useRef<string>("");

  // Track form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      const currentData = JSON.stringify(value);
      if (initialFormData.current === "") {
        initialFormData.current = currentData;
      }
      setHasUnsavedChanges(currentData !== initialFormData.current);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter cette page ?";
        return "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter cette page ?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation with confirmation
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowExitDialog(true);
    } else {
      router.push(path);
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsLoading(true);

      // Convert dates to ISO strings if provided
      const submitData = {
        ...data,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : undefined,
        endDate: data.endDate
          ? new Date(data.endDate).toISOString()
          : undefined,
        tempManagerEnd: data.tempManagerEnd
          ? new Date(data.tempManagerEnd).toISOString()
          : undefined,
        // Remove empty string and "none" values
        clientId:
          data.clientId && data.clientId !== "none" ? data.clientId : undefined,
        managerId:
          data.managerId && data.managerId !== "none"
            ? data.managerId
            : undefined,
        tempManagerId:
          data.tempManagerId && data.tempManagerId !== "none"
            ? data.tempManagerId
            : undefined,
      };

      const url = isEditing ? `/api/projects/${project?.id}` : "/api/projects";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} project`
        );
      }

      const result = await response.json();

      toast.success(
        `Project ${isEditing ? "updated" : "created"} successfully`
      );

      // Reset unsaved changes state
      setHasUnsavedChanges(false);
      initialFormData.current = JSON.stringify(data);

      // Redirect to project details or list
      if (result.project?.id) {
        router.push(`/dashboard/projects/${result.project.id}`);
      } else {
        router.push("/dashboard/projects");
      }

      router.refresh();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for temp manager to require end date
  const tempManagerId = form.watch("tempManagerId");

  // Watch budget fields for automatic profit calculation
  const totalBudgetCosting = form.watch("totalBudgetCosting");
  const totalBudgetSelling = form.watch("totalBudgetSelling");

  // Calculate profit automatically when budget fields change
  React.useEffect(() => {
    if (totalBudgetCosting && totalBudgetSelling && totalBudgetCosting > 0) {
      const profitDollars = totalBudgetSelling - totalBudgetCosting;
      const profitPercent = (profitDollars / totalBudgetCosting) * 100;

      form.setValue("initialProfitDollars", Number(profitDollars.toFixed(2)));
      form.setValue("initialProfitPercent", Number(profitPercent.toFixed(2)));
    } else {
      // Clear profit fields if either budget field is missing or costing is 0
      form.setValue("initialProfitDollars", undefined);
      form.setValue("initialProfitPercent", undefined);
    }
  }, [totalBudgetCosting, totalBudgetSelling, form]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigation("/dashboard/projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Project" : "Create New Project"}
            </h1>
            {hasUnsavedChanges && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                Modifications non sauvegardées
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            {isEditing
              ? "Update project information and settings"
              : "Set up a new project for tracking costs and activities"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential project details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="PROJ-2024-001"
                          {...field}
                          className="uppercase"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier (uppercase letters, numbers,
                        underscore, dash)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BILLABLE">Billable</SelectItem>
                          <SelectItem value="ADMIN">Administrative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Billable projects generate revenue, Admin projects are
                        internal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Project description and objectives"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="executionAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse d'exécution du projet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Rue Example, Montréal, QC H1A 1A1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Adresse physique où le projet sera exécuté
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domaine de projet *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un domaine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONSTRUCTION">
                          Construction
                        </SelectItem>
                        <SelectItem value="ENGINEERING">Ingénierie</SelectItem>
                        <SelectItem value="COMMERCE">Commerce</SelectItem>
                        <SelectItem value="TECHNOLOGY">Technologie</SelectItem>
                        <SelectItem value="HEALTHCARE">Santé</SelectItem>
                        <SelectItem value="EDUCATION">Éducation</SelectItem>
                        <SelectItem value="FINANCE">Finance</SelectItem>
                        <SelectItem value="MANUFACTURING">
                          Manufacture
                        </SelectItem>
                        <SelectItem value="TRANSPORTATION">
                          Transport
                        </SelectItem>
                        <SelectItem value="ENERGY">Énergie</SelectItem>
                        <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                        <SelectItem value="TOURISM">Tourisme</SelectItem>
                        <SelectItem value="MEDIA">Médias</SelectItem>
                        <SelectItem value="CONSULTING">Conseil</SelectItem>
                        <SelectItem value="GOVERNMENT">Gouvernement</SelectItem>
                        <SelectItem value="OTHER">Autres</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Domaine d'activité principal du projet
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Project Management */}
          <Card>
            <CardHeader>
              <CardTitle>Project Management</CardTitle>
              <CardDescription>
                Client assignment and project managers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No client</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No manager</SelectItem>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Temporary Manager */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tempManagerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Manager</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select temporary manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            No temporary manager
                          </SelectItem>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Temporary manager for vacation coverage or delegation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {tempManagerId && (
                  <FormField
                    control={form.control}
                    name="tempManagerEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temporary Manager End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          When the temporary manager assignment ends
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Financial & Timeline</CardTitle>
              <CardDescription>
                Budget breakdown, profit analysis, and project timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Breakdown */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Budget Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalBudgetCosting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Budget coûtant *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Coûts bruts connus à l'interne
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalBudgetSelling"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Budget vendant *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Budget remis au client (profit déjà ajouté)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="initialProfitDollars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit initial (dollars)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Calculé automatiquement: Budget vendant - Budget
                          coûtant
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="initialProfitPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit initial (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0.00"
                            {...field}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Calculé automatiquement: Pourcentage de profit sur le
                          budget coûtant
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Project Status & Currency */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Project Status & Currency
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statuts *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Actif</SelectItem>
                            <SelectItem value="ON_HOLD">En attente</SelectItem>
                            <SelectItem value="COMPLETED">Terminé</SelectItem>
                            <SelectItem value="CANCELLED">Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une devise" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CAD">
                              CAD - Dollar canadien
                            </SelectItem>
                            <SelectItem value="USD">
                              USD - Dollar américain
                            </SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleNavigation("/dashboard/projects")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifications non sauvegardées</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des modifications non sauvegardées. Si vous quittez
              maintenant, toutes vos modifications seront perdues. Voulez-vous
              vraiment quitter cette page ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelExit}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="bg-red-600 hover:bg-red-700"
            >
              Quitter sans sauvegarder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
