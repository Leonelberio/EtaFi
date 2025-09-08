"use client";

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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ERP Project Performance Data
const projectPerformanceData = [
  { month: "Jan", budget: 45000, actual: 42000, variance: 3000 },
  { month: "Fév", budget: 52000, actual: 48000, variance: 4000 },
  { month: "Mar", budget: 48000, actual: 51000, variance: -3000 },
  { month: "Avr", budget: 60000, actual: 55000, variance: 5000 },
  { month: "Mai", budget: 55000, actual: 58000, variance: -3000 },
  { month: "Juin", budget: 65000, actual: 62000, variance: 3000 },
];

// Cost Category Distribution
const costCategoryData = [
  { name: "Matériel", value: 35, amount: 125000, color: "#3B82F6" },
  { name: "Sous-traitance", value: 25, amount: 89000, color: "#10B981" },
  { name: "Main-d'œuvre", value: 20, amount: 72000, color: "#F59E0B" },
  { name: "Équipement", value: 12, amount: 43000, color: "#8B5CF6" },
  { name: "Divers", value: 8, amount: 28000, color: "#EF4444" },
];

// Project Status Distribution
const projectStatusData = [
  { status: "Actif", count: 8, percentage: 50 },
  { status: "En Attente", count: 3, percentage: 19 },
  { status: "Terminé", count: 4, percentage: 25 },
  { status: "Annulé", count: 1, percentage: 6 },
];

// Dashboard component
export default function Page() {
  const totalProjects = 16;
  const activeProjects = 8;
  const totalBudget = 325000;
  const actualCosts = 286000;
  const budgetVariance = 39000;
  const completionRate = 68;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-medium text-gray-600">
                ERP Comptable - Comptabilité par Projet
              </span>
            </div>
            <h1 className="etafi-section-header">Tableau de Bord</h1>
            <p className="etafi-section-subtitle">
              Vue d&apos;ensemble de vos projets et de leur performance budgétaire
            </p>
          </div>
        </div>
      </div>

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
                <p className="dashboard-metric-value">{totalProjects}</p>
                <p className="text-sm text-green-600 font-medium">{activeProjects} actifs</p>
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
                  }).format(totalBudget)}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {completionRate}% complété
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
                  }).format(actualCosts)}
                </p>
                <p className="text-sm text-purple-600 font-medium">
                  vs budget
                </p>
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
                <p className="dashboard-metric-label">
                  Écart Budgétaire
                </p>
                <p className={`dashboard-metric-value ${budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {budgetVariance >= 0 ? '+' : ''}{new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "CAD",
                    notation: "compact",
                    maximumFractionDigits: 0,
                  }).format(budgetVariance)}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  {budgetVariance >= 0 ? 'Sous budget' : 'Dépassement'}
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
                <LineChart data={projectPerformanceData}>
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
                    tickFormatter={(value) => `${value/1000}K$`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: any) => [`${new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "CAD",
                      maximumFractionDigits: 0,
                    }).format(value)}`, ""]}
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
                {costCategoryData.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
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
                            width: `${category.value}%`
                          }}
                        ></div>
                    </div>
                      <span className="text-sm text-gray-600 w-8">{category.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
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
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Projet &quot;Construction Résidentielle&quot; terminé
                    </p>
                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Nouveau budget créé pour &quot;Rénovation Commerciale&quot;
                    </p>
                    <p className="text-xs text-gray-500">Il y a 4 heures</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Alerte budget: Dépassement 15% sur &quot;Infrastructure&quot;
                    </p>
                    <p className="text-xs text-gray-500">Hier</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Modèle de projet &quot;Maintenance&quot; appliqué
                    </p>
                    <p className="text-xs text-gray-500">Il y a 2 jours</p>
                  </div>
                </div>
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
