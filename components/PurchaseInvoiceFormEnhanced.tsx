"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Upload,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";

// Validation schemas
const invoiceLineSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.number().min(0, "Quantité invalide"),
  unitPrice: z.number().min(0, "Prix unitaire invalide"),
  amount: z.number().min(0),
  projectId: z.string().min(1, "Projet obligatoire"),
  activityId: z.string().optional(),
  subActivityId: z.string().optional(),
  costGroup: z.enum(["M", "S", "D", "E", "MOD"], {
    required_error: "Groupe de coût obligatoire",
  }),
  glAccountId: z.string().optional(),
  taxCodeId: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  taxAmount: z.number().min(0).default(0),
  gstAmount: z.number().min(0).default(0),
  qstAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
});

const purchaseInvoiceSchema = z.object({
  // En-tête obligatoire
  number: z.string().min(1, "Numéro de facture fournisseur OBLIGATOIRE"),
  vendorId: z.string().min(1, "Fournisseur obligatoire"),
  projectId: z.string().min(1, "Projet OBLIGATOIRE"),

  // Dates (conformité NCECF)
  date: z.string().min(1, "Date comptable obligatoire"),
  actualDate: z.string().optional(),
  dueDate: z.string().optional(),

  // Références
  poNumber: z.string().optional(),
  ref: z.string().optional(),

  // Retenues
  withholdingPercent: z.number().min(0).max(100).optional(),
  withholdingAmount: z.number().min(0).optional(),

  // Workflow
  status: z
    .enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "POSTED", "PAID"])
    .default("DRAFT"),
  approvalStatus: z
    .enum(["PENDING", "APPROVED", "REJECTED"])
    .default("PENDING"),
  department: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentTerms: z.string().optional(),

  // Notes
  notes: z.string().optional(),
  internalNotes: z.string().optional(),

  // Montants (calculés automatiquement)
  subtotal: z.number().min(0).default(0),
  gstAmount: z.number().min(0).default(0),
  qstAmount: z.number().min(0).default(0),
  hstAmount: z.number().min(0).default(0),
  otherTaxes: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  totalWithholding: z.number().min(0).default(0),
  total: z.number().min(0.01, "Le montant total doit être > 0"),
  balanceDue: z.number().min(0).default(0),

  // Lignes
  lines: z.array(invoiceLineSchema).min(1, "Au moins une ligne requise"),
});

type PurchaseInvoiceFormData = z.infer<typeof purchaseInvoiceSchema>;

interface Vendor {
  id: string;
  code: string;
  name: string;
  payableAccountId?: string | null;
  defaultCostGroup?: string | null;
  withholdingRate?: number | null;
  taxable?: boolean;
  taxExempt?: boolean;
}

interface ChartAccount {
  id: string;
  number: string;
  name: string;
  type: string;
}

interface Project {
  id: string;
  code: string;
  name: string;
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

interface TaxCode {
  id: string;
  code: string;
  name: string;
  rate: number;
}

interface PurchaseInvoiceFormEnhancedProps {
  vendors: Vendor[];
  projects: Project[];
  chartAccounts: ChartAccount[];
  taxCodes: TaxCode[];
  invoice?: any;
  isEditing?: boolean;
}

export function PurchaseInvoiceFormEnhanced({
  vendors,
  projects,
  chartAccounts,
  taxCodes,
  invoice,
  isEditing = false,
}: PurchaseInvoiceFormEnhancedProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const form = useForm<PurchaseInvoiceFormData>({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: {
      status: "DRAFT",
      approvalStatus: "PENDING",
      date: new Date().toISOString().split("T")[0],
      actualDate: new Date().toISOString().split("T")[0],
      subtotal: 0,
      gstAmount: 0,
      qstAmount: 0,
      hstAmount: 0,
      otherTaxes: 0,
      taxAmount: 0,
      totalWithholding: 0,
      total: 0,
      balanceDue: 0,
      lines: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          projectId: "",
          costGroup: "M" as const,
          taxAmount: 0,
          gstAmount: 0,
          qstAmount: 0,
          totalAmount: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Calculer automatiquement les totaux
  useEffect(() => {
    const subscription = form.watch((value) => {
      let subtotal = 0;
      let totalGST = 0;
      let totalQST = 0;

      value.lines?.forEach((line) => {
        const lineAmount = (line?.quantity || 0) * (line?.unitPrice || 0);
        subtotal += lineAmount;

        // Calculer TPS (5%) et TVQ (9.975%)
        const gst = lineAmount * 0.05;
        const qst = lineAmount * 0.09975;

        totalGST += gst;
        totalQST += qst;
      });

      const totalTax = totalGST + totalQST;
      const totalBeforeWithholding = subtotal + totalTax;

      // Calculer retenue
      const withholdingPercent = value.withholdingPercent || 0;
      const withholdingAmount = value.withholdingAmount || 0;
      const calculatedWithholding =
        withholdingPercent > 0
          ? (subtotal * withholdingPercent) / 100
          : withholdingAmount;

      const balanceDue = totalBeforeWithholding - calculatedWithholding;

      form.setValue("subtotal", subtotal, { shouldValidate: false });
      form.setValue("gstAmount", totalGST, { shouldValidate: false });
      form.setValue("qstAmount", totalQST, { shouldValidate: false });
      form.setValue("taxAmount", totalTax, { shouldValidate: false });
      form.setValue("totalWithholding", calculatedWithholding, {
        shouldValidate: false,
      });
      form.setValue("total", totalBeforeWithholding, { shouldValidate: false });
      form.setValue("balanceDue", balanceDue, { shouldValidate: false });
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Charger activités quand projet change
  const loadActivities = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  // Charger sous-activités quand activité change
  const loadSubActivities = async (activityId: string) => {
    try {
      const response = await fetch(
        `/api/activities/${activityId}/sub-activities`
      );
      if (response.ok) {
        const data = await response.json();
        setSubActivities(data || []);
      }
    } catch (error) {
      console.error("Error loading sub-activities:", error);
    }
  };

  // Gérer sélection fournisseur
  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    setSelectedVendor(vendor || null);

    if (vendor) {
      // Pré-remplir la retenue si définie
      if (vendor.withholdingRate) {
        form.setValue("withholdingPercent", vendor.withholdingRate);
      }

      // Pré-remplir le groupe de coût par défaut dans les lignes
      if (vendor.defaultCostGroup) {
        const currentLines = form.getValues("lines");
        currentLines.forEach((_, index) => {
          form.setValue(
            `lines.${index}.costGroup`,
            vendor.defaultCostGroup as any
          );
        });
      }

      toast.success(
        `Fournisseur sélectionné : ${vendor.code} - ${vendor.name}`
      );
    }
  };

  // Calculer échéance automatiquement
  const calculateDueDate = (invoiceDate: string, paymentTerms: string) => {
    if (!invoiceDate || !paymentTerms) return;

    const match = paymentTerms.match(/(\d+)/);
    if (match) {
      const days = parseInt(match[1]);
      const date = new Date(invoiceDate);
      date.setDate(date.getDate() + days);
      form.setValue("dueDate", date.toISOString().split("T")[0]);
    }
  };

  const onSubmit = async (data: PurchaseInvoiceFormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/invoices/${invoice?.id}`
        : "/api/invoices/purchase";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type: "PURCHASE",
        }),
      });

      if (response.ok) {
        toast.success(
          `✅ Facture d'achat ${isEditing ? "modifiée" : "créée"} avec succès`
        );
        router.push("/dashboard/purchase-invoices");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(`❌ Erreur : ${error.error || "Échec de la sauvegarde"}`);
      }
    } catch (error) {
      console.error("Error saving purchase invoice:", error);
      toast.error("❌ Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const addLine = () => {
    const projectId = form.getValues("projectId");
    const defaultCostGroup = selectedVendor?.defaultCostGroup || "M";

    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      projectId: projectId || "",
      costGroup: defaultCostGroup as any,
      taxAmount: 0,
      gstAmount: 0,
      qstAmount: 0,
      totalAmount: 0,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* EN-TÊTE - Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            En-tête de facture d&apos;achat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Ligne 1: Numéro, Fournisseur, Projet */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Numéro facture fournisseur *</Label>
              <Input
                {...form.register("number")}
                placeholder="Ex: FAC-VENDOR-2024-001"
              />
              <p className="text-xs text-gray-600">
                ⚠️ Numéro EXACT de la facture du fournisseur
              </p>
              {form.formState.errors.number && (
                <p className="text-sm text-red-600 font-semibold">
                  {form.formState.errors.number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fournisseur *</Label>
              <Select
                value={form.watch("vendorId")}
                onValueChange={(value) => {
                  form.setValue("vendorId", value);
                  handleVendorChange(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {vendor.code}
                        </Badge>
                        {vendor.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedVendor && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {selectedVendor.code} - {selectedVendor.name}
                </p>
              )}
              {form.formState.errors.vendorId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.vendorId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Projet *</Label>
              <Select
                value={form.watch("projectId")}
                onValueChange={(value) => {
                  form.setValue("projectId", value);
                  loadActivities(value);

                  // Appliquer aux lignes existantes
                  const currentLines = form.getValues("lines");
                  currentLines.forEach((_, index) => {
                    form.setValue(`lines.${index}.projectId`, value);
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.code} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                📌 Bonne pratique comptable NCECF
              </p>
              {form.formState.errors.projectId && (
                <p className="text-sm text-red-600 font-semibold">
                  {form.formState.errors.projectId.message}
                </p>
              )}
            </div>
          </div>

          {/* Ligne 2: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date comptable *
              </Label>
              <Input type="date" {...form.register("date")} />
              <p className="text-xs text-gray-600">📅 Date au Grand Livre</p>
            </div>

            <div className="space-y-2">
              <Label>Date réelle facture</Label>
              <Input type="date" {...form.register("actualDate")} />
              <p className="text-xs text-gray-600">
                📄 Date imprimée par fournisseur
              </p>
            </div>

            <div className="space-y-2">
              <Label>Date d&apos;entrée</Label>
              <Input
                type="date"
                value={new Date().toISOString().split("T")[0]}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-600">
                🔒 Auto-générée (non modifiable)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Échéance paiement</Label>
              <Input type="date" {...form.register("dueDate")} />
              <p className="text-xs text-gray-600">
                ⏰ Calculée automatiquement
              </p>
            </div>
          </div>

          {/* Ligne 3: Références et retenue */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Numéro commande</Label>
              <Input {...form.register("poNumber")} placeholder="PO-2024-001" />
              <p className="text-xs text-gray-600">📋 Bon de commande lié</p>
            </div>

            <div className="space-y-2">
              <Label>Conditions paiement</Label>
              <Select
                value={form.watch("paymentTerms") || ""}
                onValueChange={(value) => {
                  form.setValue("paymentTerms", value);
                  const invoiceDate = form.getValues("date");
                  if (invoiceDate) {
                    calculateDueDate(invoiceDate, value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15 jours</SelectItem>
                  <SelectItem value="Net 30">Net 30 jours</SelectItem>
                  <SelectItem value="Net 60">Net 60 jours</SelectItem>
                  <SelectItem value="Net 90">Net 90 jours</SelectItem>
                  <SelectItem value="Immédiat">Paiement immédiat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Retenue (%)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("withholdingPercent", {
                  valueAsNumber: true,
                })}
                placeholder="10.00"
              />
              <p className="text-xs text-gray-600">
                💰 Ex: 10% retenue contractuelle
              </p>
            </div>

            <div className="space-y-2">
              <Label>Retenue ($)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("withholdingAmount", { valueAsNumber: true })}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-600">
                💵 Montant fixe alternatif
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LIGNES DE FACTURE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Lignes de saisie détaillées
            </div>
            <Button
              type="button"
              onClick={addLine}
              size="sm"
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[300px]">Description *</TableHead>
                  <TableHead className="w-[100px]">Qté *</TableHead>
                  <TableHead className="w-[120px]">Prix unit. *</TableHead>
                  <TableHead className="w-[120px]">Montant</TableHead>
                  <TableHead className="w-[150px]">Groupe *</TableHead>
                  <TableHead className="w-[150px]">Activité</TableHead>
                  <TableHead className="w-[120px]">TPS (5%)</TableHead>
                  <TableHead className="w-[120px]">TVQ (9.975%)</TableHead>
                  <TableHead className="w-[120px]">Total TTC</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const quantity = form.watch(`lines.${index}.quantity`) || 0;
                  const unitPrice = form.watch(`lines.${index}.unitPrice`) || 0;
                  const lineAmount = quantity * unitPrice;
                  const gst = lineAmount * 0.05;
                  const qst = lineAmount * 0.09975;
                  const lineTotal = lineAmount + gst + qst;

                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Textarea
                          {...form.register(`lines.${index}.description`)}
                          placeholder="Description article/service"
                          className="min-h-[60px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`lines.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`lines.${index}.unitPrice`, {
                            valueAsNumber: true,
                          })}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-blue-700">
                          {formatCurrency(lineAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={form.watch(`lines.${index}.costGroup`)}
                          onValueChange={(value) =>
                            form.setValue(
                              `lines.${index}.costGroup`,
                              value as any
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">M - Matériel</SelectItem>
                            <SelectItem value="S">
                              S - Sous-traitance
                            </SelectItem>
                            <SelectItem value="D">D - Divers</SelectItem>
                            <SelectItem value="E">E - Équipement</SelectItem>
                            <SelectItem value="MOD">
                              MOD - Main-d&apos;œuvre
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={
                            form.watch(`lines.${index}.activityId`) || "NONE"
                          }
                          onValueChange={(value) => {
                            const activityId =
                              value === "NONE" ? undefined : value;
                            form.setValue(
                              `lines.${index}.activityId`,
                              activityId
                            );
                            if (activityId) {
                              loadSubActivities(activityId);
                            } else {
                              form.setValue(
                                `lines.${index}.subActivityId`,
                                undefined
                              );
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Optionnel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">Aucune</SelectItem>
                            {activities.map((activity) => (
                              <SelectItem key={activity.id} value={activity.id}>
                                {activity.code} - {activity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-green-700">
                          {formatCurrency(gst)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-blue-700">
                          {formatCurrency(qst)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-lg text-gray-900">
                          {formatCurrency(lineTotal)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* TOTAUX AUTOMATIQUES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Totaux calculés automatiquement
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Sous-total avant taxes</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(form.watch("subtotal"))}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">TPS (5%)</p>
              <p className="text-xl font-semibold text-green-700">
                {formatCurrency(form.watch("gstAmount"))}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">TVQ (9.975%)</p>
              <p className="text-xl font-semibold text-blue-700">
                {formatCurrency(form.watch("qstAmount"))}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">Total taxes</p>
              <p className="text-xl font-semibold text-purple-700">
                {formatCurrency(form.watch("taxAmount"))}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">Total TTC</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(form.watch("total"))}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">Retenue calculée</p>
              <p className="text-xl font-semibold text-orange-700">
                - {formatCurrency(form.watch("totalWithholding"))}
              </p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-gray-600 font-semibold">
                SOLDE À PAYER
              </p>
              <p className="text-3xl font-bold text-green-700">
                {formatCurrency(form.watch("balanceDue"))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NOTES ET WORKFLOW */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Notes et workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Notes publiques</Label>
              <Textarea
                {...form.register("notes")}
                placeholder="Notes visibles par le fournisseur..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes internes</Label>
              <Textarea
                {...form.register("internalNotes")}
                placeholder="Notes internes comptable/approbateur..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <Select
                value={form.watch("paymentMethod") || ""}
                onValueChange={(value) => form.setValue("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHEQUE">Chèque</SelectItem>
                  <SelectItem value="VIREMENT">Virement bancaire</SelectItem>
                  <SelectItem value="CARTE">Carte de crédit</SelectItem>
                  <SelectItem value="COMPTANT">Comptant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Département</Label>
              <Input
                {...form.register("department")}
                placeholder="Ex: Administration"
              />
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">
                    En attente d&apos;approbation
                  </SelectItem>
                  <SelectItem value="APPROVED">Approuvée</SelectItem>
                  <SelectItem value="POSTED">Comptabilisée</SelectItem>
                  <SelectItem value="PAID">Payée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <div className="flex gap-4 justify-end pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => form.setValue("status", "DRAFT")}
          disabled={loading}
          className="border-gray-400"
        >
          Sauvegarder brouillon
        </Button>

        <Button
          type="submit"
          disabled={loading || form.watch("balanceDue") <= 0}
          className="bg-green-700 hover:bg-green-800 text-white"
        >
          {loading
            ? "Enregistrement..."
            : isEditing
              ? "Mettre à jour"
              : "Créer la facture"}
        </Button>
      </div>
    </form>
  );
}
