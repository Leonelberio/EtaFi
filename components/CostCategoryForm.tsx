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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

// Form validation schema
const costCategoryFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Code must contain only uppercase letters, numbers, underscores, and hyphens"
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(500, "Description must be 500 characters or less"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  icon: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
});

type CostCategoryFormData = z.infer<typeof costCategoryFormSchema>;

interface CostCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

interface CostCategoryFormProps {
  category?: CostCategory;
  isEditing?: boolean;
}

// Predefined cost category options
const COST_CATEGORY_OPTIONS = [
  {
    code: "M",
    name: "Matériel & Fournitures",
    description: "Materials, supplies, and inventory items used in projects",
    color: "#3B82F6",
    icon: "📦",
  },
  {
    code: "S",
    name: "Sous-traitance & Services externes",
    description: "Subcontracting and external services",
    color: "#8B5CF6",
    icon: "🤝",
  },
  {
    code: "D",
    name: "Frais généraux & Divers",
    description: "General expenses and miscellaneous costs",
    color: "#F59E0B",
    icon: "📋",
  },
  {
    code: "E",
    name: "Équipement & Immobilisations",
    description: "Equipment and fixed assets",
    color: "#10B981",
    icon: "🔧",
  },
  {
    code: "MOD",
    name: "Main-d'œuvre & Charges sociales",
    description: "Labor costs and social charges",
    color: "#EF4444",
    icon: "👥",
  },
];

// Color options
const COLOR_OPTIONS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#10B981", // Green
  "#EF4444", // Red
  "#6B7280", // Gray
  "#EC4899", // Pink
  "#14B8A6", // Teal
];

export function CostCategoryForm({
  category,
  isEditing = false,
}: CostCategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CostCategoryFormData>({
    resolver: zodResolver(costCategoryFormSchema),
    defaultValues: {
      code: category?.code || "",
      name: category?.name || "",
      description: category?.description || "",
      color: category?.color || "#3B82F6",
      icon: category?.icon || "",
      isActive: category?.isActive ?? true,
      sortOrder: category?.sortOrder || 0,
    },
  });

  const selectedColor = form.watch("color");

  const onSubmit = async (data: CostCategoryFormData) => {
    try {
      setIsLoading(true);
      const url = isEditing
        ? `/api/cost-categories/${category?.id}`
        : "/api/cost-categories";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} category`
        );
      }

      toast.success(
        `Cost category ${isEditing ? "updated" : "created"} successfully`
      );
      router.push("/dashboard/cost-categories");
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
            {isEditing ? "Edit Cost Category" : "Create New Cost Category"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Update cost category information"
              : "Add a new cost category to the 5-group system"}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>
              Configure the cost category details following the Canadian 5-group
              system (M, S, D, E, MOD).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Code Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category Code *
              </label>
              <Input
                {...form.register("code")}
                placeholder="e.g., M, S, D, E, MOD, CUSTOM1, etc."
                className="font-mono uppercase"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  form.setValue("code", value);
                }}
              />
              <p className="text-xs text-gray-500">
                Use uppercase letters, numbers, underscores, and hyphens only.
                Common codes: M (Material), S (Services), D (Divers), E
                (Equipment), MOD (Labor)
              </p>
              {form.formState.errors.code && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category Name *
              </label>
              <Input
                {...form.register("name")}
                placeholder="e.g., Matériel & Fournitures"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description *
              </label>
              <Textarea
                {...form.register("description")}
                placeholder="Describe what types of costs belong to this category..."
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Color and Icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Color *
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color
                            ? "border-gray-900"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => form.setValue("color", color)}
                      />
                    ))}
                  </div>
                  <Input
                    {...form.register("color")}
                    placeholder="#3B82F6"
                    className="font-mono"
                  />
                </div>
                {form.formState.errors.color && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.color.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Icon (Optional)
                </label>
                <Input
                  {...form.register("icon")}
                  placeholder="📦 or icon name"
                />
                <p className="text-xs text-gray-500">
                  Use an emoji or icon identifier
                </p>
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <Input
                type="number"
                min="0"
                {...form.register("sortOrder", { valueAsNumber: true })}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first in lists
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-700">
                  Active Status
                </label>
                <p className="text-xs text-gray-500">
                  Inactive categories won&apos;t appear in new entries
                </p>
              </div>
              <Switch
                checked={form.watch("isActive")}
                onCheckedChange={(checked) =>
                  form.setValue("isActive", checked)
                }
              />
            </div>

            {/* Preview */}
            {form.watch("code") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Preview
                </label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: selectedColor }}
                    >
                      {form.watch("icon") || form.watch("code")}
                    </div>
                    <div>
                      <div className="font-medium">
                        {form.watch("name") || "Category Name"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {form.watch("description") || "Category description"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {!isLoading && <Save className="h-4 w-4 mr-2" />}
                {isEditing ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
