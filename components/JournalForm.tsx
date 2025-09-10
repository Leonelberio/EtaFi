"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { journalSchema } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Calculator } from "lucide-react";
import { z } from "zod";

type JournalFormData = z.infer<typeof journalSchema>;

interface ChartAccount {
  id: string;
  number: string;
  name: string;
  type: string;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

interface Activity {
  id: string;
  code: string;
  name: string;
  projectId: string;
}

interface JournalFormProps {
  journal?: any;
  isEditing?: boolean;
}

export function JournalForm({ journal, isEditing = false }: JournalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const router = useRouter();

  const form = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      journalType: "GENERAL",
      entryDate: new Date().toISOString().split("T")[0],
      reference: "",
      description: "",
      lines: [
        {
          accountId: "",
          description: "",
          debitAmount: undefined,
          creditAmount: undefined,
        },
        {
          accountId: "",
          description: "",
          debitAmount: undefined,
          creditAmount: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsRes, projectsRes, activitiesRes] = await Promise.all([
          fetch("/api/chart-accounts"),
          fetch("/api/projects"),
          fetch("/api/activities"),
        ]);

        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          setChartAccounts(
            Array.isArray(accountsData.accounts) ? accountsData.accounts : []
          );
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(
            Array.isArray(projectsData.projects) ? projectsData.projects : []
          );
        }

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(Array.isArray(activitiesData) ? activitiesData : []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Set default empty arrays on error
        setChartAccounts([]);
        setProjects([]);
        setActivities([]);
      }
    };

    loadData();
  }, []);

  // Calculate totals
  const watchedLines = form.watch("lines");
  const totalDebits = watchedLines.reduce(
    (sum, line) => sum + (Number(line.debitAmount) || 0),
    0
  );
  const totalCredits = watchedLines.reduce(
    (sum, line) => sum + (Number(line.creditAmount) || 0),
    0
  );
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const onSubmit = async (data: JournalFormData) => {
    try {
      setIsLoading(true);

      const url = isEditing ? `/api/journals/${journal?.id}` : "/api/journals";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} journal`
        );
      }

      toast.success(
        `Journal ${isEditing ? "updated" : "created"} successfully`
      );
      router.push("/dashboard/journals");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addLine = () => {
    append({
      accountId: "",
      description: "",
      debitAmount: undefined,
      creditAmount: undefined,
    });
  };

  const removeLine = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const handleDebitChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || undefined;
    form.setValue(`lines.${index}.debitAmount`, numValue);
    if (numValue && numValue > 0) {
      form.setValue(`lines.${index}.creditAmount`, undefined);
    }
  };

  const handleCreditChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || undefined;
    form.setValue(`lines.${index}.creditAmount`, numValue);
    if (numValue && numValue > 0) {
      form.setValue(`lines.${index}.debitAmount`, undefined);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {isEditing ? "Edit Journal Entry" : "New Journal Entry"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="journalType">Journal Type *</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("journalType", value as any)
                }
                value={form.watch("journalType")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select journal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General Journal</SelectItem>
                  <SelectItem value="PURCHASE">Purchase Journal</SelectItem>
                  <SelectItem value="SALES">Sales Journal</SelectItem>
                  <SelectItem value="CASH_RECEIPTS">Cash Receipts</SelectItem>
                  <SelectItem value="CASH_DISBURSEMENTS">
                    Cash Disbursements
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.journalType && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.journalType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryDate">Entry Date *</Label>
              <Input
                id="entryDate"
                type="date"
                {...form.register("entryDate")}
                className="bg-white"
              />
              {form.formState.errors.entryDate && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.entryDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                {...form.register("reference")}
                placeholder="JE-001"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Balance Check</Label>
              <div
                className={`p-2 rounded text-sm ${isBalanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {isBalanced ? "✓ Balanced" : "⚠ Not Balanced"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Journal entry description"
              className="bg-white"
              rows={2}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Journal Lines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Journal Lines</h3>
              <Button
                type="button"
                onClick={addLine}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 p-4 border rounded-lg bg-gray-50"
                >
                  <div className="col-span-3">
                    <Label className="text-xs">Account *</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue(`lines.${index}.accountId`, value)
                      }
                      value={form.watch(`lines.${index}.accountId`)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(chartAccounts) &&
                          chartAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.number} - {account.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label className="text-xs">Description *</Label>
                    <Input
                      {...form.register(`lines.${index}.description`)}
                      placeholder="Line description"
                      className="h-8 text-xs bg-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Debit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.watch(`lines.${index}.debitAmount`) || ""}
                      onChange={(e) => handleDebitChange(index, e.target.value)}
                      className="h-8 text-xs bg-white text-right"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Credit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.watch(`lines.${index}.creditAmount`) || ""}
                      onChange={(e) =>
                        handleCreditChange(index, e.target.value)
                      }
                      className="h-8 text-xs bg-white text-right"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Project</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue(
                          `lines.${index}.projectId`,
                          value === "NONE" ? undefined : value
                        )
                      }
                      value={form.watch(`lines.${index}.projectId`) || "NONE"}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">No Project</SelectItem>
                        {Array.isArray(projects) &&
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.code} - {project.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {fields.length > 2 && (
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeLine(index)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg">
              <div className="text-right">
                <p className="text-sm font-medium">Total Debits:</p>
                <p className="text-lg font-bold">
                  ${Number(totalDebits || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Total Credits:</p>
                <p className="text-lg font-bold">
                  ${Number(totalCredits || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {form.formState.errors.lines && (
              <p className="text-sm text-red-600">
                {form.formState.errors.lines.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !isBalanced}
              className="bg-primary-950 hover:bg-primary-900 text-white"
            >
              {isLoading
                ? "Saving..."
                : `${isEditing ? "Update" : "Create"} Journal Entry`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
