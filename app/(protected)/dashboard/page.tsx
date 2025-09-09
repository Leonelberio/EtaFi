"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Building2,
  Calendar,
  FileText,
  Plus,
  Zap,
  Activity,
  Bell,
  Shield,
  AlertTriangle,
  Target,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

interface DashboardData {
  kpis: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    totalActualCosts: number;
    budgetVariance: number;
    completionRate: number;
  };
  charts: {
    monthlyPerformance: Array<{
      month: string;
      budget: number;
      actual: number;
      variance: number;
    }>;
    costDistribution: Array<{
      name: string;
      value: number;
      amount: number;
      color: string;
    }>;
    projectStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    amount: number;
    date: string;
    status: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    kind: string;
    totalBudget: number | null;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
      activities: number;
      invoices: number;
      journalLines: number;
    };
  }>;
}

// Dashboard component
export default function Page() {
  const { currentOrganization, isLoading: orgLoading } = useOrganizationContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastOrgId = useRef<string | null>(null);

  // Fetch data when organization changes or on initial load
  useEffect(() => {
    // Don't fetch if organization is still loading
    if (orgLoading) return;
    
    const currentOrgId = currentOrganization?.id;
    
    // Fetch if organization changed OR if this is the initial load (lastOrgId is null)
    if (currentOrgId && (currentOrgId !== lastOrgId.current || lastOrgId.current === null)) {
      lastOrgId.current = currentOrgId;
      
      // Fetch data directly in useEffect
      const fetchData = async () => {
        console.log("Fetching dashboard data, currentOrganization:", currentOrganization);
        try {
          setLoading(true);
          setError(null);

          const response = await fetch("/api/dashboard");
          if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
          }

          const data = await response.json();
          console.log("Dashboard data fetched successfully:", data);
          setDashboardData(data);
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [currentOrganization?.id, currentOrganization, orgLoading]);

  // Show loading state while organization is loading or dashboard data is loading
  if (orgLoading || loading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">
            Erreur lors du chargement des données
          </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Réessayer
            </Button>
            </div>
          </div>
    );
  }

  // Show empty state if no data
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const { kpis, charts, recentActivities, projects } = dashboardData;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">Projets Totaux</p>
                <p className="dashboard-metric-value">{kpis.totalProjects}</p>
                <p className="text-sm text-green-600 font-medium">
                  {kpis.activeProjects} actifs
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">Budget Total</p>
                <p className="dashboard-metric-value">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "CAD",
                    notation: "compact",
                    maximumFractionDigits: 0,
                  }).format(kpis.totalBudget)}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {kpis.completionRate}% complété
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">Coûts Réels</p>
                <p className="dashboard-metric-value">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "CAD",
                    notation: "compact",
                    maximumFractionDigits: 0,
                  }).format(kpis.totalActualCosts)}
                </p>
                <p className="text-sm text-purple-600 font-medium">vs budget</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">Écart Budgétaire</p>
                <p
                  className={`dashboard-metric-value ${kpis.budgetVariance >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {kpis.budgetVariance >= 0 ? "+" : ""}
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "CAD",
                    notation: "compact",
                    maximumFractionDigits: 0,
                  }).format(kpis.budgetVariance)}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  {kpis.budgetVariance >= 0 ? "Sous budget" : "Dépassement"}
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Budget vs Actual Chart */}
          <Card
            className="etafi-card animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-rose-500" />
                Performance Budgétaire
              </CardTitle>
              <CardDescription className="text-gray-600">
                Comparaison budget vs coûts réels sur 6 mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}K$`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: any) => [
                      `${new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "CAD",
                      maximumFractionDigits: 0,
                      }).format(value)}`,
                      "",
                    ]}
                    labelStyle={{ color: "#374151", fontWeight: "500" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                    name="Budget"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                    name="Coûts Réels"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Category Distribution */}
          <Card
            className="etafi-card animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-rose-500" />
                Répartition des Coûts
              </CardTitle>
              <CardDescription className="text-gray-600">
                Distribution des coûts par catégorie (5-group system)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {charts.costDistribution.map((category, index) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between"
                  >
                  <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                    <span className="text-sm font-medium text-gray-700">
                        {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            backgroundColor: category.color,
                            width: `${category.value}%`,
                          }}
                        ></div>
                    </div>
                      <span className="text-sm text-gray-600 w-8">
                        {category.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <Card
            className="etafi-card animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-rose-500" />
                Projets Récents
              </CardTitle>
              <CardDescription className="text-gray-600">
                Derniers projets créés et modifiés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {project.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              project.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : project.status === "ON_HOLD"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : project.status === "COMPLETED"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {project.status === "ACTIVE"
                              ? "Actif"
                              : project.status === "ON_HOLD"
                                ? "En Attente"
                                : project.status === "COMPLETED"
                                  ? "Terminé"
                                  : "Annulé"}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              project.kind === "BILLABLE"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {project.kind === "BILLABLE"
                              ? "Facturable"
                              : "Administratif"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{project._count.activities} activités</span>
                          <span>{project._count.invoices} factures</span>
                          <span>
                            {project._count.journalLines} transactions
                          </span>
                          {project.totalBudget && (
                            <span className="font-medium">
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "CAD",
                                notation: "compact",
                                maximumFractionDigits: 0,
                              }).format(project.totalBudget)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Modifié le{" "}
                          {new Date(project.updatedAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Voir →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Aucun projet trouvé</p>
                  <Link href="/dashboard/projects/new">
                    <Button className="mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un projet
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card
            className="etafi-card animate-fade-in-up"
            style={{ animationDelay: "0.7s" }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-500" />
                Activité Récente
              </CardTitle>
              <CardDescription className="text-gray-600">
                Dernières actions sur les projets et budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === "completed"
                            ? "bg-green-500"
                            : activity.status === "active"
                              ? "bg-blue-500"
                              : activity.status === "on_hold"
                                ? "bg-yellow-500"
                                : "bg-purple-500"
                        }`}
                      ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                  </div>
                </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Aucune activité récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card
            className="etafi-card animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-rose-500" />
                Actions Rapides
              </CardTitle>
              <CardDescription className="text-gray-600">
                Raccourcis vers les tâches les plus courantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/dashboard/projects/new">
                  <Button className="w-full etafi-button-primary justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un Nouveau Projet
                  </Button>
                </Link>
                <Link href="/dashboard/budgets/new">
                  <Button
                    variant="outline"
                    className="w-full etafi-button-secondary justify-start"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Créer un Budget
                  </Button>
                </Link>
                <Link href="/dashboard/project-templates">
                  <Button
                    variant="outline"
                    className="w-full etafi-button-secondary justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Modèles de Projets
                  </Button>
                </Link>
                <Link href="/dashboard/budget-reports">
                  <Button
                    variant="outline"
                    className="w-full etafi-button-secondary justify-start"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Rapports Budgétaires
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
