"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { taxCodeSchema, type TaxCodeInput } from "@/lib/validations";
import { ArrowLeft, Percent, MapPin, FileText } from "lucide-react";
import Link from "next/link";

// Canadian provinces for HST configuration
const CANADIAN_PROVINCES = [
  { code: "AB", name: "Alberta", hstRate: null },
  { code: "BC", name: "British Columbia", hstRate: null },
  { code: "MB", name: "Manitoba", hstRate: null },
  { code: "NB", name: "New Brunswick", hstRate: 0.15 },
  { code: "NL", name: "Newfoundland and Labrador", hstRate: 0.15 },
  { code: "NS", name: "Nova Scotia", hstRate: 0.15 },
  { code: "ON", name: "Ontario", hstRate: 0.13 },
  { code: "PE", name: "Prince Edward Island", hstRate: 0.15 },
  { code: "QC", name: "Quebec", hstRate: null },
  { code: "SK", name: "Saskatchewan", hstRate: null },
  { code: "NT", name: "Northwest Territories", hstRate: null },
  { code: "NU", name: "Nunavut", hstRate: null },
  { code: "YT", name: "Yukon", hstRate: null },
];

// Predefined Canadian tax codes
const CANADIAN_TAX_PRESETS = [
  {
    code: "GST",
    name: "GST 5%",
    rate: 0.05,
    description: "Goods and Services Tax (Federal)",
    isCompound: false,
  },
  {
    code: "QST",
    name: "QST 9.975%",
    rate: 0.09975,
    province: "QC",
    description: "Quebec Sales Tax (Provincial)",
    isCompound: true,
  },
  {
    code: "HST_ON",
    name: "HST 13%",
    rate: 0.13,
    province: "ON",
    description: "Harmonized Sales Tax - Ontario",
    isCompound: false,
  },
  {
    code: "HST_NB",
    name: "HST 15%",
    rate: 0.15,
    province: "NB",
    description: "Harmonized Sales Tax - New Brunswick",
    isCompound: false,
  },
  {
    code: "EXEMPT",
    name: "Tax Exempt",
    rate: 0.0,
    description: "Tax exempt items",
    isCompound: false,
  },
];

interface TaxCodeFormProps {
  taxCode?: {
    id: string;
    code: string;
    name: string;
    rate: number;
    province?: string;
    isActive: boolean;
    isCompound: boolean;
    description?: string;
  };
  isEditing?: boolean;
  onSuccess?: () => void;
}

export function TaxCodeForm({
  taxCode,
  isEditing = false,
  onSuccess,
}: TaxCodeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const form = useForm<TaxCodeInput>({
    resolver: zodResolver(taxCodeSchema),
    defaultValues: {
      code: taxCode?.code || "",
      name: taxCode?.name || "",
      rate: taxCode?.rate || 0,
      province: taxCode?.province || "",
      isActive: taxCode?.isActive ?? true,
      isCompound: taxCode?.isCompound ?? false,
      description: taxCode?.description || "",
    },
  });

  const selectedProvince = form.watch("province");
  const rate = form.watch("rate");
  const isCompound = form.watch("isCompound");

  const applyPreset = (presetCode: string) => {
    const preset = CANADIAN_TAX_PRESETS.find((p) => p.code === presetCode);
    if (preset) {
      form.setValue("code", preset.code);
      form.setValue("name", preset.name);
      form.setValue("rate", preset.rate);
      form.setValue("province", preset.province || "");
      form.setValue("isCompound", preset.isCompound);
      form.setValue("description", preset.description);
      setSelectedPreset(presetCode);
    }
  };

  const onSubmit = async (data: TaxCodeInput) => {
    try {
      setIsLoading(true);

      const url = isEditing
        ? `/api/tax-codes/${taxCode?.id}`
        : "/api/tax-codes";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} tax code`
        );
      }

      toast.success(
        isEditing
          ? "Tax code updated successfully!"
          : "Tax code created successfully!"
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} tax code:`,
        error
      );
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} tax code`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tax-codes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Percent className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Tax Code" : "New Tax Code"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Update tax code details"
                : "Configure a new Canadian tax code"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Presets */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Canadian Tax Presets</CardTitle>
              <CardDescription>
                Quick setup for common Canadian taxes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {CANADIAN_TAX_PRESETS.map((preset) => (
                <Button
                  key={preset.code}
                  variant={
                    selectedPreset === preset.code ? "default" : "outline"
                  }
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => applyPreset(preset.code)}
                  type="button"
                >
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{preset.name}</span>
                      {preset.province && (
                        <Badge variant="secondary" className="text-xs">
                          {preset.province}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {preset.description}
                    </span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tax Code Details</CardTitle>
            <CardDescription>
              Configure the tax code with Canadian tax regulations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Tax Code *</Label>
                  <Input
                    id="code"
                    {...form.register("code")}
                    placeholder="GST, QST, HST_ON"
                    disabled={isLoading}
                  />
                  {form.formState.errors.code && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Display Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="GST 5%, QST 9.975%, HST 13%"
                    disabled={isLoading}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Tax Rate */}
              <div className="space-y-2">
                <Label htmlFor="rate">Tax Rate *</Label>
                <div className="relative">
                  <Input
                    id="rate"
                    type="number"
                    step="0.00001"
                    min="0"
                    max="1"
                    {...form.register("rate", { valueAsNumber: true })}
                    placeholder="0.05 (for 5%)"
                    disabled={isLoading}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {rate ? `${(rate * 100).toFixed(3)}%` : "0%"}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Enter as decimal (0.05 for 5%, 0.09975 for 9.975%)
                </p>
                {form.formState.errors.rate && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.rate.message}
                  </p>
                )}
              </div>

              {/* Province Selection */}
              <div className="space-y-2">
                <Label>Province/Territory</Label>
                <Select
                  value={selectedProvince}
                  onValueChange={(value) => form.setValue("province", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific province</SelectItem>
                    {CANADIAN_PROVINCES.map((province) => (
                      <SelectItem key={province.code} value={province.code}>
                        <div className="flex items-center justify-between w-full">
                          <span>{province.name}</span>
                          {province.hstRate && (
                            <Badge variant="outline" className="ml-2">
                              HST {province.hstRate * 100}%
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Leave empty for federal taxes (GST) or specify for provincial
                  taxes
                </p>
              </div>

              {/* Tax Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active Status</Label>
                    <p className="text-sm text-gray-500">
                      Whether this tax code can be used in transactions
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
                    <Label className="text-base">Compound Tax</Label>
                    <p className="text-sm text-gray-500">
                      Calculate tax on tax (e.g., QST calculated on GST +
                      amount)
                    </p>
                  </div>
                  <Switch
                    checked={isCompound}
                    onCheckedChange={(checked) =>
                      form.setValue("isCompound", checked)
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Additional notes about this tax code..."
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Tax Calculation Preview */}
              {rate > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Tax Calculation Preview
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>On $100.00:</span>
                        <span className="font-medium">
                          ${(rate * 100).toFixed(2)} tax
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">
                          ${(100 + rate * 100).toFixed(2)}
                        </span>
                      </div>
                      {isCompound && (
                        <p className="text-xs text-blue-700 mt-2">
                          ⚠️ Compound tax: calculated on base amount + other
                          taxes
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <>{isEditing ? "Updating..." : "Creating..."}</>
                  ) : (
                    <>{isEditing ? "Update Tax Code" : "Create Tax Code"}</>
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
      </div>
    </div>
  );
}
