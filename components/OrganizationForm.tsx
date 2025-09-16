"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOrganizationSettings } from "@/contexts/OrganizationSettingsContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),
  businessDomain: z.string().min(1, "Business domain is required"),

  // Business information
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  website: z.string().url().optional().or(z.literal("")),

  // Canadian tax information
  taxNumber: z.string().optional(),
  nasNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  qstNumber: z.string().optional(),
  fiscalYearEnd: z.string().optional(),
});

interface OrganizationFormProps {
  organization?: {
    id: string;
    name: string;
    description?: string;
    businessDomain?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxNumber?: string;
    nasNumber?: string;
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
  const [isTaxSectionVisible, setIsTaxSectionVisible] = useState(false);
  const [taxPassword, setTaxPassword] = useState("");
  const [taxPasswordError, setTaxPasswordError] = useState("");
  const [fiscalYearEndDate, setFiscalYearEndDate] = useState<
    Date | undefined
  >();
  const router = useRouter();
  const { taxPassword: savedTaxPassword } = useOrganizationSettings();

  // 🆕 Get refresh function from context
  const { refreshOrganizations } = useOrganizationContext();

  const form = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || "",
      description: organization?.description || "",
      businessDomain: organization?.businessDomain || "",
      address: organization?.address || "",
      city: organization?.city || "",
      postalCode: organization?.postalCode || "",
      country: organization?.country || "Canada",
      phone: organization?.phone || "",
      email: organization?.email || "",
      website: organization?.website || "",
      taxNumber: organization?.taxNumber || "",
      nasNumber: organization?.nasNumber || "",
      gstNumber: organization?.gstNumber || "",
      qstNumber: organization?.qstNumber || "",
      fiscalYearEnd: organization?.fiscalYearEnd || "",
    },
  });

  const handleTaxSectionAuth = () => {
    if (taxPassword === savedTaxPassword && savedTaxPassword) {
      setIsTaxSectionVisible(true);
      setTaxPasswordError("");
      setTaxPassword("");
    } else {
      setTaxPasswordError("Mot de passe incorrect");
    }
  };

  // Initialize fiscal year end date
  useEffect(() => {
    if (organization?.fiscalYearEnd) {
      // Handle both old format ("December 31") and new format ("2024-12-31")
      let date: Date;
      if (organization.fiscalYearEnd.includes("-")) {
        // New format: YYYY-MM-DD
        date = new Date(organization.fiscalYearEnd);
      } else {
        // Old format: "December 31" - convert to current year
        const currentYear = new Date().getFullYear();
        date = new Date(`${organization.fiscalYearEnd}, ${currentYear}`);
      }

      if (!isNaN(date.getTime())) {
        setFiscalYearEndDate(date);
        // Update form value to new format
        form.setValue("fiscalYearEnd", format(date, "yyyy-MM-dd"));
      }
    }
  }, [organization?.fiscalYearEnd, form]);

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
                  <Label htmlFor="email">Email *</Label>
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
                <Label htmlFor="businessDomain">Domaine d'activité *</Label>
                <Select
                  value={form.watch("businessDomain")}
                  onValueChange={(value) =>
                    form.setValue("businessDomain", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Sélectionner un domaine d'activité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNOLOGY">
                      Technologie et Informatique
                    </SelectItem>
                    <SelectItem value="HEALTHCARE">Santé et Médical</SelectItem>
                    <SelectItem value="FINANCE">Finance et Banque</SelectItem>
                    <SelectItem value="EDUCATION">
                      Éducation et Formation
                    </SelectItem>
                    <SelectItem value="RETAIL">Commerce de détail</SelectItem>
                    <SelectItem value="MANUFACTURING">
                      Manufacture et Production
                    </SelectItem>
                    <SelectItem value="CONSTRUCTION">
                      Construction et Immobilier
                    </SelectItem>
                    <SelectItem value="TRANSPORTATION">
                      Transport et Logistique
                    </SelectItem>
                    <SelectItem value="ENERGY">
                      Énergie et Utilitaires
                    </SelectItem>
                    <SelectItem value="AGRICULTURE">
                      Agriculture et Agroalimentaire
                    </SelectItem>
                    <SelectItem value="TOURISM">
                      Tourisme et Hôtellerie
                    </SelectItem>
                    <SelectItem value="MEDIA">
                      Médias et Communication
                    </SelectItem>
                    <SelectItem value="CONSULTING">
                      Conseil et Services professionnels
                    </SelectItem>
                    <SelectItem value="NONPROFIT">
                      Organisme à but non lucratif
                    </SelectItem>
                    <SelectItem value="GOVERNMENT">
                      Gouvernement et Secteur public
                    </SelectItem>
                    <SelectItem value="OTHER">Autres</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.businessDomain && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.businessDomain.message}
                  </p>
                )}
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
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Canadian Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isTaxSectionVisible ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Lock className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Informations fiscales protégées
                    </p>
                    <p className="text-sm text-gray-600">
                      Cette section contient des informations sensibles.
                      Veuillez entrer le mot de passe pour y accéder.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="taxPassword">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="taxPassword"
                        type="password"
                        value={taxPassword}
                        onChange={(e) => setTaxPassword(e.target.value)}
                        placeholder="Entrez le mot de passe"
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleTaxSectionAuth}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        disabled={isLoading || !taxPassword}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    {taxPasswordError && (
                      <p className="text-sm text-red-600">{taxPasswordError}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleTaxSectionAuth}
                    disabled={isLoading || !taxPassword}
                    variant="outline"
                    className="w-full"
                  >
                    Accéder aux informations fiscales
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Informations fiscales déverrouillées
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTaxSectionVisible(false)}
                    className="text-green-700 hover:text-green-800"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>

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
                    <Label htmlFor="nasNumber">
                      NAS (Numéro d'assurance sociale)
                    </Label>
                    <Input
                      id="nasNumber"
                      {...form.register("nasNumber")}
                      placeholder="123 456 789"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                      Numéro d'assurance sociale du propriétaire
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fiscalYearEnd">Fin d'exercice fiscal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !fiscalYearEndDate && "text-muted-foreground"
                          }`}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fiscalYearEndDate ? (
                            format(fiscalYearEndDate, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fiscalYearEndDate}
                          onSelect={(date) => {
                            setFiscalYearEndDate(date);
                            if (date) {
                              form.setValue(
                                "fiscalYearEnd",
                                format(date, "yyyy-MM-dd")
                              );
                            }
                          }}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-gray-500">
                      Date de fin d'exercice fiscal (format: AAAA-MM-JJ)
                    </p>
                  </div>

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
            )}
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
