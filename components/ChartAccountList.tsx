"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Plus,
  FileText,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChartAccount {
  id: string;
  number: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  allowManualEntries: boolean;
  requireProjectAllocation: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    journalLines: number;
  };
}

// Account type information
const ACCOUNT_TYPES = {
  ASSET: {
    label: "Asset",
    color: "bg-blue-100 text-blue-800",
    range: "1000-1999",
  },
  LIABILITY: {
    label: "Liability",
    color: "bg-red-100 text-red-800",
    range: "2000-2999",
  },
  EQUITY: {
    label: "Equity",
    color: "bg-purple-100 text-purple-800",
    range: "3000-3999",
  },
  REVENUE: {
    label: "Revenue",
    color: "bg-green-100 text-green-800",
    range: "4000-4999",
  },
  EXPENSE: {
    label: "Expense",
    color: "bg-orange-100 text-orange-800",
    range: "5000-5999",
  },
  TAX: {
    label: "Tax",
    color: "bg-yellow-100 text-yellow-800",
    range: "2600-2699",
  },
};

export function ChartAccountList() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  // Fetch accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      console.log("Fetching chart accounts...");
      const response = await fetch("/api/chart-accounts");
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }
      const data = await response.json();
      console.log("API response data:", data);
      console.log("Accounts in response:", data.accounts?.length || 0);
      setAccounts(data.accounts || []);
    } catch (error) {
      toast.error("Failed to fetch chart accounts");
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chart-accounts/init-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initialize accounts");
      }

      const result = await response.json();
      toast.success("Default chart of accounts initialized successfully");
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to initialize accounts"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (accountId: string) => {
    try {
      const response = await fetch(`/api/chart-accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully");
      setDeleteAccountId(null);
      fetchAccounts();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesType = selectedType === "all" || account.type === selectedType;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && account.isActive) ||
      (selectedStatus === "inactive" && !account.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Group accounts by type for statistics
  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.isActive).length,
    byType: Object.keys(ACCOUNT_TYPES).map((type) => ({
      type,
      label: ACCOUNT_TYPES[type as keyof typeof ACCOUNT_TYPES].label,
      count: accounts.filter((a) => a.type === type).length,
    })),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Chart of Accounts
            </h1>
            <p className="text-gray-600 mt-1">
              Canadian NCECF compliant chart of accounts
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center border border-blue-200">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            Chart of Accounts
          </h1>
          <p className="text-gray-600 mt-1">
            Canadian NCECF compliant chart of accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/dashboard/chart-of-accounts/new")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Accounts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Accounts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Type Breakdown */}
        {stats.byType.slice(0, 2).map((typeStats) => (
          <Card key={typeStats.type}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {typeStats.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeStats.count}
                  </p>
                </div>
                <Badge
                  className={
                    ACCOUNT_TYPES[typeStats.type as keyof typeof ACCOUNT_TYPES]
                      .color
                  }
                  variant="secondary"
                >
                  {typeStats.type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(ACCOUNT_TYPES).map(([value, info]) => (
                  <SelectItem key={value} value={value}>
                    {info.label} ({info.range})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No accounts found
              </h3>
              <p className="text-gray-500 mb-4">
                {accounts.length === 0
                  ? "Create your first account to get started"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {accounts.length === 0 && (
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleInitializeDefaults}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BookOpen className="h-4 w-4 mr-2" />
                    )}
                    Initialize Default Accounts
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push("/dashboard/chart-of-accounts/new")
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Manually
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-20">Entries</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-gray-50">
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {account.number}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          {account.description && (
                            <div className="text-sm text-gray-500">
                              {account.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ACCOUNT_TYPES[
                              account.type as keyof typeof ACCOUNT_TYPES
                            ]?.color
                          }
                          variant="secondary"
                        >
                          {ACCOUNT_TYPES[
                            account.type as keyof typeof ACCOUNT_TYPES
                          ]?.label || account.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={account.isActive ? "default" : "secondary"}
                        >
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {account._count?.journalLines || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/chart-of-accounts/${account.id}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/chart-of-accounts/${account.id}/edit`
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!account.isSystem && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setDeleteAccountId(account.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteAccountId}
        onOpenChange={() => setDeleteAccountId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot
              be undone and will affect all related transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountId && handleDelete(deleteAccountId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
