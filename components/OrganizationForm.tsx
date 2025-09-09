"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),

  // Business information
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),

  // Canadian tax information
  taxNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  qstNumber: z.string().optional(),
  fiscalYearEnd: z.string().optional(),
});

interface OrganizationFormProps {
  organization?: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxNumber?: string;
    gstNumber?: string;
    qstNumber?: string;
    fiscalYearEnd?: string;
  };
  isEditing?: boolean;
}

export function OrganizationForm({
  organization,
  isEditing = false,
}: OrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // 🆕 Get refresh function from context
  const { refreshOrganizations } = useOrganizationContext();

  const form = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || "",
      description: organization?.description || "",
      address: organization?.address || "",
      city: organization?.city || "",
      postalCode: organization?.postalCode || "",
      country: organization?.country || "Canada",
      phone: organization?.phone || "",
      email: organization?.email || "",
      website: organization?.website || "",
      taxNumber: organization?.taxNumber || "",
      gstNumber: organization?.gstNumber || "",
      qstNumber: organization?.qstNumber || "",
      fiscalYearEnd: organization?.fiscalYearEnd || "December 31",
    },
  });

  const onSubmit = async (data: z.infer<typeof organizationSchema>) => {
    try {
      setIsLoading(true);

      const url = isEditing
        ? `/api/organizations/${organization?.id}`
        : "/api/organizations";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Failed to ${isEditing ? "update" : "create"} organization`
        );
      }

      toast.success(
        isEditing
          ? "Organization updated successfully!"
          : "Organization created successfully!"
      );

      // 🆕 Refresh organizations list in real-time
      await refreshOrganizations();

      router.push("/dashboard/organizations");
      router.refresh();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} organization:`,
        error
      );
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} organization`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/organizations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Organization" : "New Organization"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Update organization details"
                : "Create a new organization"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter organization name"
                    disabled={isLoading}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="organization@company.com"
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe your organization"
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="+1 (555) 123-4567"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...form.register("website")}
                    placeholder="https://www.company.com"
                    disabled={isLoading}
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="123 Main Street"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="Toronto"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...form.register("postalCode")}
                    placeholder="M5V 3A8"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...form.register("country")}
                    placeholder="Canada"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canadian Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>Canadian Tax Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Business Number (BN)</Label>
                  <Input
                    id="taxNumber"
                    {...form.register("taxNumber")}
                    placeholder="123456789"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    9-digit Canada Revenue Agency business number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                  <Input
                    id="fiscalYearEnd"
                    {...form.register("fiscalYearEnd")}
                    placeholder="December 31"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST/HST Registration</Label>
                  <Input
                    id="gstNumber"
                    {...form.register("gstNumber")}
                    placeholder="123456789RT0001"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    GST/HST registration number (if applicable)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qstNumber">QST Registration (Quebec)</Label>
                  <Input
                    id="qstNumber"
                    {...form.register("qstNumber")}
                    placeholder="1234567890TQ0001"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Quebec sales tax registration (if applicable)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
            className="bg-primary-950 hover:bg-primary-900 text-white"
          >
            {isLoading ? (
              <>{isEditing ? "Updating..." : "Creating..."}</>
            ) : (
              <>{isEditing ? "Update Organization" : "Create Organization"}</>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/organizations")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
