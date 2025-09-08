"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { customerSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CustomerFormProps {
  chartAccounts: Array<{ id: string; number: string; name: string }>;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    receivableAccountId: string;
  };
  isEditing?: boolean;
}

export function CustomerForm({
  chartAccounts,
  customer,
  isEditing = false,
}: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      city: customer?.city || "",
      postalCode: customer?.postalCode || "",
      country: customer?.country || "",
      receivableAccountId: customer?.receivableAccountId || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      const url = isEditing
        ? `/api/customers/${customer?.id}`
        : "/api/customers";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} customer`
        );
      }

      toast.success(
        `Customer ${isEditing ? "updated" : "created"} successfully`
      );

      router.push("/dashboard/customers");
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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Customer" : "Create New Customer"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Customer name"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
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
                placeholder="customer@example.com"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+1234567890"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivableAccountId">Receivable Account *</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("receivableAccountId", value)
                }
                value={form.watch("receivableAccountId")}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-primary-950 focus:ring-primary-950/20">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {chartAccounts
                    .filter((account) => account.number.startsWith("411"))
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.number} - {account.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {form.formState.errors.receivableAccountId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.receivableAccountId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...form.register("address")}
              placeholder="Street address"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...form.register("city")}
                placeholder="City"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...form.register("postalCode")}
                placeholder="12345"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...form.register("country")}
                placeholder="Country"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary-950 hover:bg-primary-900 text-white"
            >
              {isLoading ? "Creating..." : "Create Customer"}
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
