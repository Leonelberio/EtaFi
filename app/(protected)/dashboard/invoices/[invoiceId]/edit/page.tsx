import { Suspense } from "react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { FileText } from "lucide-react";

interface EditInvoicePageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function EditInvoicePage({
  params,
}: EditInvoicePageProps) {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/auth/login");
  }

  const { invoiceId } = await params;

  // Fetch invoice and related data in parallel
  const [invoice, chartAccounts, customers, vendors, projects, taxCodes] =
    await Promise.all([
      db.invoice.findFirst({
        where: {
          id: invoiceId,
          organizationId: orgId,
        },
        include: {
          lines: {
            include: {
              taxCode: {
                select: { id: true, code: true, name: true, rate: true },
              },
              activity: { select: { id: true, code: true, name: true } },
              revenueAccount: {
                select: { id: true, number: true, name: true },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
          customer: { select: { id: true, name: true } },
          vendor: { select: { id: true, name: true } },
          project: { select: { id: true, code: true, name: true } },
        },
      }),
      db.chartAccount.findMany({
        where: { organizationId: orgId },
        select: { id: true, number: true, name: true, type: true },
        orderBy: { number: "asc" },
      }),
      db.customer.findMany({
        where: { organizationId: orgId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      db.vendor.findMany({
        where: { organizationId: orgId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      db.project.findMany({
        where: { organizationId: orgId },
        select: { id: true, code: true, name: true },
        orderBy: { code: "asc" },
      }),
      db.taxCode
        .findMany({
          where: { organizationId: orgId },
          select: { id: true, code: true, name: true, rate: true },
          orderBy: { code: "asc" },
        })
        .then((taxCodes) =>
          taxCodes.map((tc) => ({
            ...tc,
            rate: Number(tc.rate),
          }))
        ),
    ]);

  if (!invoice) {
    notFound();
  }

  // Convert Decimal fields to numbers for client component
  const invoiceForClient = {
    ...invoice,
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.taxAmount),
    total: Number(invoice.total),
    paidAmount: Number(invoice.paidAmount),
    lines: invoice.lines.map((line) => ({
      ...line,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
      amount: Number(line.amount),
      taxAmount: Number(line.taxAmount),
      totalAmount: Number(line.totalAmount),
    })),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
          <p className="text-gray-600">Update invoice information</p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<div>Loading form...</div>}>
        <InvoiceForm
          chartAccounts={chartAccounts}
          customers={customers}
          vendors={vendors}
          projects={projects}
          taxCodes={taxCodes}
          invoice={invoiceForClient}
          isEditing={true}
        />
      </Suspense>
    </div>
  );
}
