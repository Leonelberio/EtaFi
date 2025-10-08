"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { vendorSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface VendorFormProps {
  chartAccounts: Array<{ id: string; number: string; name: string }>;
  vendor?: {
    id: string;
    code: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    payableAccountId: string;
    withholdingRate?: number;
    taxable?: boolean;
    taxExempt?: boolean;
    taxNumber?: string;
    gstNumber?: string;
    qstNumber?: string;
    defaultCostGroup?: string;
  };
  isEditing?: boolean;
}

export function VendorForm({
  chartAccounts,
  vendor,
  isEditing = false,
}: VendorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      code: vendor?.code || "",
      name: vendor?.name || "",
      email: vendor?.email || "",
      phone: vendor?.phone || "",
      address: vendor?.address || "",
      city: vendor?.city || "",
      postalCode: vendor?.postalCode || "",
      country: vendor?.country || "Canada",
      payableAccountId: vendor?.payableAccountId || "",
      withholdingRate: vendor?.withholdingRate || undefined,
      taxable: vendor?.taxable ?? true,
      taxExempt: vendor?.taxExempt ?? false,
      taxNumber: vendor?.taxNumber || "",
      gstNumber: vendor?.gstNumber || "",
      qstNumber: vendor?.qstNumber || "",
      defaultCostGroup: vendor?.defaultCostGroup || undefined,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      const url = isEditing ? `/api/vendors/${vendor?.id}` : "/api/vendors";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} vendor`
        );
      }

      toast.success(`Vendor ${isEditing ? "updated" : "created"} successfully`);

      router.push("/dashboard/vendors");
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
        <CardTitle>{isEditing ? "Modifier le fournisseur" : "Créer un nouveau fournisseur"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code fournisseur *</Label>
                <Input
                  id="code"
                  {...form.register("code")}
                  placeholder="ex: OA11"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Optimise affaires"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact et compte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact et comptabilité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="fournisseur@example.com"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+1 (514) 123-4567"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payableAccountId">Compte à payer *</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("payableAccountId", value)
                  }
                  value={form.watch("payableAccountId")}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-primary-950 focus:ring-primary-950/20">
                    <SelectValue placeholder="Sélectionner le compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartAccounts
                      .filter((account) => account.number.startsWith("2"))
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.number} - {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.payableAccountId && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.payableAccountId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCostGroup">Groupe de coût par défaut</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("defaultCostGroup", value === "NONE" ? undefined : value)
                  }
                  value={form.watch("defaultCostGroup") || "NONE"}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-primary-950 focus:ring-primary-950/20">
                    <SelectValue placeholder="Aucun (modifiable dans factures)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Aucun</SelectItem>
                    <SelectItem value="M">M - Matériel</SelectItem>
                    <SelectItem value="S">S - Sous-traitance</SelectItem>
                    <SelectItem value="D">D - Divers</SelectItem>
                    <SelectItem value="E">E - Équipement</SelectItem>
                    <SelectItem value="MOD">MOD - Main-d'œuvre</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Peut être modifié lors de la saisie de facture
                </p>
              </div>
            </div>
          </div>

          {/* Informations fiscales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations fiscales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Numéro de taxe</Label>
                <Input
                  id="taxNumber"
                  {...form.register("taxNumber")}
                  placeholder="123456789"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">Numéro TPS</Label>
                <Input
                  id="gstNumber"
                  {...form.register("gstNumber")}
                  placeholder="123456789 RT0001"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qstNumber">Numéro TVQ</Label>
                <Input
                  id="qstNumber"
                  {...form.register("qstNumber")}
                  placeholder="1234567890 TQ0001"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withholdingRate">Taux de retenue (%)</Label>
                <Input
                  id="withholdingRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...form.register("withholdingRate", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
                <p className="text-xs text-gray-500">
                  ex: 10.50 pour 10.50%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxable"
                  checked={form.watch("taxable")}
                  onCheckedChange={(checked) =>
                    form.setValue("taxable", checked as boolean)
                  }
                />
                <Label htmlFor="taxable" className="font-normal cursor-pointer">
                  Autoriser les taxes pour ce fournisseur
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxExempt"
                  checked={form.watch("taxExempt")}
                  onCheckedChange={(checked) =>
                    form.setValue("taxExempt", checked as boolean)
                  }
                />
                <Label htmlFor="taxExempt" className="font-normal cursor-pointer">
                  Ce fournisseur est exempté de taxes
                </Label>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Adresse</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="123 rue Principale"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="Montréal"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  {...form.register("postalCode")}
                  placeholder="H1A 1A1"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  {...form.register("country")}
                  placeholder="Canada"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary-950 hover:bg-primary-900 text-white"
            >
              {isLoading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le fournisseur"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
