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
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Budget {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  totalAmount: number;
  spentAmount: number;
  remainingAmount: number;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED";
  startDate: string;
  endDate: string;
  currency: string;
  createdAt: string;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Simuler le chargement des budgets
    const mockBudgets: Budget[] = [
      {
        id: "1",
        name: "Budget Q1 2024",
        projectId: "proj-1",
        projectName: "Projet Résidentiel Alpha",
        totalAmount: 500000,
        spentAmount: 125000,
        remainingAmount: 375000,
        status: "ACTIVE",
        startDate: "2024-01-01",
        endDate: "2024-03-31",
        currency: "CAD",
        createdAt: "2024-01-01",
      },
      {
        id: "2",
        name: "Budget Q2 2024",
        projectId: "proj-2",
        projectName: "Projet Commercial Beta",
        totalAmount: 750000,
        spentAmount: 450000,
        remainingAmount: 300000,
        status: "ACTIVE",
        startDate: "2024-04-01",
        endDate: "2024-06-30",
        currency: "CAD",
        createdAt: "2024-04-01",
      },
    ];

    setTimeout(() => {
      setBudgets(mockBudgets);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch =
      budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || budget.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Actif
          </Badge>
        );
      case "INACTIVE":
        return <Badge variant="secondary">Inactif</Badge>;
      case "COMPLETED":
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getSpentPercentage = (spent: number, total: number) => {
    return Math.round((spent / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-gray-600">Gestion des budgets de projets</p>
        </div>
        <Link href="/dashboard/budgets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Budget
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
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
                  {formatCurrency(
                    budgets.reduce(
                      (sum, budget) => sum + budget.totalAmount,
                      0
                    ),
                    "CAD"
                  )}
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
                  {formatCurrency(
                    budgets.reduce(
                      (sum, budget) => sum + budget.spentAmount,
                      0
                    ),
                    "CAD"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Restant</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    budgets.reduce(
                      (sum, budget) => sum + budget.remainingAmount,
                      0
                    ),
                    "CAD"
                  )}
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
                <p className="text-sm font-medium text-gray-600">
                  Budgets Actifs
                </p>
                <p className="text-2xl font-bold">
                  {budgets.filter((b) => b.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom ou projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      <div className="space-y-4">
        {filteredBudgets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun budget trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Aucun budget ne correspond à vos critères de recherche."
                  : "Commencez par créer votre premier budget de projet."}
              </p>
              <Link href="/dashboard/budgets/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un budget
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredBudgets.map((budget) => (
            <Card key={budget.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{budget.name}</h3>
                      {getStatusBadge(budget.status)}
                    </div>
                    <p className="text-gray-600 mb-3">{budget.projectName}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Budget total</p>
                        <p className="font-semibold">
                          {formatCurrency(budget.totalAmount, budget.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dépensé</p>
                        <p className="font-semibold">
                          {formatCurrency(budget.spentAmount, budget.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Restant</p>
                        <p className="font-semibold">
                          {formatCurrency(
                            budget.remainingAmount,
                            budget.currency
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>
                          {getSpentPercentage(
                            budget.spentAmount,
                            budget.totalAmount
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getSpentPercentage(budget.spentAmount, budget.totalAmount)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Du{" "}
                        {new Date(budget.startDate).toLocaleDateString("fr-CA")}
                      </span>
                      <span>
                        Au{" "}
                        {new Date(budget.endDate).toLocaleDateString("fr-CA")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
