"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Bell,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  Clock,
  Building2,
  Hash,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Eye,
  Plus,
  Settings,
  Target,
  DollarSign,
  Percent,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import BalanceSheet from "@/app/(protected)/_components/balance-sheet";
import DocumentsList from "@/app/(protected)/_components/documents-list";
import ReminderTable from "@/app/(protected)/_components/reminders-table";
import RealTimeFinancialSummary from "@/app/(protected)/_components/real-time-financial-summary";
import SyscohadaAnnexes from "@/app/(protected)/_components/syscohada-annexes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  useBalanceStore,
  useFinancialTotals,
  useBalanceData,
} from "@/lib/stores/balance-store";

interface Company {
  id: string;
  name: string;
  address: string;
  nif: string;
  contact: string;
  logo?: string;
}

interface Exercice {
  id: string;
  name: number;
  startDate: string;
  endDate: string;
  companyId: string;
}

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  type: string;
  companyId?: string;
  exerciceId?: string;
  createdAt: string;
}

interface Reminder {
  id: string;
  type: string;
  exerciceId: string;
  userId: string;
  alerts: any;
  createdAt: string;
  updatedAt: string;
}

interface BalanceSheetRow {
  accountNumber: string;
  account: string;
  debits: string;
  credits: string;
  solde: string;
}

export default function ExerciceDetailPage() {
  const { exerciceId, companyId } = useParams() as {
    exerciceId: string;
    companyId: string;
  };
  const { data: session } = useSession();
  const { setBalance } = useBalanceStore();
  const financialTotals = useFinancialTotals();
  const balanceData = useBalanceData();
  const [company, setCompany] = useState<Company | null>(null);
  const [exercice, setExercice] = useState<Exercice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetRow[]>(
    []
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Store exerciceId for localStorage
  useEffect(() => {
    localStorage.setItem("currentExerciceId", exerciceId);
  }, [exerciceId]);

  // Handle balance import
  const handleImportBalance = () => {
    // Trigger the file input click
    const fileInput = document.getElementById(
      "balance-upload"
    ) as HTMLInputElement;
    fileInput?.click();
  };

  const handleBalanceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split("\n");

      const data = lines.slice(1).map((line) => {
        const values = line.split(",");
        return {
          accountNumber: values[0] || "",
          account: values[1] || "",
          debits: values[2] || "0",
          credits: values[3] || "0",
          solde: values[4] || "0",
        };
      });
      setBalance(data);
    };
    reader.readAsText(file);
  };

  // Download CSV template for import
  const downloadImportTemplate = () => {
    const csvContent = `numero_compte,intitule,debits,credits,solde
101,Capital,0,5000000,-5000000
106,Réserves,0,1500000,-1500000
211,Brevets et licences,300000,0,300000
221,Terrains,1200000,0,1200000
311,Stocks matières premières,450000,0,450000
401,Fournisseurs,0,850000,-850000
411,Clients,1250000,0,1250000
512,Banques,890000,0,890000
601,Achats de marchandises,3200000,0,3200000
701,Ventes de marchandises,0,5800000,-5800000`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modele_balance_import.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch exercice details, balance sheet, documents, reminders, and company details
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company details
        const companyResponse = await fetch(`/api/companies/${companyId}`);
        if (!companyResponse.ok) {
          throw new Error("Failed to fetch company details");
        }
        const companyData: Company = await companyResponse.json();
        setCompany(companyData);

        // Fetch exercice details
        const exerciceResponse = await fetch(
          `/api/companies/${companyId}/exercice/${exerciceId}`
        );
        if (!exerciceResponse.ok) {
          throw new Error("Failed to fetch exercice details");
        }
        const exerciceData: Exercice = await exerciceResponse.json();
        setExercice(exerciceData);

        // Fetch balance sheet
        const balanceResponse = await fetch(
          `/api/companies/${companyId}/exercice/${exerciceId}/balance`
        );
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalanceSheetData(balanceData.data);
          setBalance(balanceData.data);
        } else {
          const savedData = localStorage.getItem(`balance-sheet-${exerciceId}`);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            setBalanceSheetData(parsedData);
            setBalance(parsedData);
          } else {
            // Check for data in the global store format
            const globalStoreData = localStorage.getItem(
              `balance_${exerciceId}`
            );
            if (globalStoreData) {
              const parsedGlobalData = JSON.parse(globalStoreData);
              setBalanceSheetData(parsedGlobalData);
              setBalance(parsedGlobalData);
            }
          }
        }

        // Fetch documents
        const documentsResponse = await fetch(
          `/api/companies/${companyId}/exercice/${exerciceId}/documents`
        );
        if (documentsResponse.ok) {
          const docs: Document[] = await documentsResponse.json();
          setDocuments(docs);
        } else {
          throw new Error("Failed to fetch documents");
        }

        // Fetch reminders
        const remindersResponse = await fetch(
          `/api/companies/${companyId}/exercice/${exerciceId}/reminders`
        );
        if (remindersResponse.ok) {
          const rems: Reminder[] = await remindersResponse.json();
          setReminders(rems);
        } else {
          throw new Error("Failed to fetch reminders");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (exerciceId) {
      fetchData();
    }
  }, [exerciceId, companyId, setBalance]);

  // Handle document upload
  const handleUploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `/api/companies/${companyId}/exercice/${exerciceId}/documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const newDocument: Document = await response.json();
      setDocuments((prevDocs) => [...prevDocs, newDocument]);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/companies/${companyId}/exercice/${exerciceId}/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== documentId)
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  // Handle reminder save (create or update)
  const handleSaveReminder = async (
    reminderData: any,
    reminderId: string | null = null
  ) => {
    try {
      const method = reminderId ? "PATCH" : "POST";
      const url = reminderId
        ? `/api/companies/${companyId}/exercice/${exerciceId}/reminders/${reminderId}`
        : `/api/companies/${companyId}/exercice/${exerciceId}/reminders`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      });

      if (!response.ok) {
        throw new Error(
          reminderId ? "Failed to update reminder" : "Failed to create reminder"
        );
      }

      const newReminder: Reminder = await response.json();
      if (reminderId) {
        setReminders((prevReminders) =>
          prevReminders?.map((rem) =>
            rem.id === reminderId ? newReminder : rem
          )
        );
      } else {
        setReminders((prevReminders) => [...prevReminders, newReminder]);
      }

      alert(
        reminderId
          ? "Rappel mis à jour avec succès !"
          : "Rappel créé avec succès !"
      );
    } catch (error) {
      console.error(
        "Error saving reminder:",
        error instanceof Error ? error.message : "Unknown error"
      );
      alert(
        `Failed to save reminder: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Handle reminder deletion
  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch(
        `/api/companies/${companyId}/exercice/${exerciceId}/reminders/${reminderId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete reminder");
      }

      setReminders((prevReminders) =>
        prevReminders.filter((rem) => rem.id !== reminderId)
      );
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Failed to delete reminder");
    }
  };

  // Use global store financial totals instead of local calculation
  // This ensures synchronization with États financiers tab
  const financialMetrics = {
    totalAssets: financialTotals.totalActif,
    totalLiabilities: financialTotals.totalPassif,
    totalEquity: financialTotals.totalActif - financialTotals.totalPassif, // Assets - Liabilities = Equity
    revenue: financialTotals.resultatNet > 0 ? financialTotals.resultatNet : 0,
    expenses:
      financialTotals.resultatNet < 0
        ? Math.abs(financialTotals.resultatNet)
        : 0,
  };

  // Get exercise status
  const getExerciseStatus = () => {
    if (!exercice)
      return {
        status: "Inconnu",
        variant: "secondary" as const,
        color: "text-gray-600",
      };

    const now = new Date();
    const start = new Date(exercice.startDate);
    const end = new Date(exercice.endDate);

    if (now < start)
      return {
        status: "À venir",
        variant: "secondary" as const,
        color: "text-blue-600",
      };
    if (now > end)
      return {
        status: "Terminé",
        variant: "outline" as const,
        color: "text-gray-600",
      };
    return {
      status: "En cours",
      variant: "default" as const,
      color: "text-green-600",
    };
  };

  const exerciseStatus = getExerciseStatus();

  // Calculate exercise progress
  const getExerciseProgress = () => {
    if (!exercice) return 0;

    const now = new Date();
    const start = new Date(exercice.startDate);
    const end = new Date(exercice.endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    if (elapsed < 0) return 0;
    if (elapsed > total) return 100;

    return Math.round((elapsed / total) * 100);
  };

  const progress = getExerciseProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l&apos;exercice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href={`/dashboard/companies/${companyId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l&apos;entreprise
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/companies/${companyId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l&apos;entreprise
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>

          {/* Exercise Header Info */}
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl flex items-center justify-center border border-rose-200 flex-shrink-0">
              <Calendar className="h-8 w-8 text-rose-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Exercice {exercice?.name}
                </h1>
                <Badge variant={exerciseStatus.variant} className="text-sm">
                  {exerciseStatus.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{company?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {exercice &&
                      new Date(exercice.startDate).toLocaleDateString(
                        "fr-FR"
                      )}{" "}
                    -{" "}
                    {exercice &&
                      new Date(exercice.endDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Progression: {progress}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="overview"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger
              value="balance"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Balance ({balanceSheetData.length})
            </TabsTrigger>
            <TabsTrigger
              value="etats-financiers"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              États financiers
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Rappels ({reminders.length})
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Analyses
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Financial Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Total Actifs
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialMetrics.totalAssets)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      +5.2% ce mois
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Chiffre d&apos;affaires
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialMetrics.revenue)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      +12.5% vs exercice précédent
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        Passifs
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialMetrics.totalLiabilities)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-200 rounded-lg flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-600">
                      {(
                        (financialMetrics.totalLiabilities /
                          financialMetrics.totalAssets) *
                        100
                      ).toFixed(1)}
                      % des actifs
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">
                        Capitaux Propres
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialMetrics.totalEquity)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-200 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-600">
                      Ratio santé: Bon
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-rose-600" />
                    <CardTitle className="text-lg">Actions Rapides</CardTitle>
                  </div>
                  <CardDescription>
                    Accès rapide aux fonctionnalités principales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-rose-600 hover:bg-rose-700 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger un document
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Créer un rappel
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Générer un rapport
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter les données
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-rose-600" />
                    <CardTitle className="text-lg">Documents Récents</CardTitle>
                  </div>
                  <CardDescription>
                    Derniers documents ajoutés à cet exercice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.slice(0, 4).map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-48">
                            {document.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(document.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun document</p>
                      <p className="text-sm text-gray-400">
                        Téléchargez vos premiers documents
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-rose-500" />
                      Bilan
                    </CardTitle>
                    <CardDescription>
                      Téléchargez ou modifiez les données du bilan pour cet
                      exercice •{" "}
                      <button
                        onClick={downloadImportTemplate}
                        className="text-rose-600 hover:text-rose-700 underline cursor-pointer"
                      >
                        Télécharger modèle CSV
                      </button>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleBalanceUpload}
                      style={{ display: "none" }}
                      id="balance-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImportBalance}
                      disabled={isImporting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isImporting ? "Importation..." : "Importer"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <BalanceSheet />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* États financiers Tab */}
          <TabsContent value="etats-financiers">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-rose-500" />
                      États financiers
                    </CardTitle>
                    <CardDescription>
                      Résumé financier en temps réel avec synchronisation
                      automatique
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Real-time financial summary */}
                  <RealTimeFinancialSummary />

                  {/* Syscohada Annexes */}
                  <SyscohadaAnnexes />

                  {/* Sample data button when no data */}
                  {balanceSheetData.length === 0 && (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune donnée comptable
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Chargez des données d&apos;exemple pour voir les états
                        financiers en action
                      </p>
                      <Button
                        onClick={handleImportBalance}
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Charger données d&apos;exemple
                      </Button>
                    </div>
                  )}

                  {/* Quick navigation to detailed views */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      États financiers détaillés
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        onClick={() => {
                          // Basculer vers l'onglet États financiers pour voir le compte de résultat
                          const element = document.querySelector(
                            '[data-value="financial-statements"]'
                          ) as HTMLElement;
                          if (element) element.click();
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">Compte de Résultat</div>
                          <div className="text-sm text-gray-500">
                            Income Statement
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        onClick={() => {
                          // Basculer vers l'onglet États financiers pour voir les flux
                          const element = document.querySelector(
                            '[data-value="financial-statements"]'
                          ) as HTMLElement;
                          if (element) element.click();
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">Flux de Trésorerie</div>
                          <div className="text-sm text-gray-500">
                            Cash Flow Statement
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        onClick={() => {
                          // Basculer vers l'onglet Balance
                          const element = document.querySelector(
                            '[data-value="balance"]'
                          ) as HTMLElement;
                          if (element) element.click();
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">Bilan Actif</div>
                          <div className="text-sm text-gray-500">Assets</div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        onClick={() => {
                          // Basculer vers l'onglet Balance
                          const element = document.querySelector(
                            '[data-value="balance"]'
                          ) as HTMLElement;
                          if (element) element.click();
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">Bilan Passif</div>
                          <div className="text-sm text-gray-500">
                            Liabilities & Equity
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-rose-500" />
                      Documents & Fichiers
                    </CardTitle>
                    <CardDescription>
                      Gérez tous les documents liés à cet exercice
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DocumentsList
                  documents={documents}
                  onUploadDocument={handleUploadDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-rose-500" />
                      Rappels & Notifications
                    </CardTitle>
                    <CardDescription>
                      Créez et gérez les rappels pour cet exercice
                    </CardDescription>
                  </div>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau rappel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ReminderTable
                  reminders={reminders}
                  onSaveReminder={handleSaveReminder}
                  onDeleteReminder={handleDeleteReminder}
                  companyName={company?.name}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Financial Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assets vs Liabilities Chart */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-rose-600" />
                    <CardTitle className="text-lg">
                      Structure Financière
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Répartition Actifs vs Passifs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          {
                            name: "Actifs",
                            value: financialMetrics.totalAssets,
                            color: "#3b82f6",
                          },
                          {
                            name: "Passifs",
                            value: financialMetrics.totalLiabilities,
                            color: "#ef4444",
                          },
                          {
                            name: "Capitaux Propres",
                            value: financialMetrics.totalEquity,
                            color: "#10b981",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {["#3b82f6", "#ef4444", "#10b981"].map(
                          (color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "XOF",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(value),
                          "",
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Account Distribution */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-rose-600" />
                    <CardTitle className="text-lg">
                      Répartition par Classe
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Distribution des comptes par classe comptable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={(() => {
                        const classes: Record<string, number> = {};
                        balanceData.forEach((row) => {
                          const classNum = row.accountNumber.charAt(0);
                          const solde =
                            parseFloat(row.solde.replace(/[^0-9.-]/g, "")) || 0;
                          if (classes[classNum]) {
                            classes[classNum] += Math.abs(solde);
                          } else {
                            classes[classNum] = Math.abs(solde);
                          }
                        });

                        return Object.entries(classes).map(
                          ([classe, value]) => ({
                            classe: `Classe ${classe}`,
                            montant: value,
                          })
                        );
                      })()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="classe" stroke="#6b7280" fontSize={12} />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("fr-FR", {
                            notation: "compact",
                            compactDisplay: "short",
                          }).format(value)
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "XOF",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(value),
                          "Montant",
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="montant"
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-rose-600" />
                  <CardTitle className="text-lg">Résumé Financier</CardTitle>
                </div>
                <CardDescription>
                  Indicateurs clés de performance financière
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Ratio de Liquidité
                    </h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {(
                        financialMetrics.totalAssets /
                        (financialMetrics.totalLiabilities || 1)
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Actifs / Passifs
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">
                      Autonomie Financière
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      {(
                        (financialMetrics.totalEquity /
                          financialMetrics.totalAssets) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Capitaux Propres / Actifs
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      Endettement
                    </h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {(
                        (financialMetrics.totalLiabilities /
                          financialMetrics.totalAssets) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      Passifs / Actifs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
