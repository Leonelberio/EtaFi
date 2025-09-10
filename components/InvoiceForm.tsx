"use client";

import { useState, useEffect } from "react";
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
  costCategory: z.enum(["M", "S", "D", "E", "MOD"]).optional(),
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
}

export function InvoiceForm({ invoiceId, initialData }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
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
          sortOrder: 0,
        },
      ],
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watchType = form.watch("type");
  const watchProjectId = form.watch("projectId");
  const watchLines = form.watch("lines");

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

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

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomers(
            Array.isArray(customersData.customers)
              ? customersData.customers
              : []
          );
        }

        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          setVendors(
            Array.isArray(vendorsData.vendors) ? vendorsData.vendors : []
          );
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(
            Array.isArray(projectsData.projects) ? projectsData.projects : []
          );
        }

        if (chartAccountsRes.ok) {
          const chartAccountsData = await chartAccountsRes.json();
          setChartAccounts(
            Array.isArray(chartAccountsData.accounts)
              ? chartAccountsData.accounts
              : []
          );
        }

        if (taxCodesRes.ok) {
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
          console.error("Failed to load activities:", response.status, response.statusText);
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
      sortOrder: fields.length,
    });
  };

  const removeLine = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const calculateLineTotal = (index: number) => {
    const line = watchLines[index];
    if (line) {
      const amount = (line.quantity || 0) * (line.unitPrice || 0);
      const taxAmount = amount * (line.taxRate || 0);
      const totalAmount = amount + taxAmount;

      form.setValue(`lines.${index}.amount`, amount);
      form.setValue(`lines.${index}.taxAmount`, taxAmount);
      form.setValue(`lines.${index}.totalAmount`, totalAmount);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setSaving(true);

      const url = invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices";
      const method = invoiceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(invoiceId ? "Facture mise à jour" : "Facture créée");
        router.push("/dashboard/invoices");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Erreur lors de la sauvegarde");
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
              <Input
                id="number"
                {...form.register("number")}
                placeholder="INV-2025-001"
                className="bg-white"
              />
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
                  onValueChange={(value) => form.setValue("customerId", value)}
                >
                  <SelectTrigger className="bg-white">
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
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="vendorId">Fournisseur *</Label>
                <Select
                  value={form.watch("vendorId") || ""}
                  onValueChange={(value) => form.setValue("vendorId", value)}
                >
                  <SelectTrigger className="bg-white">
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
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="projectId">Projet</Label>
              <Select
                value={form.watch("projectId") || ""}
                onValueChange={(value) => form.setValue("projectId", value)}
              >
                <SelectTrigger className="bg-white">
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
                      onChange={(e) => {
                        form.setValue(
                          `lines.${index}.quantity`,
                          parseFloat(e.target.value) || 0
                        );
                        calculateLineTotal(index);
                      }}
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
                      onChange={(e) => {
                        form.setValue(
                          `lines.${index}.unitPrice`,
                          parseFloat(e.target.value) || 0
                        );
                        calculateLineTotal(index);
                      }}
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.watch(`lines.${index}.amount`) || 0}
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
                          calculateLineTotal(index);
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
                      value={form.watch(`lines.${index}.totalAmount`) || 0}
                      readOnly
                      className="bg-gray-50"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={form.watch(`lines.${index}.activityId`) || ""}
                      onValueChange={(value) =>
                        form.setValue(`lines.${index}.activityId`, value)
                      }
                    >
                      <SelectTrigger className="bg-white">
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
                  </TableCell>
                  <TableCell>
                    <Select
                      value={form.watch(`lines.${index}.costCategory`) || ""}
                      onValueChange={(value) =>
                        form.setValue(
                          `lines.${index}.costCategory`,
                          value as "M" | "S" | "D" | "E" | "MOD"
                        )
                      }
                    >
                      <SelectTrigger className="bg-white">
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
                value={formatCurrency(form.watch("subtotal") || 0)}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Taxes</Label>
              <Input
                value={formatCurrency(form.watch("taxAmount") || 0)}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                value={formatCurrency(form.watch("total") || 0)}
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
        <Button type="submit" disabled={saving}>
          {saving ? "Sauvegarde..." : invoiceId ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
