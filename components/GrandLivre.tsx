"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calculator,
  FileText,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ChartAccount {
  id: string;
  number: string;
  name: string;
  type: string;
  isActive: boolean;
}

interface JournalLine {
  id: string;
  debitAmount: number | null;
  creditAmount: number | null;
  description: string;
  entryDate: string;
  runningBalance: number;
  journal: {
    id: string;
    journalType: string;
    reference: string | null;
    description: string;
    status: string;
  };
  project?: {
    code: string;
    name: string;
  };
  activity?: {
    code: string;
    name: string;
  };
}

interface LedgerData {
  account: ChartAccount;
  lines: JournalLine[];
  totalDebits: number;
  totalCredits: number;
  endingBalance: number;
}

interface TrialBalanceItem {
  account: ChartAccount;
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

interface TrialBalanceData {
  accounts: TrialBalanceItem[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

interface IncomeStatementData {
  revenue: Array<{ account: ChartAccount; balance: number }>;
  expenses: Array<{ account: ChartAccount; balance: number }>;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
}

interface BalanceSheetData {
  assets: Array<{ account: ChartAccount; balance: number }>;
  liabilities: Array<{ account: ChartAccount; balance: number }>;
  equity: Array<{ account: ChartAccount; balance: number }>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
}

export function GrandLivre() {
  const [activeTab, setActiveTab] = useState("ledger");
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Data states
  const [ledgerData, setLedgerData] = useState<LedgerData | null>(null);
  const [trialBalanceData, setTrialBalanceData] =
    useState<TrialBalanceData | null>(null);
  const [incomeStatementData, setIncomeStatementData] =
    useState<IncomeStatementData | null>(null);
  const [balanceSheetData, setBalanceSheetData] =
    useState<BalanceSheetData | null>(null);

  // Load chart accounts on mount
  useEffect(() => {
    const loadChartAccounts = async () => {
      try {
        const response = await fetch("/api/chart-accounts");
        if (response.ok) {
          const data = await response.json();
          setChartAccounts(Array.isArray(data.accounts) ? data.accounts : []);
        }
      } catch (error) {
        console.error("Error loading chart accounts:", error);
      }
    };
    loadChartAccounts();
  }, []);

  // Set default date range (current month)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);
  }, []);

  const fetchLedgerData = async () => {
    if (!selectedAccountId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        accountId: selectedAccountId,
        reportType: "ledger",
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/ledger?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLedgerData(data);
      } else {
        toast.error("Failed to load ledger data");
      }
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      toast.error("Error loading ledger data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ reportType: "trial_balance" });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/ledger?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTrialBalanceData(data);
      } else {
        toast.error("Failed to load trial balance");
      }
    } catch (error) {
      console.error("Error fetching trial balance:", error);
      toast.error("Error loading trial balance");
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ reportType: "income_statement" });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/ledger?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIncomeStatementData(data);
      } else {
        toast.error("Failed to load income statement");
      }
    } catch (error) {
      console.error("Error fetching income statement:", error);
      toast.error("Error loading income statement");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ reportType: "balance_sheet" });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/ledger?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBalanceSheetData(data);
      } else {
        toast.error("Failed to load balance sheet");
      }
    } catch (error) {
      console.error("Error fetching balance sheet:", error);
      toast.error("Error loading balance sheet");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Auto-fetch data when switching tabs
    if (value === "trial_balance" && !trialBalanceData) {
      fetchTrialBalance();
    } else if (value === "income_statement" && !incomeStatementData) {
      fetchIncomeStatement();
    } else if (value === "balance_sheet" && !balanceSheetData) {
      fetchBalanceSheet();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const handleExportBalanceSheet = () => {
    if (!balanceSheetData) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    if (!balanceSheetData.isBalanced) {
      toast.error(
        "❌ Export impossible : Le bilan n'est pas équilibré. Veuillez corriger vos écritures avant d'exporter.",
        {
          duration: 5000,
          description:
            "Les états financiers doivent toujours être équilibrés selon les normes NCECF.",
        }
      );
      return;
    }

    toast.success("✅ Bilan équilibré - Export autorisé");
    // TODO: Implémenter la logique d'export (PDF/Excel)
  };

  const handleExportTrialBalance = () => {
    if (!trialBalanceData) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    if (!trialBalanceData.isBalanced) {
      toast.error(
        "❌ Export impossible : La balance de vérification n'est pas équilibrée.",
        {
          duration: 5000,
          description:
            "Veuillez corriger vos écritures pour que les débits égalent les crédits.",
        }
      );
      return;
    }

    toast.success("✅ Balance de vérification équilibrée - Export autorisé");
    // TODO: Implémenter la logique d'export (PDF/Excel)
  };

  const getAccountTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ASSET: "bg-blue-100 text-blue-800",
      LIABILITY: "bg-red-100 text-red-800",
      EQUITY: "bg-green-100 text-green-800",
      REVENUE: "bg-purple-100 text-purple-800",
      EXPENSE: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grand Livre</h1>
          <p className="text-gray-600">
            Gestion du grand livre et états financiers
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Période de rapport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  if (activeTab === "ledger") fetchLedgerData();
                  else if (activeTab === "trial_balance") fetchTrialBalance();
                  else if (activeTab === "income_statement")
                    fetchIncomeStatement();
                  else if (activeTab === "balance_sheet") fetchBalanceSheet();
                }}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Chargement..." : "Actualiser"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ledger">Grand Livre</TabsTrigger>
          <TabsTrigger value="trial_balance">
            Balance de Vérification
          </TabsTrigger>
          <TabsTrigger value="income_statement">État des Résultats</TabsTrigger>
          <TabsTrigger value="balance_sheet">Bilan</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Grand Livre - Compte spécifique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="account">Compte</Label>
                    <Select
                      value={selectedAccountId}
                      onValueChange={setSelectedAccountId}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sélectionner un compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {chartAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.number} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={fetchLedgerData}
                      disabled={!selectedAccountId || loading}
                    >
                      Afficher
                    </Button>
                  </div>
                </div>

                {ledgerData && (
                  <div className="space-y-4">
                    {/* Account Summary */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {ledgerData.account.number} -{" "}
                          {ledgerData.account.name}
                        </h3>
                        <Badge
                          className={getAccountTypeColor(
                            ledgerData.account.type
                          )}
                        >
                          {ledgerData.account.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Débits:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(ledgerData.totalDebits)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Crédits:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(ledgerData.totalCredits)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Solde final:</span>
                          <span
                            className={`ml-2 font-bold ${ledgerData.endingBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(ledgerData.endingBalance)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Journal Lines */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Référence</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Projet</TableHead>
                          <TableHead className="text-right">Débit</TableHead>
                          <TableHead className="text-right">Crédit</TableHead>
                          <TableHead className="text-right">Solde</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerData.lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>
                              {new Date(line.entryDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {line.journal.reference ||
                                line.journal.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>{line.description}</TableCell>
                            <TableCell>
                              {line.project
                                ? `${line.project.code} - ${line.project.name}`
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {line.debitAmount
                                ? formatCurrency(line.debitAmount)
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {line.creditAmount
                                ? formatCurrency(line.creditAmount)
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(line.runningBalance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial_balance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Balance de Vérification
                </CardTitle>
                <Button
                  onClick={handleExportTrialBalance}
                  variant="outline"
                  size="sm"
                  disabled={!trialBalanceData || !trialBalanceData.isBalanced}
                  className={
                    trialBalanceData && !trialBalanceData.isBalanced
                      ? "border-red-300 text-red-600 hover:bg-red-50"
                      : ""
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  {trialBalanceData && !trialBalanceData.isBalanced
                    ? "Export bloqué"
                    : "Exporter"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trialBalanceData ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Débits:</span>
                      <span className="font-bold">
                        {formatCurrency(trialBalanceData.totalDebits)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Crédits:</span>
                      <span className="font-bold">
                        {formatCurrency(trialBalanceData.totalCredits)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="font-medium">Différence:</span>
                      <span
                        className={`font-bold ${trialBalanceData.isBalanced ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(
                          trialBalanceData.totalDebits -
                            trialBalanceData.totalCredits
                        )}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge
                        className={
                          trialBalanceData.isBalanced
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {trialBalanceData.isBalanced
                          ? "✓ Équilibré"
                          : "⚠ Non équilibré"}
                      </Badge>
                    </div>
                  </div>

                  {/* Balance Status Alert */}
                  {trialBalanceData.isBalanced ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-900">
                            ✅ BALANCE DE VÉRIFICATION ÉQUILIBRÉE
                          </h4>
                          <p className="text-sm text-green-800 mt-1">
                            Les débits correspondent exactement aux crédits. Cet
                            état est conforme aux normes NCECF.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-900">
                            ⚠️ ÉTAT FINANCIER NON ÉQUILIBRÉ
                          </h4>
                          <p className="text-sm text-red-800 mt-1">
                            La balance de vérification n'est pas équilibrée. Les
                            débits ne correspondent pas aux crédits.
                          </p>
                          <p className="text-sm text-red-800 mt-2">
                            <strong>Différence :</strong>{" "}
                            {formatCurrency(
                              Math.abs(
                                trialBalanceData.totalDebits -
                                  trialBalanceData.totalCredits
                              )
                            )}
                          </p>
                          <p className="text-xs text-red-700 mt-2">
                            Veuillez vérifier et corriger vos écritures de
                            journal avant de générer des rapports officiels. Cet
                            état ne peut pas être utilisé pour des états
                            financiers conformes NCECF.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trial Balance Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Compte</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Débit</TableHead>
                        <TableHead className="text-right">Crédit</TableHead>
                        <TableHead className="text-right">Solde</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalanceData.accounts.map((item) => (
                        <TableRow key={item.account.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.account.number}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.account.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getAccountTypeColor(item.account.type)}
                            >
                              {item.account.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.totalDebits > 0
                              ? formatCurrency(item.totalDebits)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.totalCredits > 0
                              ? formatCurrency(item.totalCredits)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Cliquez sur "Actualiser" pour charger la balance de
                    vérification
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income_statement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                État des Résultats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomeStatementData ? (
                <div className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Revenus</h3>
                    <div className="space-y-2">
                      {incomeStatementData.revenue.map((item) => (
                        <div
                          key={item.account.id}
                          className="flex justify-between items-center py-2 border-b"
                        >
                          <span>
                            {item.account.number} - {item.account.name}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.balance)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2 border-t-2 font-bold text-lg">
                        <span>Total Revenus</span>
                        <span className="text-green-600">
                          {formatCurrency(incomeStatementData.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dépenses</h3>
                    <div className="space-y-2">
                      {incomeStatementData.expenses.map((item) => (
                        <div
                          key={item.account.id}
                          className="flex justify-between items-center py-2 border-b"
                        >
                          <span>
                            {item.account.number} - {item.account.name}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.balance)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2 border-t-2 font-bold text-lg">
                        <span>Total Dépenses</span>
                        <span className="text-red-600">
                          {formatCurrency(incomeStatementData.totalExpenses)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Résultat Net</span>
                      <span
                        className={`text-2xl font-bold ${incomeStatementData.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(incomeStatementData.netIncome)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Cliquez sur "Actualiser" pour charger l'état des résultats
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance_sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bilan
                </CardTitle>
                <Button
                  onClick={handleExportBalanceSheet}
                  variant="outline"
                  size="sm"
                  disabled={!balanceSheetData || !balanceSheetData.isBalanced}
                  className={
                    balanceSheetData && !balanceSheetData.isBalanced
                      ? "border-red-300 text-red-600 hover:bg-red-50"
                      : ""
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  {balanceSheetData && !balanceSheetData.isBalanced
                    ? "Export bloqué"
                    : "Exporter"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {balanceSheetData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assets */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-600">
                        ACTIFS
                      </h3>
                      <div className="space-y-2">
                        {balanceSheetData.assets.map((item) => (
                          <div
                            key={item.account.id}
                            className="flex justify-between items-center py-2 border-b"
                          >
                            <span>
                              {item.account.number} - {item.account.name}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.balance)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center py-2 border-t-2 font-bold text-lg">
                          <span>Total Actifs</span>
                          <span className="text-green-600">
                            {formatCurrency(balanceSheetData.totalAssets)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Liabilities & Equity */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-600">
                        PASSIFS
                      </h3>
                      <div className="space-y-2">
                        {balanceSheetData.liabilities.map((item) => (
                          <div
                            key={item.account.id}
                            className="flex justify-between items-center py-2 border-b"
                          >
                            <span>
                              {item.account.number} - {item.account.name}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.balance)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center py-2 border-t-2 font-bold text-lg">
                          <span>Total Passifs</span>
                          <span className="text-red-600">
                            {formatCurrency(balanceSheetData.totalLiabilities)}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-3 mt-6 text-blue-600">
                        CAPITAUX PROPRES
                      </h3>
                      <div className="space-y-2">
                        {balanceSheetData.equity.map((item) => (
                          <div
                            key={item.account.id}
                            className="flex justify-between items-center py-2 border-b"
                          >
                            <span>
                              {item.account.number} - {item.account.name}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.balance)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center py-2 border-t-2 font-bold text-lg">
                          <span>Total Capitaux Propres</span>
                          <span className="text-blue-600">
                            {formatCurrency(balanceSheetData.totalEquity)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2 border-t-2 font-bold text-lg mt-4">
                        <span>Total Passifs + Capitaux Propres</span>
                        <span className="text-purple-600">
                          {formatCurrency(
                            balanceSheetData.totalLiabilities +
                              balanceSheetData.totalEquity
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Check */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Vérification d'équilibre:
                      </span>
                      <Badge
                        className={
                          balanceSheetData.isBalanced
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {balanceSheetData.isBalanced
                          ? "✓ Équilibré"
                          : "⚠ Non équilibré"}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Actifs :</span>
                        <span className="font-medium">
                          {formatCurrency(balanceSheetData.totalAssets)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Passifs + Capitaux propres :</span>
                        <span className="font-medium">
                          {formatCurrency(
                            balanceSheetData.totalLiabilities +
                              balanceSheetData.totalEquity
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span>Différence :</span>
                        <span
                          className={`font-bold ${balanceSheetData.isBalanced ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(
                            Math.abs(
                              balanceSheetData.totalAssets -
                                (balanceSheetData.totalLiabilities +
                                  balanceSheetData.totalEquity)
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Status Alert */}
                  {balanceSheetData.isBalanced ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-900">
                            ✅ BILAN ÉQUILIBRÉ
                          </h4>
                          <p className="text-sm text-green-800 mt-1">
                            L'équation comptable fondamentale est respectée :{" "}
                            <strong>Actifs = Passifs + Capitaux propres</strong>
                          </p>
                          <p className="text-sm text-green-800 mt-1">
                            Ce bilan est conforme aux normes NCECF et peut être
                            utilisé pour les états financiers officiels.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-900">
                            ⚠️ BILAN NON ÉQUILIBRÉ - ERREUR COMPTABLE CRITIQUE
                          </h4>
                          <p className="text-sm text-red-800 mt-1">
                            Le bilan n'est pas équilibré. L'équation comptable
                            fondamentale n'est pas respectée :
                            <br />
                            <strong>Actifs = Passifs + Capitaux propres</strong>
                          </p>
                          <p className="text-sm text-red-800 mt-2">
                            <strong>Différence :</strong>{" "}
                            {formatCurrency(
                              Math.abs(
                                balanceSheetData.totalAssets -
                                  (balanceSheetData.totalLiabilities +
                                    balanceSheetData.totalEquity)
                              )
                            )}
                          </p>
                          <p className="text-xs text-red-700 mt-2">
                            ⛔ Ce bilan ne peut PAS être utilisé pour des états
                            financiers officiels. Il ne respecte pas les normes
                            NCECF. Veuillez corriger vos écritures de journal
                            immédiatement.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Cliquez sur "Actualiser" pour charger le bilan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
