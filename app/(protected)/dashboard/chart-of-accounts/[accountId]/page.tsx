import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

// This would normally fetch data server-side
async function getChartAccount(accountId: string) {
  try {
    // In a real app, you'd fetch this server-side
    // For now, we'll return a placeholder
    return {
      id: accountId,
      number: "1000",
      name: "Cash",
      type: "ASSET",
      description: "Cash on hand and in bank accounts",
      isActive: true,
      isSystem: false,
      allowManualEntries: true,
      requireProjectAllocation: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

interface PageProps {
  params: Promise<{ accountId: string }>;
}

export default async function ChartAccountDetailPage({ params }: PageProps) {
  const { accountId } = await params;
  const account = await getChartAccount(accountId);

  if (!account) {
    notFound();
  }

  const ACCOUNT_TYPES = {
    ASSET: { label: "Asset", color: "bg-blue-100 text-blue-800" },
    LIABILITY: { label: "Liability", color: "bg-red-100 text-red-800" },
    EQUITY: { label: "Equity", color: "bg-purple-100 text-purple-800" },
    REVENUE: { label: "Revenue", color: "bg-green-100 text-green-800" },
    EXPENSE: { label: "Expense", color: "bg-orange-100 text-orange-800" },
    TAX: { label: "Tax", color: "bg-yellow-100 text-yellow-800" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/chart-of-accounts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chart of Accounts
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {account.number} - {account.name}
            </h1>
            <p className="text-gray-600">Account Details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/chart-of-accounts/${account.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          {!account.isSystem && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Account Number
              </label>
              <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                {account.number}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Account Name
              </label>
              <p className="text-lg">{account.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Account Type
              </label>
              <div>
                <Badge
                  className={
                    ACCOUNT_TYPES[account.type as keyof typeof ACCOUNT_TYPES]
                      ?.color
                  }
                  variant="secondary"
                >
                  {ACCOUNT_TYPES[account.type as keyof typeof ACCOUNT_TYPES]
                    ?.label || account.type}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div>
                <Badge variant={account.isActive ? "default" : "secondary"}>
                  {account.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {account.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Description
              </label>
              <p className="text-gray-900">{account.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Manual Entries
              </span>
              <Badge
                variant={account.allowManualEntries ? "default" : "secondary"}
              >
                {account.allowManualEntries ? "Allowed" : "Restricted"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Project Allocation
              </span>
              <Badge
                variant={
                  account.requireProjectAllocation ? "default" : "secondary"
                }
              >
                {account.requireProjectAllocation ? "Required" : "Optional"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                System Account
              </span>
              <Badge variant={account.isSystem ? "destructive" : "secondary"}>
                {account.isSystem ? "System" : "User"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No transactions found for this account.</p>
            <p className="text-sm">
              Transactions will appear here once journal entries are made.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
