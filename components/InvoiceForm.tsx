"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Calculator,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Validation schemas
const invoiceLineSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  amount: z.number().min(0, "Amount must be positive"),
  taxCodeId: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0, "Total amount must be positive"),
  activityId: z.string().optional(),
  subActivityId: z.string().optional(),
  costCategory: z.enum(["M", "S", "D", "E", "MOD"]),
  revenueAccountId: z.string().optional(),
  sortOrder: z.number().default(0),
});

const invoiceSchema = z.object({
  number: z.string().min(1, "Invoice number is required"),
  type: z.enum(["SALES", "PURCHASE"]),
  status: z
    .enum(["DRAFT", "SENT", "PAID", "CANCELLED", "OVERDUE"])
    .default("DRAFT"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().optional(),
  ref: z.string().optional(),
  poNumber: z.string().optional(),
  customerId: z.string().optional(),
  vendorId: z.string().optional(),
  projectId: z.string().optional(),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  taxAmount: z.number().min(0, "Tax amount must be positive"),
  total: z.number().min(0, "Total must be positive"),
  paidAmount: z.number().min(0).default(0),
  currency: z.string().default("CAD"),
  paymentTerms: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  lines: z
    .array(invoiceLineSchema)
    .min(1, "At least one line item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface Customer {
  id: string;
  name: string;
  email?: string;
}

interface Vendor {
  id: string;
  name: string;
  email?: string;
}

interface Project {
  id: string;
  code: string;
  name: string;
  client?: { name: string };
}

interface Activity {
  id: string;
  code: string;
  name: string;
  projectId: string;
}

interface SubActivity {
  id: string;
  code: string;
  name: string;
  activityId: string;
}

interface ChartAccount {
  id: string;
  number: string;
  name: string;
  type: string;
}

interface TaxCode {
  id: string;
  code: string;
  name: string;
  rate: number;
}

interface InvoiceFormProps {
  invoiceId?: string;
  initialData?: Partial<InvoiceFormData>;
  chartAccounts?: ChartAccount[];
  customers?: Customer[];
  vendors?: Vendor[];
  projects?: Project[];
  taxCodes?: TaxCode[];
  invoice?: any;
  isEditing?: boolean;
}

export function InvoiceForm({
  invoiceId,
  initialData,
  chartAccounts: initialChartAccounts = [],
  customers: initialCustomers = [],
  vendors: initialVendors = [],
  projects: initialProjects = [],
  taxCodes: initialTaxCodes = [],
  invoice,
  isEditing = false,
}: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Data states
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [chartAccounts, setChartAccounts] =
    useState<ChartAccount[]>(initialChartAccounts);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>(initialTaxCodes);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    mode: "onChange", // Add this to see validation errors in real-time
    defaultValues: {
      type: "SALES",
      status: "DRAFT",
      date: new Date().toISOString().split("T")[0],
      currency: "CAD",
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      paidAmount: 0,
      lines: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          totalAmount: 0,
          costCategory: "M",
          sortOrder: 0,
        },
      ],
      ...initialData,
      ...(invoice && {
        ...invoice,
        date: invoice.date
          ? new Date(invoice.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        dueDate: invoice.dueDate
          ? new Date(invoice.dueDate).toISOString().split("T")[0]
          : undefined,
        lines: invoice.lines?.map((line: any, index: number) => ({
          ...line,
          quantity: Number(line.quantity) || 0,
          unitPrice: Number(line.unitPrice) || 0,
          amount: Number(line.amount) || 0,
          taxAmount: Number(line.taxAmount) || 0,
          totalAmount: Number(line.totalAmount) || 0,
          taxRate: Number(line.taxRate) || 0,
          sortOrder: index,
        })) || [
          {
            description: "",
            quantity: 1,
            unitPrice: 0,
            amount: 0,
            totalAmount: 0,
            sortOrder: 0,
          },
        ],
      }),
    },
  });

  // Add form state watcher for debugging
  const watchedValues = form.watch();
  console.log("Form values:", watchedValues);
  console.log("Form errors:", form.formState.errors);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Watch lines for calculation
  const watchedLines = form.watch("lines");

  // State to force re-renders when calculations change
  const [calculatedValues, setCalculatedValues] = useState({
    lines: [] as Array<{
      amount: number;
      taxAmount: number;
      totalAmount: number;
    }>,
    totals: { subtotal: 0, totalTax: 0, total: 0 },
  });

  // Generate invoice number function
  const generateInvoiceNumber = async () => {
    if (isEditing) return; // Don't regenerate for existing invoices

    setIsGeneratingNumber(true);
    try {
      const response = await fetch("/api/invoices/generate-number");
      if (response.ok) {
        const data = await response.json();
        form.setValue("number", data.number);
      }
    } catch (error) {
      console.error("Error generating invoice number:", error);
    } finally {
      setIsGeneratingNumber(false);
    }
  };

  const handlePost = async () => {
    if (!invoiceId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/post`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("✅ Facture postée avec succès!", {
          description:
            "Les écritures de journal ont été créées automatiquement",
          duration: 4000,
        });

        // Small delay to show success message before redirect
        setTimeout(() => {
          router.push("/dashboard/invoices");
        }, 1000);
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.error ||
          `Erreur ${response.status}: ${response.statusText}`;

        toast.error("❌ Erreur lors du posting", {
          description: errorMessage,
          duration: 6000,
        });

        console.error("Invoice post error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
      }
    } catch (error) {
      console.error("Error posting invoice:", error);
      toast.error("❌ Erreur de connexion", {
        description: "Vérifiez votre connexion internet et réessayez",
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals whenever lines change
  useEffect(() => {
    if (!watchedLines || watchedLines.length === 0) {
      setCalculatedValues({
        lines: [],
        totals: { subtotal: 0, totalTax: 0, total: 0 },
      });
      return;
    }

    const calculatedLines = watchedLines.map((line) => {
      const quantity = Number(line.quantity) || 0;
      const unitPrice = Number(line.unitPrice) || 0;
      const taxRate = Number(line.taxRate) || 0;

      const lineAmount = quantity * unitPrice;
      const lineTax = lineAmount * taxRate;
      const lineTotal = lineAmount + lineTax;

      return {
        amount: Number(Number(lineAmount).toFixed(2)),
        taxAmount: Number(Number(lineTax).toFixed(2)),
        totalAmount: Number(Number(lineTotal).toFixed(2)),
      };
    });

    const subtotal = calculatedLines.reduce(
      (sum, line) => sum + line.amount,
      0
    );
    const totalTax = calculatedLines.reduce(
      (sum, line) => sum + line.taxAmount,
      0
    );
    const total = subtotal + totalTax;

    // Update state to trigger re-render
    setCalculatedValues({
      lines: calculatedLines,
      totals: {
        subtotal: Number(Number(subtotal).toFixed(2)),
        totalTax: Number(Number(totalTax).toFixed(2)),
        total: Number(Number(total).toFixed(2)),
      },
    });

    // Also update form values for form submission
    calculatedLines.forEach((calc, index) => {
      form.setValue(`lines.${index}.amount`, calc.amount, {
        shouldValidate: false,
      });
      form.setValue(`lines.${index}.taxAmount`, calc.taxAmount, {
        shouldValidate: false,
      });
      form.setValue(`lines.${index}.totalAmount`, calc.totalAmount, {
        shouldValidate: false,
      });
    });

    form.setValue("subtotal", Number(Number(subtotal).toFixed(2)), {
      shouldValidate: false,
    });
    form.setValue("taxAmount", Number(Number(totalTax).toFixed(2)), {
      shouldValidate: false,
    });
    form.setValue("total", Number(Number(total).toFixed(2)), {
      shouldValidate: false,
    });
  }, [watchedLines, form]);

  // Generate invoice number on mount for new invoices
  useEffect(() => {
    if (!isEditing) {
      generateInvoiceNumber();
    }
  }, [isEditing]);

  const watchType = form.watch("type");
  const watchProjectId = form.watch("projectId");
  const watchLines = form.watch("lines");

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // If data was provided as props, no need to fetch
        if (
          initialCustomers.length > 0 &&
          initialVendors.length > 0 &&
          initialProjects.length > 0 &&
          initialChartAccounts.length > 0 &&
          initialTaxCodes.length > 0
        ) {
          setLoading(false);
          return;
        }

        const [
          customersRes,
          vendorsRes,
          projectsRes,
          chartAccountsRes,
          taxCodesRes,
        ] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/vendors"),
          fetch("/api/projects"),
          fetch("/api/chart-accounts"),
          fetch("/api/tax-codes"),
        ]);

        if (customersRes.ok && initialCustomers.length === 0) {
          const customersData = await customersRes.json();
          setCustomers(
            Array.isArray(customersData.customers)
              ? customersData.customers
              : []
          );
        }

        if (vendorsRes.ok && initialVendors.length === 0) {
          const vendorsData = await vendorsRes.json();
          setVendors(
            Array.isArray(vendorsData.vendors) ? vendorsData.vendors : []
          );
        }

        if (projectsRes.ok && initialProjects.length === 0) {
          const projectsData = await projectsRes.json();
          setProjects(
            Array.isArray(projectsData.projects) ? projectsData.projects : []
          );
        }

        if (chartAccountsRes.ok && initialChartAccounts.length === 0) {
          const chartAccountsData = await chartAccountsRes.json();
          setChartAccounts(
            Array.isArray(chartAccountsData.accounts)
              ? chartAccountsData.accounts
              : []
          );
        }

        if (taxCodesRes.ok && initialTaxCodes.length === 0) {
          const taxCodesData = await taxCodesRes.json();
          setTaxCodes(
            Array.isArray(taxCodesData.taxCodes) ? taxCodesData.taxCodes : []
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error loading form data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load activities when project changes
  useEffect(() => {
    const loadActivities = async () => {
      if (!watchProjectId) {
        console.log("No project selected, clearing activities");
        setActivities([]);
        setSubActivities([]);
        return;
      }

      console.log(`Loading activities for project: ${watchProjectId}`);
      try {
        const response = await fetch(
          `/api/projects/${watchProjectId}/activities`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Activities loaded:", data);
          setActivities(Array.isArray(data) ? data : []);
        } else {
          console.error(
            "Failed to load activities:",
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.error("Error response:", errorText);
        }
      } catch (error) {
        console.error("Error loading activities:", error);
      }
    };

    loadActivities();
  }, [watchProjectId]);

  // Auto-set projectId for all lines when project changes
  useEffect(() => {
    if (watchProjectId) {
      const currentLines = form.getValues("lines");
      const updatedLines = currentLines.map((line) => ({
        ...line,
        projectId: watchProjectId,
      }));
      form.setValue("lines", updatedLines);
    }
  }, [watchProjectId, form]);

  // Calculate totals when lines change
  useEffect(() => {
    const lines = watchLines || [];
    const subtotal = lines.reduce((sum, line) => sum + (line.amount || 0), 0);
    const taxAmount = lines.reduce(
      (sum, line) => sum + (line.taxAmount || 0),
      0
    );
    const total = subtotal + taxAmount;

    form.setValue("subtotal", subtotal);
    form.setValue("taxAmount", taxAmount);
    form.setValue("total", total);
  }, [watchLines, form]);

  const addLine = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      totalAmount: 0,
      costCategory: "M",
      sortOrder: fields.length,
    });
  };

  const removeLine = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const clearFormErrors = () => {
    setFormErrors({});
  };

  const onSubmit = async (data: InvoiceFormData) => {
    alert("onSubmit called!"); // Simple alert to test if function is called
    console.log("onSubmit called with data:", data);
    console.log("invoiceId:", invoiceId);
    try {
      setSaving(true);
      clearFormErrors();

      // Temporarily skip validation for debugging
      console.log("Skipping validation for debugging");

      const url = invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices";
      const method = invoiceId ? "PUT" : "POST";
      
      console.log("Making API call:", { url, method, data });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        const action = invoiceId ? "mise à jour" : "créée";
        toast.success(`✅ Facture ${action} avec succès!`, {
          description: `Numéro: ${result.number || data.number}`,
          duration: 4000,
        });

        // Small delay to show success message before redirect
        setTimeout(() => {
          router.push("/dashboard/invoices");
        }, 1000);
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.error ||
          `Erreur ${response.status}: ${response.statusText}`;

        toast.error("❌ Erreur lors de la sauvegarde", {
          description: errorMessage,
          duration: 6000,
        });

        console.error("Invoice save error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("❌ Erreur de connexion", {
        description: "Vérifiez votre connexion internet et réessayez",
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {invoiceId ? "Modifier la facture" : "Nouvelle facture"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Numéro de facture *</Label>
              <div className="relative">
                <Input
                  id="number"
                  {...form.register("number")}
                  placeholder={
                    isGeneratingNumber ? "Génération..." : "INV-2025-001"
                  }
                  className="bg-gray-50"
                  readOnly
                />
                {isGeneratingNumber && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>
              {form.formState.errors.number && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) =>
                  form.setValue("type", value as "SALES" | "PURCHASE")
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALES">Vente</SelectItem>
                  <SelectItem value="PURCHASE">Achat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
                className="bg-white"
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register("dueDate")}
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ref">Référence</Label>
              <Input
                id="ref"
                {...form.register("ref")}
                placeholder="Référence externe"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poNumber">Numéro de commande</Label>
              <Input
                id="poNumber"
                {...form.register("poNumber")}
                placeholder="PO-2025-001"
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Parties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchType === "SALES" ? (
              <div className="space-y-2">
                <Label htmlFor="customerId">Client *</Label>
                <Select
                  value={form.watch("customerId") || ""}
                  onValueChange={(value) => {
                    form.setValue("customerId", value);
                    clearFormErrors();
                  }}
                >
                  <SelectTrigger
                    className={`bg-white ${formErrors.customer ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.customer && (
                  <p className="text-sm text-red-500">{formErrors.customer}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="vendorId">Fournisseur *</Label>
                <Select
                  value={form.watch("vendorId") || ""}
                  onValueChange={(value) => {
                    form.setValue("vendorId", value);
                    clearFormErrors();
                  }}
                >
                  <SelectTrigger
                    className={`bg-white ${formErrors.customer ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.customer && (
                  <p className="text-sm text-red-500">{formErrors.customer}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="projectId">Projet *</Label>
              <Select
                value={form.watch("projectId") || ""}
                onValueChange={(value) => {
                  form.setValue("projectId", value);
                  clearFormErrors();
                }}
              >
                <SelectTrigger
                  className={`bg-white ${formErrors.project ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.code} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.project && (
                <p className="text-sm text-red-500">{formErrors.project}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lignes de facture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Lignes de facture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Quantité</TableHead>
                <TableHead className="w-32">Prix unitaire</TableHead>
                <TableHead className="w-32">Montant</TableHead>
                <TableHead className="w-24">Taxe</TableHead>
                <TableHead className="w-32">Total</TableHead>
                <TableHead className="w-24">Activité</TableHead>
                <TableHead className="w-24">Groupe</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Input
                      {...form.register(`lines.${index}.description`)}
                      placeholder="Description"
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.001"
                      {...form.register(`lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`lines.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={calculatedValues.lines[index]?.amount || 0}
                      readOnly
                      className="bg-gray-50"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={form.watch(`lines.${index}.taxCodeId`) || ""}
                      onValueChange={(value) => {
                        form.setValue(`lines.${index}.taxCodeId`, value);
                        const taxCode = taxCodes.find((tc) => tc.id === value);
                        if (taxCode) {
                          form.setValue(`lines.${index}.taxRate`, taxCode.rate);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Taxe" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxCodes.map((taxCode) => (
                          <SelectItem key={taxCode.id} value={taxCode.id}>
                            {taxCode.code} - {taxCode.name} (
                            {taxCode.rate * 100}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={calculatedValues.lines[index]?.totalAmount || 0}
                      readOnly
                      className="bg-gray-50"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={form.watch(`lines.${index}.activityId`) || ""}
                      onValueChange={(value) => {
                        form.setValue(`lines.${index}.activityId`, value);
                        clearFormErrors();
                      }}
                    >
                      <SelectTrigger
                        className={`bg-white ${formErrors[`line_${index}_activity`] ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Activité" />
                      </SelectTrigger>
                      <SelectContent>
                        {activities.map((activity) => (
                          <SelectItem key={activity.id} value={activity.id}>
                            {activity.code} - {activity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors[`line_${index}_activity`] && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors[`line_${index}_activity`]}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={form.watch(`lines.${index}.costCategory`) || ""}
                      onValueChange={(value) => {
                        form.setValue(
                          `lines.${index}.costCategory`,
                          value as "M" | "S" | "D" | "E" | "MOD"
                        );
                        clearFormErrors();
                      }}
                    >
                      <SelectTrigger
                        className={`bg-white ${formErrors[`line_${index}_costCategory`] ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Groupe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">M - Matériel</SelectItem>
                        <SelectItem value="S">S - Sous-traitance</SelectItem>
                        <SelectItem value="D">D - Divers</SelectItem>
                        <SelectItem value="E">E - Équipement</SelectItem>
                        <SelectItem value="MOD">MOD - Main-d'œuvre</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors[`line_${index}_costCategory`] && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors[`line_${index}_costCategory`]}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
            <Button type="button" variant="outline" onClick={addLine}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </Button>
            {formErrors.lines && (
              <p className="text-sm text-red-500 mt-2">{formErrors.lines}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Totaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Totaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sous-total</Label>
              <Input
                value={formatCurrency(calculatedValues.totals.subtotal)}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Taxes</Label>
              <Input
                value={formatCurrency(calculatedValues.totals.totalTax)}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                value={formatCurrency(calculatedValues.totals.total)}
                readOnly
                className="bg-gray-50 font-bold"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (visibles sur la facture)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Notes visibles par le client"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internalNotes">Notes internes</Label>
            <Textarea
              id="internalNotes"
              {...form.register("internalNotes")}
              placeholder="Notes internes (non visibles par le client)"
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        {isEditing && invoice?.status === "DRAFT" && (
          <Button
            type="button"
            variant="secondary"
            onClick={handlePost}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Postage...
              </>
            ) : (
              "Poster la facture"
            )}
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sauvegarde...
            </>
          ) : invoiceId ? (
            "Mettre à jour"
          ) : (
            "Créer"
          )}
        </Button>
      </div>
    </form>
  );
}
