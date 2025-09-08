"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, ArrowLeft } from "lucide-react";

// Chart Account validation schema
const chartAccountSchema = z.object({
  number: z
    .string()
    .min(4, "Account number must be at least 4 digits")
    .max(10, "Account number must be at most 10 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  name: z.string().min(2, "Account name is required").max(100),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE", "TAX"]),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  allowManualEntries: z.boolean().default(true),
  requireProjectAllocation: z.boolean().default(false),
});

type ChartAccountFormData = z.infer<typeof chartAccountSchema>;

interface ChartAccountFormProps {
  account?: {
    id: string;
    number: string;
    name: string;
    type: string;
    description?: string;
    isActive: boolean;
    allowManualEntries: boolean;
    requireProjectAllocation: boolean;
  };
  isEditing?: boolean;
}

// Canadian account type definitions
const ACCOUNT_TYPES = [
  {
    value: "ASSET",
    label: "Asset / Actif",
    description: "Cash, inventory, equipment, etc.",
    range: "1000-1999",
  },
  {
    value: "LIABILITY",
    label: "Liability / Passif",
    description: "Accounts payable, loans, accruals, etc.",
    range: "2000-2999",
  },
  {
    value: "EQUITY",
    label: "Equity / Capitaux propres",
    description: "Owner's equity, retained earnings, etc.",
    range: "3000-3999",
  },
  {
    value: "REVENUE",
    label: "Revenue / Revenus",
    description: "Sales, service revenue, interest income, etc.",
    range: "4000-4999",
  },
  {
    value: "EXPENSE",
    label: "Expense / Charges",
    description: "Operating expenses, cost of goods sold, etc.",
    range: "5000-5999",
  },
  {
    value: "TAX",
    label: "Tax / Taxes",
    description: "GST/HST, QST, payroll taxes, etc.",
    range: "2600-2699",
  },
];

export function ChartAccountForm({
  account,
  isEditing = false,
}: ChartAccountFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChartAccountFormData>({
    resolver: zodResolver(chartAccountSchema),
    defaultValues: {
      number: account?.number || "",
      name: account?.name || "",
      type: (account?.type as ChartAccountFormData["type"]) || "EXPENSE",
      description: account?.description || "",
      isActive: account?.isActive ?? true,
      allowManualEntries: account?.allowManualEntries ?? true,
      requireProjectAllocation: account?.requireProjectAllocation ?? false,
    },
  });

  const selectedType = form.watch("type");
  const selectedTypeInfo = ACCOUNT_TYPES.find((t) => t.value === selectedType);

  const onSubmit = async (data: ChartAccountFormData) => {
    try {
      setIsLoading(true);
      const url = isEditing
        ? `/api/chart-accounts/${account?.id}`
        : "/api/chart-accounts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} account`
        );
      }

      toast.success(
        `Account ${isEditing ? "updated" : "created"} successfully`
      );
      router.push("/dashboard/chart-of-accounts");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Account" : "Create New Account"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Update account information"
              : "Add a new account to your chart of accounts"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Enter the account details below. Account numbers should follow
            Canadian NCECF standards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="number">Account Number *</Label>
              <Input
                id="number"
                placeholder="e.g., 1000, 5200"
                {...form.register("number")}
                disabled={isEditing} // Don't allow changing account numbers
              />
              {form.formState.errors.number && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.number.message}
                </p>
              )}
              {selectedTypeInfo && (
                <p className="text-sm text-gray-600">
                  Recommended range for {selectedTypeInfo.label}:{" "}
                  {selectedTypeInfo.range}
                </p>
              )}
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Cash, Accounts Payable, Office Expenses"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Account Type *</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) =>
                  form.setValue("type", value as ChartAccountFormData["type"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for this account"
                {...form.register("description")}
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Account Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Settings</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Account</Label>
                  <p className="text-sm text-gray-600">
                    Inactive accounts won't appear in transaction forms
                  </p>
                </div>
                <Switch
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) =>
                    form.setValue("isActive", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Manual Entries</Label>
                  <p className="text-sm text-gray-600">
                    Allow direct journal entries to this account
                  </p>
                </div>
                <Switch
                  checked={form.watch("allowManualEntries")}
                  onCheckedChange={(checked) =>
                    form.setValue("allowManualEntries", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Project Allocation</Label>
                  <p className="text-sm text-gray-600">
                    Require project selection for all entries to this account
                  </p>
                </div>
                <Switch
                  checked={form.watch("requireProjectAllocation")}
                  onCheckedChange={(checked) =>
                    form.setValue("requireProjectAllocation", checked)
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Update Account" : "Create Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
