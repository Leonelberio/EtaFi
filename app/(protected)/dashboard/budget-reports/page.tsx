"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  FileText,
} from "lucide-react";

interface BudgetReport {
  id: string;
  name: string;
  type: "SUMMARY" | "DETAILED" | "COMPARISON";
  period: string;
  generatedAt: string;
  status: "READY" | "GENERATING" | "ERROR";
}

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  spentPercentage: number;
  averageDailySpending: number;
  projectedOverspend: boolean;
  projectedOverspendAmount: number;
}

export default function BudgetReportsPage() {
  const [reports, setReports] = useState<BudgetReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [selectedProject, setSelectedProject] = useState("all");

  const [summaryData, setSummaryData] = useState<BudgetSummary>({
    totalBudget: 1250000,
    totalSpent: 450000,
    totalRemaining: 800000,
    spentPercentage: 36,
    averageDailySpending: 15000,
    projectedOverspend: false,
    projectedOverspendAmount: 0,
  });

  useEffect(() => {
    // Simuler le chargement des rapports
    const mockReports: BudgetReport[] = [
      {
        id: "1",
        name: "Rapport Budget Q1 2024",
        type: "SUMMARY",
        period: "2024-01-01 to 2024-03-31",
        generatedAt: "2024-03-31T10:00:00Z",
        status: "READY",
      },
      {
        id: "2",
        name: "Analyse Détaillée - Projet Alpha",
        type: "DETAILED",
        period: "2024-01-01 to 2024-06-30",
        generatedAt: "2024-06-30T14:30:00Z",
        status: "READY",
      },
      {
        id: "3",
        name: "Comparaison Budgets 2023 vs 2024",
        type: "COMPARISON",
        period: "2023-01-01 to 2024-12-31",
        generatedAt: "2024-12-31T16:45:00Z",
        status: "GENERATING",
      },
    ];

    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Prêt
          </span>
        );
      case "GENERATING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Génération...
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Erreur
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUMMARY":
        return <BarChart3 className="h-4 w-4" />;
      case "DETAILED":
        return <FileText className="h-4 w-4" />;
      case "COMPARISON":
        return <PieChart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports de Budget</h1>
          <p className="text-gray-600">
            Analyse et rapports détaillés des budgets
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Générer un rapport
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mois en cours</SelectItem>
                  <SelectItem value="last-month">Mois dernier</SelectItem>
                  <SelectItem value="current-quarter">
                    Trimestre en cours
                  </SelectItem>
                  <SelectItem value="last-quarter">
                    Trimestre dernier
                  </SelectItem>
                  <SelectItem value="current-year">Année en cours</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les projets</SelectItem>
                  <SelectItem value="proj-1">
                    Projet Résidentiel Alpha
                  </SelectItem>
                  <SelectItem value="proj-2">Projet Commercial Beta</SelectItem>
                  <SelectItem value="proj-3">
                    Projet Infrastructure Gamma
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Budget Total
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summaryData.totalBudget)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dépensé</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summaryData.totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Restant</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summaryData.totalRemaining)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">% Dépensé</p>
                <p className="text-2xl font-bold">
                  {summaryData.spentPercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Rapports Générés</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun rapport généré
                </h3>
                <p className="text-gray-600 mb-4">
                  Commencez par générer votre premier rapport de budget.
                </p>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Générer un rapport
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(report.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {report.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {report.period}
                          </p>
                          <p className="text-xs text-gray-500">
                            Généré le {formatDate(report.generatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(report.status)}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse des Dépenses</CardTitle>
                <CardDescription>
                  Répartition des dépenses par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matériaux</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Main d'œuvre</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "35%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Équipement</span>
                    <span className="font-semibold">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projections</CardTitle>
                <CardDescription>
                  Prévisions basées sur les tendances actuelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(summaryData.averageDailySpending)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Dépense quotidienne moyenne
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {summaryData.projectedOverspend
                        ? "Dépassement prévu"
                        : "Dans les budgets"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {summaryData.projectedOverspend
                        ? `+${formatCurrency(summaryData.projectedOverspendAmount)}`
                        : "Aucun dépassement prévu"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Dépenses</CardTitle>
              <CardDescription>
                Graphique de l'évolution des dépenses dans le temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Graphique d'évolution des dépenses
                  </p>
                  <p className="text-sm text-gray-500">
                    Les données seront affichées ici
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
