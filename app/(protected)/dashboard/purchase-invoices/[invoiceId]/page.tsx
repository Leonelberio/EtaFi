import { getCurrentOrgId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PurchaseInvoiceViewPageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function PurchaseInvoiceViewPage({
  params,
}: PurchaseInvoiceViewPageProps) {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/dashboard/organizations");
  }

  const { invoiceId } = await params;

  const invoice = await db.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId: orgId,
      type: "PURCHASE",
    },
    include: {
      vendor: {
        select: {
          id: true,
          code: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          withholdingRate: true,
        },
      },
      project: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      lines: {
        orderBy: { sortOrder: "asc" },
        include: {
          project: {
            select: { code: true, name: true },
          },
          activity: {
            select: { code: true, name: true },
          },
          subActivity: {
            select: { code: true, name: true },
          },
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      poster: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "Brouillon", variant: "secondary" as const },
      PENDING_APPROVAL: {
        label: "En attente d'approbation",
        variant: "default" as const,
      },
      APPROVED: { label: "Approuvée", variant: "default" as const },
      POSTED: { label: "Comptabilisée", variant: "default" as const },
      PAID: { label: "Payée", variant: "default" as const },
      CANCELLED: { label: "Annulée", variant: "destructive" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getApprovalBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "En attente", variant: "secondary" as const },
      APPROVED: { label: "Approuvée", variant: "default" as const },
      REJECTED: { label: "Rejetée", variant: "destructive" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/purchase-invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Facture d&apos;achat #{invoice.number}
            </h1>
            <p className="text-gray-600">{invoice.vendor?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status !== "POSTED" && invoice.status !== "PAID" && (
            <Link href={`/dashboard/purchase-invoices/${invoice.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Status & Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Statut</p>
              <div className="flex items-center gap-2">
                {getStatusBadge(invoice.status)}
                {getApprovalBadge(invoice.approvalStatus || "PENDING")}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date comptable</p>
              <p className="font-semibold">
                {format(new Date(invoice.date), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
            {invoice.actualDate && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Date réelle</p>
                <p className="font-semibold">
                  {format(new Date(invoice.actualDate), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </p>
              </div>
            )}
            {invoice.dueDate && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Échéance</p>
                <p className="font-semibold">
                  {format(new Date(invoice.dueDate), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </p>
              </div>
            )}
            {invoice.poNumber && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Numéro de commande</p>
                <p className="font-semibold">{invoice.poNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vendor & Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Fournisseur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Code</p>
              <p className="font-semibold">{invoice.vendor?.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-semibold">{invoice.vendor?.name}</p>
            </div>
            {invoice.vendor?.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p>{invoice.vendor.email}</p>
              </div>
            )}
            {invoice.vendor?.phone && (
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p>{invoice.vendor.phone}</p>
              </div>
            )}
            {invoice.vendor?.withholdingRate && (
              <div>
                <p className="text-sm text-gray-600">Taux de retenue</p>
                <p className="font-semibold">
                  {Number(invoice.vendor.withholdingRate)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Projet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Code</p>
              <p className="font-semibold">{invoice.project?.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-semibold">{invoice.project?.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Lines */}
      <Card>
        <CardHeader>
          <CardTitle>Lignes de facture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 text-sm font-semibold">
                    Description
                  </th>
                  <th className="text-center p-3 text-sm font-semibold">Qté</th>
                  <th className="text-right p-3 text-sm font-semibold">
                    Prix unit.
                  </th>
                  <th className="text-center p-3 text-sm font-semibold">
                    Groupe
                  </th>
                  <th className="text-right p-3 text-sm font-semibold">
                    Montant
                  </th>
                  <th className="text-right p-3 text-sm font-semibold">
                    Taxes
                  </th>
                  <th className="text-right p-3 text-sm font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line) => (
                  <tr key={line.id} className="border-b">
                    <td className="p-3">
                      <p className="font-medium">{line.description}</p>
                      {line.activity && (
                        <p className="text-sm text-gray-600">
                          {line.activity.code} - {line.activity.name}
                        </p>
                      )}
                      {line.subActivity && (
                        <p className="text-xs text-gray-500">
                          {line.subActivity.code} - {line.subActivity.name}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-center">{Number(line.quantity)}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(Number(line.unitPrice))}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">{line.costCategory}</Badge>
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatCurrency(Number(line.amount))}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(Number(line.taxAmount || 0))}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatCurrency(Number(line.totalAmount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Résumé financier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total avant taxes</span>
              <span className="font-semibold">
                {formatCurrency(Number(invoice.subtotal))}
              </span>
            </div>
            {invoice.gstAmount && Number(invoice.gstAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">TPS (5%)</span>
                <span>{formatCurrency(Number(invoice.gstAmount))}</span>
              </div>
            )}
            {invoice.qstAmount && Number(invoice.qstAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">TVQ (9.975%)</span>
                <span>{formatCurrency(Number(invoice.qstAmount))}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t">
              <span className="text-gray-600">Total TTC</span>
              <span className="font-bold text-lg">
                {formatCurrency(Number(invoice.total))}
              </span>
            </div>
            {invoice.totalWithholding &&
              Number(invoice.totalWithholding) > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Retenue contractuelle</span>
                  <span className="font-semibold">
                    - {formatCurrency(Number(invoice.totalWithholding))}
                  </span>
                </div>
              )}
            <div className="flex justify-between pt-3 border-t bg-green-50 -mx-6 px-6 py-3 rounded-lg">
              <span className="font-bold text-green-900">Solde à payer</span>
              <span className="font-bold text-xl text-green-700">
                {formatCurrency(Number(invoice.balanceDue || invoice.total))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Piste d&apos;audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoice.creator && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Créé par</span>
              </div>
              <div className="text-right">
                <p className="font-medium">{invoice.creator.name}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(invoice.createdAt), "d MMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          )}
          {invoice.approver && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {invoice.approvalStatus === "APPROVED" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm text-gray-600">
                  {invoice.approvalStatus === "APPROVED"
                    ? "Approuvé par"
                    : "Rejeté par"}
                </span>
              </div>
              <div className="text-right">
                <p className="font-medium">{invoice.approver.name}</p>
              </div>
            </div>
          )}
          {invoice.poster && invoice.postedAt && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Comptabilisé par</span>
              </div>
              <div className="text-right">
                <p className="font-medium">{invoice.poster.name}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(invoice.postedAt), "d MMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {(invoice.notes || invoice.internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoice.notes && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Notes publiques
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.internalNotes && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Notes internes
                </p>
                <p className="text-gray-700 whitespace-pre-wrap bg-yellow-50 p-3 rounded">
                  {invoice.internalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
