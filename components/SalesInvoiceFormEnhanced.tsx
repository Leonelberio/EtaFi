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
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salesInvoiceSchema } from "@/lib/validations";
import { z } from "zod";
import { format } from "date-fns";

// --- Interfaces ---
interface Customer {
  id: string;
  name: string;
  email?: string | null;
  paymentTerms?: string | null;
}

interface Project {
  id: string;
  code: string;
  name: string;
  invoicePrefix?: string | null;
  lastInvoiceNumber?: number | null;
}

interface Activity {
  id: string;
  code: string;
  name: string;
  projectId: string;
  isBillingDefault?: boolean;
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

type SalesInvoiceFormData = z.infer<typeof salesInvoiceSchema>;

interface SalesInvoiceFormProps {
  invoice?: any;
  customers?: Customer[];
  projects?: Project[];
  chartAccounts?: ChartAccount[];
  taxCodes?: TaxCode[];
  isEditing?: boolean;
}

export function SalesInvoiceFormEnhanced({
  invoice,
  customers: initialCustomers = [],
  projects: initialProjects = [],
  chartAccounts: initialChartAccounts = [],
  taxCodes: initialTaxCodes = [],
  isEditing = false,
}: SalesInvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [chartAccounts, setChartAccounts] =
    useState<ChartAccount[]>(initialChartAccounts);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>(initialTaxCodes);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const form = useForm<SalesInvoiceFormData>({
    resolver: zodResolver(salesInvoiceSchema),
    mode: "onChange",
    defaultValues: {
      status: "DRAFT",
      date: format(new Date(), "yyyy-MM-dd"),
      entryDate: format(new Date(), "yyyy-MM-dd"),
      currency: "CAD",
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      paidAmount: 0,
      approvalStatus: "PENDING",
      lines: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          totalAmount: 0,
          revenueType: "CONTRACTUAL",
          revenueGroup: "CONSTRUCTION",
          projectId: "",
          revenueAccountId: "",
        },
      ],
      ...(invoice && {
        ...invoice,
        date: invoice.date ? format(new Date(invoice.date), "yyyy-MM-dd") : "",
        entryDate: invoice.entryDate
          ? format(new Date(invoice.entryDate), "yyyy-MM-dd")
          : "",
        dueDate: invoice.dueDate
          ? format(new Date(invoice.dueDate), "yyyy-MM-dd")
          : undefined,
        subtotal: parseFloat(invoice.subtotal),
        taxAmount: parseFloat(invoice.taxAmount),
        total: parseFloat(invoice.total),
        paidAmount: parseFloat(invoice.paidAmount),
        withholdingPercent: invoice.withholdingPercent
          ? parseFloat(invoice.withholdingPercent)
          : undefined,
        withholdingAmount: invoice.withholdingAmount
          ? parseFloat(invoice.withholdingAmount)
          : undefined,
        gstAmount: invoice.gstAmount
          ? parseFloat(invoice.gstAmount)
          : undefined,
        qstAmount: invoice.qstAmount
          ? parseFloat(invoice.qstAmount)
          : undefined,
        lines: invoice.lines.map((line: any) => ({
          ...line,
          quantity: parseFloat(line.quantity),
          unitPrice: parseFloat(line.unitPrice),
          amount: parseFloat(line.amount),
          taxRate: line.taxRate ? parseFloat(line.taxRate) : undefined,
          taxAmount: line.taxAmount ? parseFloat(line.taxAmount) : undefined,
          totalAmount: parseFloat(line.totalAmount),
        })),
      }),
    },
  });

  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
    getValues,
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const watchedFields = watch();
  const {
    customerId,
    projectId,
    withholdingPercent,
    withholdingAmount,
    lines,
  } = watchedFields;

  // Charger les activités du projet
  const loadActivities = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      setActivities([]);
    }
  };

  // Charger les sous-activités
  const loadSubActivities = async (activityId: string) => {
    try {
      const response = await fetch(
        `/api/activities/${activityId}/sub-activities`
      );
      if (response.ok) {
        const data = await response.json();
        setSubActivities(data);
      } else {
        setSubActivities([]);
      }
    } catch (error) {
      console.error("Error loading sub-activities:", error);
      setSubActivities([]);
    }
  };

  // Gérer sélection client
  useEffect(() => {
    if (customerId) {
      const customer = customers.find((c) => c.id === customerId);
      setSelectedCustomer(customer || null);
    }
  }, [customerId, customers]);

  // Générer numéro de facture
  const generateInvoiceNumber = async () => {
    if (isEditing) return;

    const projectId = form.getValues("projectId");
    if (!projectId) {
      toast.error("Veuillez d'abord sélectionner un projet");
      return;
    }

    setIsGeneratingNumber(true);
    try {
      const response = await fetch("/api/invoices/generate-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        form.setValue("number", data.invoiceNumber);
        toast.success(`Numéro généré : ${data.invoiceNumber}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de la génération du numéro");
      }
    } catch (error) {
      console.error("Error generating invoice number:", error);
      toast.error("Erreur lors de la génération du numéro");
    } finally {
      setIsGeneratingNumber(false);
    }
  };

  // Calculer date d'échéance
  const calculateDueDate = (invoiceDate: string, paymentTerms: string) => {
    if (!invoiceDate || !paymentTerms) return;

    const match = paymentTerms.match(/(\d+)/);
    if (match) {
      const days = parseInt(match[1]);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + days);
      setValue("dueDate", format(dueDate, "yyyy-MM-dd"));
    }
  };

  // Calculs automatiques
  useEffect(() => {
    let totalSubtotal = 0;
    let totalGST = 0;
    let totalQST = 0;

    lines.forEach((line, index) => {
      const quantity = line.quantity || 0;
      const unitPrice = line.unitPrice || 0;
      const lineAmount = quantity * unitPrice;

      // Mise à jour du montant de ligne
      form.setValue(`lines.${index}.amount`, lineAmount, {
        shouldValidate: false,
      });

      totalSubtotal += lineAmount;

      // IMPORTANT: Les taxes sont calculées APRÈS déduction de la retenue (selon votre spécification)
      // Taxes TPS 5% et TVQ 9.975%
      const gst = lineAmount * 0.05;
      const qst = lineAmount * 0.09975;

      totalGST += gst;
      totalQST += qst;

      const lineTaxAmount = gst + qst;
      form.setValue(`lines.${index}.taxAmount`, lineTaxAmount, {
        shouldValidate: false,
      });

      const lineTotalAmount = lineAmount + lineTaxAmount;
      form.setValue(`lines.${index}.totalAmount`, lineTotalAmount, {
        shouldValidate: false,
      });
    });

    // Calculer la retenue AVANT les taxes
    const subtotalAfterWithholding = totalSubtotal;
    const withholdingPct = withholdingPercent || 0;
    const withholdingAmt = withholdingAmount || 0;
    const calculatedWithholding =
      withholdingPct > 0
        ? (totalSubtotal * withholdingPct) / 100
        : withholdingAmt;

    // Recalculer les taxes sur le montant APRÈS retenue
    const taxableAmount = totalSubtotal - calculatedWithholding;
    const finalGST = taxableAmount * 0.05;
    const finalQST = taxableAmount * 0.09975;
    const finalTotalTax = finalGST + finalQST;

    const totalTTC = totalSubtotal + finalTotalTax;
    const balanceDue = totalTTC - calculatedWithholding;

    form.setValue("subtotal", totalSubtotal, { shouldValidate: false });
    form.setValue("gstAmount", finalGST, { shouldValidate: false });
    form.setValue("qstAmount", finalQST, { shouldValidate: false });
    form.setValue("taxAmount", finalTotalTax, { shouldValidate: false });
    form.setValue("totalWithholding", calculatedWithholding, {
      shouldValidate: false,
    });
    form.setValue("total", totalTTC, { shouldValidate: false });
    form.setValue("balanceDue", balanceDue, { shouldValidate: false });
  }, [lines, withholdingPercent, withholdingAmount, form]);

  // Soumission
  const onSubmit = async (data: SalesInvoiceFormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/invoices/sales/${invoice?.id}`
        : "/api/invoices/sales";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          `✅ Facture de vente ${isEditing ? "modifiée" : "créée"} avec succès`
        );
        router.push("/dashboard/invoices");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error submitting sales invoice:", error);
      toast.error("Erreur lors de l'enregistrement de la facture");
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une ligne
  const addLine = () => {
    const projectId = form.getValues("projectId");
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      totalAmount: 0,
      revenueType: "CONTRACTUAL",
      revenueGroup: "CONSTRUCTION",
      projectId: projectId || "",
      revenueAccountId: "",
      sortOrder: fields.length,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* EN-TÊTE - Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            En-tête de facture de vente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Ligne 1: Numéro, Client, Projet/Contrat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Numéro de facture *</Label>
              <div className="relative">
                <Input
                  {...form.register("number")}
                  placeholder={
                    isGeneratingNumber
                      ? "Génération..."
                      : "AUTO (sélectionner projet)"
                  }
                  className="bg-white"
                  readOnly={!isEditing}
                />
                {isGeneratingNumber && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>
              {errors.number && (
                <p className="text-sm text-red-600">{errors.number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">Client *</Label>
              <Select
                value={form.watch("customerId") || ""}
                onValueChange={(value) => {
                  form.setValue("customerId", value);
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Sélectionner le client" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-sm text-red-600">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Projet / Contrat *</Label>
              <Select
                value={form.watch("projectId") || ""}
                onValueChange={async (value) => {
                  form.setValue("projectId", value);
                  loadActivities(value);

                  // Auto-générer le numéro quand un projet est sélectionné
                  if (!isEditing && value) {
                    await generateInvoiceNumber();
                  }

                  // Charger l'activité de facturation par défaut
                  if (value) {
                    try {
                      const response = await fetch(
                        `/api/projects/${value}/billing-activity`
                      );
                      if (response.ok) {
                        const { activity } = await response.json();
                        if (activity) {
                          const currentLines = form.getValues("lines");
                          currentLines.forEach((_, index) => {
                            form.setValue(
                              `lines.${index}.activityId`,
                              activity.id
                            );
                          });
                          toast.success(
                            `Activité par défaut appliquée : ${activity.name}`
                          );
                        }
                      }
                    } catch (error) {
                      console.error("Error loading billing activity:", error);
                    }
                  }

                  // Appliquer le projet à toutes les lignes
                  const currentLines = form.getValues("lines");
                  currentLines.forEach((_, index) => {
                    form.setValue(`lines.${index}.projectId`, value);
                  });
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Sélectionner projet/contrat" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.code} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-sm text-red-600">
                  {errors.projectId.message}
                </p>
              )}
            </div>
          </div>

          {/* Ligne 2: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date facture (comptable) *</Label>
              <Input
                type="date"
                {...form.register("date")}
                onChange={(e) => {
                  form.setValue("date", e.target.value);
                  const paymentTerms = form.getValues("paymentTerms");
                  if (paymentTerms) {
                    calculateDueDate(e.target.value, paymentTerms);
                  }
                }}
                className="bg-white"
              />
              <p className="text-xs text-gray-600">📅 Date au Grand Livre</p>
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
              <Label>Conditions de paiement</Label>
              <Input
                {...form.register("paymentTerms")}
                placeholder="Net 30"
                onChange={(e) => {
                  form.setValue("paymentTerms", e.target.value);
                  const invoiceDate = form.getValues("date");
                  calculateDueDate(invoiceDate, e.target.value);
                }}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Échéance paiement</Label>
              <Input
                type="date"
                {...form.register("dueDate")}
                className="bg-white"
              />
              <p className="text-xs text-gray-600">
                ⏰ Calculée automatiquement
              </p>
            </div>
          </div>

          {/* Ligne 3: Retenue contractuelle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
            <div className="space-y-2">
              <Label>Retenue contractuelle (%)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("withholdingPercent", {
                  valueAsNumber: true,
                })}
                placeholder="10.00"
                className="bg-white"
              />
              <p className="text-xs text-gray-600">
                💰 Retenue jusqu&apos;à fin des travaux
              </p>
            </div>

            <div className="space-y-2">
              <Label>Retenue en montant ($)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("withholdingAmount", { valueAsNumber: true })}
                placeholder="0.00"
                className="bg-white"
              />
              <p className="text-xs text-gray-600">
                💵 Montant fixe alternatif
              </p>
            </div>

            <div className="space-y-2">
              <Label>Numéro de contrat</Label>
              <Input
                {...form.register("contractNumber")}
                placeholder="CT-2025-001"
                className="bg-white"
              />
              <p className="text-xs text-gray-600">📋 Référence contrat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LIGNES DE FACTURATION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lignes de facturation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[300px]">Description *</TableHead>
                  <TableHead className="w-[100px] text-center">Qté</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Prix unit.
                  </TableHead>
                  <TableHead className="w-[150px]">Type revenu *</TableHead>
                  <TableHead className="w-[150px]">Groupe revenu *</TableHead>
                  <TableHead className="w-[150px]">Activité</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Montant HT
                  </TableHead>
                  <TableHead className="w-[100px] text-right">Taxes</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Total TTC
                  </TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const quantity = form.watch(`lines.${index}.quantity`) || 0;
                  const unitPrice = form.watch(`lines.${index}.unitPrice`) || 0;
                  const amount = quantity * unitPrice;
                  const gst = amount * 0.05;
                  const qst = amount * 0.09975;
                  const taxAmount = gst + qst;
                  const totalAmount = amount + taxAmount;

                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Input
                          {...form.register(`lines.${index}.description`)}
                          placeholder="Description du lot ou service"
                          className="bg-white"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`lines.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          className="bg-white text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`lines.${index}.unitPrice`, {
                            valueAsNumber: true,
                          })}
                          className="bg-white text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={form.watch(`lines.${index}.revenueType`)}
                          onValueChange={(value) =>
                            form.setValue(
                              `lines.${index}.revenueType`,
                              value as any
                            )
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONTRACTUAL">
                              Revenus contractuels
                            </SelectItem>
                            <SelectItem value="ADDITIONAL">
                              Revenus supplémentaires
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={form.watch(`lines.${index}.revenueGroup`)}
                          onValueChange={(value) =>
                            form.setValue(
                              `lines.${index}.revenueGroup`,
                              value as any
                            )
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONSTRUCTION">
                              Revenu construction
                            </SelectItem>
                            <SelectItem value="SERVICES">
                              Revenu services
                            </SelectItem>
                            <SelectItem value="EQUIPMENT">
                              Revenu équipements
                            </SelectItem>
                            <SelectItem value="OTHER">Divers</SelectItem>
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
                            }
                          }}
                        >
                          <SelectTrigger className="bg-white">
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
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm text-green-700">
                          {formatCurrency(taxAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          TPS: {formatCurrency(gst)}
                        </div>
                        <div className="text-xs text-gray-500">
                          TVQ: {formatCurrency(qst)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-700">
                        {formatCurrency(totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addLine}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ligne
          </Button>
        </CardContent>
      </Card>

      {/* TOTAUX AUTOMATIQUES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Totaux automatiques
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total avant taxes</span>
                <span className="font-semibold">
                  {formatCurrency(form.watch("subtotal"))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TPS (5%)</span>
                <span className="text-green-700">
                  {formatCurrency(form.watch("gstAmount") || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVQ (9.975%)</span>
                <span className="text-green-700">
                  {formatCurrency(form.watch("qstAmount") || 0)}
                </span>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-3">
              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold">Total TTC (grand total)</span>
                <span className="font-bold text-lg">
                  {formatCurrency(form.watch("total"))}
                </span>
              </div>
              {(form.watch("totalWithholding") || 0) > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Retenue contractuelle</span>
                  <span className="font-semibold">
                    - {formatCurrency(form.watch("totalWithholding") || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t bg-green-50 -mx-6 px-6 py-3 rounded-lg">
                <span className="font-bold text-green-900">
                  Solde à recevoir
                </span>
                <span className="font-bold text-2xl text-green-700">
                  {formatCurrency(
                    form.watch("balanceDue") || form.watch("total")
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WORKFLOW & NOTES */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow & Notes</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut de la facture</Label>
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

            <div className="space-y-2">
              <Label>Mode d&apos;envoi</Label>
              <Select
                value={form.watch("paymentMethod") || ""}
                onValueChange={(value) => form.setValue("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">PDF par courriel</SelectItem>
                  <SelectItem value="MAIL">Courrier postal</SelectItem>
                  <SelectItem value="PORTAL">Portail client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes internes</Label>
            <Textarea
              {...form.register("internalNotes")}
              placeholder="Notes pour communication interne (ex: facturé sur approbation client)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes client (visibles sur facture)</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Notes visibles par le client"
              rows={2}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* BOUTONS D'ACTION */}
      <div className="flex gap-4 justify-end pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.setValue("status", "DRAFT");
            form.handleSubmit(onSubmit)();
          }}
          disabled={loading}
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          Sauvegarder brouillon
        </Button>

        <Button
          type="submit"
          disabled={loading || (form.watch("balanceDue") || 0) <= 0}
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
