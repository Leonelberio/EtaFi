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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Data for the charts
const financialData = [
  { month: "Jan", revenue: 12000, expenses: 8000, profit: 4000 },
  { month: "Fév", revenue: 15000, expenses: 9500, profit: 5500 },
  { month: "Mar", revenue: 13000, expenses: 7000, profit: 6000 },
  { month: "Avr", revenue: 18000, expenses: 11000, profit: 7000 },
  { month: "Mai", revenue: 16000, expenses: 10000, profit: 6000 },
  { month: "Juin", revenue: 20000, expenses: 12000, profit: 8000 },
];

const employeeData = [
  { month: "Jan", totalEmployees: 50, newHires: 5, turnover: 2 },
  { month: "Fév", totalEmployees: 53, newHires: 4, turnover: 1 },
  { month: "Mar", totalEmployees: 55, newHires: 6, turnover: 3 },
  { month: "Avr", totalEmployees: 58, newHires: 5, turnover: 2 },
  { month: "Mai", totalEmployees: 61, newHires: 4, turnover: 1 },
  { month: "Juin", totalEmployees: 64, newHires: 3, turnover: 0 },
];

// Dashboard component
export default function Page() {
  const currentRevenue = 136000;
  const currentProfit = 36500;
  const currentEmployees = 64;
  const growthRate = 12.5;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-medium text-gray-600">
                Cabinet Comptable EtaFi
              </span>
            </div>
            <h1 className="etafi-section-header">Tableau de Bord</h1>
            <p className="etafi-section-subtitle">
              Vue d&apos;ensemble de vos clients et de leur performance
              financière
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
                <p className="dashboard-metric-label">Entreprises Clientes</p>
                <p className="dashboard-metric-value">24</p>
                <p className="text-sm text-green-600 font-medium">+3 ce mois</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">Exercices Actifs</p>
                <p className="dashboard-metric-value">31</p>
                <p className="text-sm text-blue-600 font-medium">
                  7 en clôture
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">États Financiers</p>
                <p className="dashboard-metric-value">128</p>
                <p className="text-sm text-purple-600 font-medium">
                  12 en attente
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
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
                  Chiffre d&apos;Affaires Total
                </p>
                <p className="dashboard-metric-value">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(currentRevenue * 1000)}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Clients combinés
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
          {/* Revenue Chart */}
          <Card
            className="etafi-card animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-rose-500" />
                Performance des Clients
              </CardTitle>
              <CardDescription className="text-gray-600">
                Chiffre d&apos;affaires agrégé de vos entreprises clientes sur 6
                mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData}>
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
                    tickFormatter={(value) => `${value}M€`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: any) => [`${value}M€`, ""]}
                    labelStyle={{ color: "#374151", fontWeight: "500" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    dot={{ fill: "#f43f5e", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#f43f5e", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Clients Overview */}
          <Card
            className="etafi-card animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-rose-500" />
                Répartition par Secteur
              </CardTitle>
              <CardDescription className="text-gray-600">
                Distribution de vos entreprises clientes par secteur
                d&apos;activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Services
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-20"></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Commerce
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-16"></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">28%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Industrie
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full w-12"></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">20%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Agriculture
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full w-10"></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">17%</span>
                  </div>
                </div>
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
                Dernières actions sur les dossiers clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Bilan finalisé pour TechStart SARL
                    </p>
                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Nouveau client ajouté: Commerce Plus SA
                    </p>
                    <p className="text-xs text-gray-500">Il y a 4 heures</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Exercice 2024 ouvert pour AgriCorp
                    </p>
                    <p className="text-xs text-gray-500">Hier</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      États financiers générés pour Service Pro
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
                <Link href="/dashboard/companies/new">
                  <Button className="w-full etafi-button-primary justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une Entreprise Cliente
                  </Button>
                </Link>
                <Link href="/dashboard/reports">
                  <Button
                    variant="outline"
                    className="w-full etafi-button-secondary justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Générer un État Financier
                  </Button>
                </Link>
                <Link href="/dashboard/reminders">
                  <Button
                    variant="outline"
                    className="w-full etafi-button-secondary justify-start"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Créer un Rappel
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button
                    variant="outline"
                    className="w-full etafi-button-secondary justify-start"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Voir les Analyses
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
