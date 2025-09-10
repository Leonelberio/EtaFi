import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Edit, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface JournalDetailPageProps {
  params: Promise<{ journalId: string }>;
}

export default async function JournalDetailPage({
  params,
}: JournalDetailPageProps) {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    redirect("/auth/login");
  }

  const { journalId } = await params;

  const journal = await db.journal.findFirst({
    where: {
      id: journalId,
      organizationId: orgId,
    },
    include: {
      lines: {
        include: {
          account: {
            select: { id: true, number: true, name: true, type: true },
          },
          project: {
            select: { id: true, code: true, name: true },
          },
          activity: {
            select: { id: true, code: true, name: true },
          },
          taxCode: {
            select: { id: true, code: true, name: true, rate: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      postedByUser: {
        select: { name: true, email: true },
      },
      reversedByUser: {
        select: { name: true, email: true },
      },
    },
  });

  if (!journal) {
    redirect("/dashboard/journals");
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "POSTED":
        return <Badge className="bg-green-100 text-green-800">Posted</Badge>;
      case "REVERSED":
        return <Badge variant="destructive">Reversed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getJournalTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      GENERAL: "bg-blue-100 text-blue-800",
      PURCHASE: "bg-purple-100 text-purple-800",
      SALES: "bg-green-100 text-green-800",
      CASH_RECEIPTS: "bg-emerald-100 text-emerald-800",
      CASH_DISBURSEMENTS: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  const totalDebits = journal.lines.reduce(
    (sum, line) => sum + Number(line.debitAmount || 0),
    0
  );
  const totalCredits = journal.lines.reduce(
    (sum, line) => sum + Number(line.creditAmount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Calculator className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Journal Entry {journal.reference || journal.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600">View journal entry details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {journal.status === "DRAFT" && (
            <Link href={`/dashboard/journals/${journal.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
          <Link href="/dashboard/journals">
            <Button variant="outline">Back to Journals</Button>
          </Link>
        </div>
      </div>

      {/* Journal Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Journal Information</span>
            <div className="flex items-center gap-2">
              {getJournalTypeBadge(journal.journalType)}
              {getStatusBadge(journal.status)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Entry Date</p>
              <p className="text-sm">
                {new Date(journal.entryDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reference</p>
              <p className="text-sm">{journal.reference || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-sm font-medium">
                ${Number(Number(journal.totalAmount) || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-sm">
                {new Date(journal.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-sm mt-1">{journal.description}</p>
          </div>

          {journal.postedByUser && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Posted By</p>
              <p className="text-sm">
                {journal.postedByUser.name} on{" "}
                {new Date(journal.postedAt!).toLocaleDateString()}
              </p>
            </div>
          )}

          {journal.reversedByUser && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Reversed By</p>
              <p className="text-sm">
                {journal.reversedByUser.name} on{" "}
                {new Date(journal.reversedAt!).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journal Lines */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Account</th>
                  <th className="text-left p-2 font-medium">Description</th>
                  <th className="text-left p-2 font-medium">Project</th>
                  <th className="text-right p-2 font-medium">Debit</th>
                  <th className="text-right p-2 font-medium">Credit</th>
                </tr>
              </thead>
              <tbody>
                {journal.lines.map((line) => (
                  <tr key={line.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{line.account.number}</p>
                        <p className="text-sm text-gray-600">
                          {line.account.name}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <p className="text-sm">{line.description}</p>
                    </td>
                    <td className="p-2">
                      {line.project ? (
                        <div>
                          <p className="text-sm font-medium">
                            {line.project.code}
                          </p>
                          <p className="text-xs text-gray-600">
                            {line.project.name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {line.debitAmount
                        ? `$${Number(Number(line.debitAmount) || 0).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {line.creditAmount
                        ? `$${Number(Number(line.creditAmount) || 0).toFixed(2)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50">
                  <td colSpan={3} className="p-2 font-medium">
                    Totals:
                  </td>
                  <td className="p-2 text-right font-bold">
                    ${Number(totalDebits || 0).toFixed(2)}
                  </td>
                  <td className="p-2 text-right font-bold">
                    ${Number(totalCredits || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Balance Check:</span>
              <span
                className={`font-medium ${Math.abs(totalDebits - totalCredits) < 0.01 ? "text-green-600" : "text-red-600"}`}
              >
                {Math.abs(totalDebits - totalCredits) < 0.01
                  ? "✓ Balanced"
                  : "⚠ Not Balanced"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
