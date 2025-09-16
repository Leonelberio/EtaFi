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

const purchaseInvoiceSchema = z.object({
  number: z.string().min(1, "Invoice number is required"),
  status: z
    .enum(["DRAFT", "SENT", "PAID", "CANCELLED", "OVERDUE"])
    .default("DRAFT"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().optional(),
  ref: z.string().optional(),
  poNumber: z.string().optional(),
  vendorId: z.string().min(1, "Vendor is required for purchase invoices"),
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

type PurchaseInvoiceFormData = z.infer<typeof purchaseInvoiceSchema>;

interface Vendor {
  id: string;
  name: string;
  email?: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Activity {
  id: string;
  name: string;
  code: string;
}

interface SubActivity {
  id: string;
  name: string;
  code: string;
}

interface TaxCode {
  id: string;
  code: string;
  name: string;
  rate: number;
}

interface ChartAccount {
  id: string;
  code: string;
  name: string;
}

interface PurchaseInvoiceFormProps {
  invoiceId?: string;
}

export function PurchaseInvoiceForm({ invoiceId }: PurchaseInvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PurchaseInvoiceFormData>({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: {
      number: "",
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
          taxAmount: 0,
          totalAmount: 0,
          costCategory: "M",
          sortOrder: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");
  const watchedSubtotal = watch("subtotal");
  const watchedTaxAmount = watch("taxAmount");

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = watchedLines.reduce(
      (sum, line) => sum + (line.amount || 0),
      0
    );
    const taxAmount = watchedLines.reduce(
      (sum, line) => sum + (line.taxAmount || 0),
      0
    );
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  }, [watchedLines]);

  // Update form totals when lines change
  useEffect(() => {
    setValue("subtotal", totals.subtotal);
    setValue("taxAmount", totals.taxAmount);
    setValue("total", totals.total);
  }, [totals, setValue]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          vendorsRes,
          projectsRes,
          activitiesRes,
          taxCodesRes,
          chartAccountsRes,
        ] = await Promise.all([
          fetch("/api/vendors"),
          fetch("/api/projects"),
          fetch("/api/activities"),
          fetch("/api/tax-codes"),
          fetch("/api/chart-accounts"),
        ]);

        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          setVendors(vendorsData.vendors || []);
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects || []);
        }

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.activities || []);
        }

        if (taxCodesRes.ok) {
          const taxCodesData = await taxCodesRes.json();
          setTaxCodes(taxCodesData.taxCodes || []);
        }

        if (chartAccountsRes.ok) {
          const chartAccountsData = await chartAccountsRes.json();
          setChartAccounts(chartAccountsData.accounts || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch invoice data if editing
  useEffect(() => {
    if (invoiceId) {
      const fetchInvoice = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/purchase-invoices/${invoiceId}`);
          if (response.ok) {
            const invoice = await response.json();
            reset({
              number: invoice.number,
              status: invoice.status,
              date: invoice.date.split("T")[0],
              dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
              ref: invoice.ref || "",
              poNumber: invoice.poNumber || "",
              vendorId: invoice.vendorId,
              projectId: invoice.projectId || "",
              subtotal: invoice.subtotal,
              taxAmount: invoice.taxAmount,
              total: invoice.total,
              paidAmount: invoice.paidAmount,
              currency: invoice.currency,
              paymentTerms: invoice.paymentTerms || "",
              discountPercent: invoice.discountPercent || 0,
              discountAmount: invoice.discountAmount || 0,
              notes: invoice.notes || "",
              internalNotes: invoice.internalNotes || "",
              lines: invoice.lines.map((line: any) => ({
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                amount: line.amount,
                taxCodeId: line.taxCodeId || "",
                taxRate: line.taxRate || 0,
                taxAmount: line.taxAmount || 0,
                totalAmount: line.totalAmount,
                activityId: line.activityId || "",
                subActivityId: line.subActivityId || "",
                costCategory: line.costCategory || "M",
                revenueAccountId: line.revenueAccountId || "",
                sortOrder: line.sortOrder || 0,
              })),
            });
          } else {
            toast.error("Erreur lors du chargement de la facture");
            router.push("/dashboard/purchase-invoices");
          }
        } catch (error) {
          console.error("Error fetching invoice:", error);
          toast.error("Erreur lors du chargement de la facture");
        } finally {
          setLoading(false);
        }
      };

      fetchInvoice();
    }
  }, [invoiceId, reset, router]);

  const onSubmit = async (data: PurchaseInvoiceFormData) => {
    try {
      setSaving(true);
      const url = invoiceId
        ? `/api/purchase-invoices/${invoiceId}`
        : "/api/purchase-invoices";
      const method = invoiceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          invoiceId ? "Facture d'achat mise à jour" : "Facture d'achat créée"
        );
        router.push("/dashboard/purchase-invoices");
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

  const addLine = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxAmount: 0,
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

  const updateLineAmount = (index: number, field: string, value: number) => {
    const lines = [...watchedLines];
    lines[index] = { ...lines[index], [field]: value };

    if (field === "quantity" || field === "unitPrice") {
      const amount = lines[index].quantity * lines[index].unitPrice;
      lines[index].amount = amount;
    }

    if (field === "amount" || field === "taxAmount") {
      lines[index].totalAmount = lines[index].amount + lines[index].taxAmount;
    }

    setValue("lines", lines);
  };

  const getCostCategoryLabel = (category: string) => {
    switch (category) {
      case "M":
        return "Matériaux";
      case "S":
        return "Sous-traitance";
      case "D":
        return "Divers";
      case "E":
        return "Équipement";
      case "MOD":
        return "Main d'œuvre directe";
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Numéro de facture *</Label>
              <Input
                id="number"
                {...register("number")}
                placeholder="FAC-2024-001"
                className="bg-white"
              />
              {errors.number && (
                <p className="text-sm text-red-600">{errors.number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="SENT">Envoyée</SelectItem>
                  <SelectItem value="PAID">Payée</SelectItem>
                  <SelectItem value="CANCELLED">Annulée</SelectItem>
                  <SelectItem value="OVERDUE">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className="bg-white"
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref">Référence</Label>
              <Input
                id="ref"
                {...register("ref")}
                placeholder="REF-001"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poNumber">Numéro de commande</Label>
              <Input
                id="poNumber"
                {...register("poNumber")}
                placeholder="PO-2024-001"
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Fournisseur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="vendorId">Fournisseur *</Label>
            <Select
              value={watch("vendorId")}
              onValueChange={(value) => setValue("vendorId", value)}
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
            {errors.vendorId && (
              <p className="text-sm text-red-600">{errors.vendorId.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Projet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="projectId">Projet</Label>
            <Select
              value={watch("projectId")}
              onValueChange={(value) => setValue("projectId", value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sélectionner un projet (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun projet</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Articles
            </div>
            <Button type="button" onClick={addLine} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un article
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Taxe</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Input
                      {...register(`lines.${index}.description`)}
                      placeholder="Description de l'article"
                      className="bg-white"
                    />
                    {errors.lines?.[index]?.description && (
                      <p className="text-sm text-red-600">
                        {errors.lines[index]?.description?.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      onChange={(e) =>
                        updateLineAmount(
                          index,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                      onChange={(e) =>
                        updateLineAmount(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={watchedLines[index]?.amount || 0}
                      readOnly
                      className="bg-gray-50"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.taxAmount`, {
                        valueAsNumber: true,
                      })}
                      onChange={(e) =>
                        updateLineAmount(
                          index,
                          "taxAmount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={watchedLines[index]?.totalAmount || 0}
                      readOnly
                      className="bg-gray-50"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={watch(`lines.${index}.costCategory`)}
                      onValueChange={(value) =>
                        setValue(`lines.${index}.costCategory`, value as any)
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Matériaux</SelectItem>
                        <SelectItem value="S">Sous-traitance</SelectItem>
                        <SelectItem value="D">Divers</SelectItem>
                        <SelectItem value="E">Équipement</SelectItem>
                        <SelectItem value="MOD">
                          Main d'œuvre directe
                        </SelectItem>
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
          {errors.lines && (
            <p className="text-sm text-red-600 mt-2">{errors.lines.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
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
                value={totals.subtotal.toFixed(2)}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Taxes</Label>
              <Input
                value={totals.taxAmount.toFixed(2)}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                value={totals.total.toFixed(2)}
                readOnly
                className="bg-gray-50 font-semibold"
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
            <Label htmlFor="notes">Notes publiques</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Notes visibles sur la facture"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internalNotes">Notes internes</Label>
            <Textarea
              id="internalNotes"
              {...register("internalNotes")}
              placeholder="Notes internes (non visibles sur la facture)"
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/purchase-invoices")}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Sauvegarde..." : invoiceId ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
