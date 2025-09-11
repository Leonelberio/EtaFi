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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Settings,
  Filter,
  Search,
  DollarSign,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";

interface BudgetAlert {
  id: string;
  name: string;
  budgetId: string;
  budgetName: string;
  projectName: string;
  type: "THRESHOLD" | "DEADLINE" | "OVERRUN" | "UNDERSPEND";
  threshold: number;
  currentAmount: number;
  budgetAmount: number;
  status: "ACTIVE" | "TRIGGERED" | "RESOLVED" | "DISABLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
  lastTriggered?: string;
  description: string;
}

interface AlertSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

export default function BudgetAlertsPage() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    dailyDigest: true,
    weeklyReport: false,
  });

  useEffect(() => {
    // Simuler le chargement des alertes
    const mockAlerts: BudgetAlert[] = [
      {
        id: "1",
        name: "Seuil 80% - Projet Alpha",
        budgetId: "budget-1",
        budgetName: "Budget Q1 2024",
        projectName: "Projet Résidentiel Alpha",
        type: "THRESHOLD",
        threshold: 80,
        currentAmount: 400000,
        budgetAmount: 500000,
        status: "TRIGGERED",
        priority: "HIGH",
        createdAt: "2024-01-15",
        lastTriggered: "2024-01-20",
        description: "Le budget a atteint 80% de son montant total",
      },
      {
        id: "2",
        name: "Échéance approche - Projet Beta",
        budgetId: "budget-2",
        budgetName: "Budget Q2 2024",
        projectName: "Projet Commercial Beta",
        type: "DEADLINE",
        threshold: 0,
        currentAmount: 450000,
        budgetAmount: 750000,
        status: "ACTIVE",
        priority: "MEDIUM",
        createdAt: "2024-04-01",
        description: "La fin du budget approche dans 15 jours",
      },
      {
        id: "3",
        name: "Dépassement critique - Projet Gamma",
        budgetId: "budget-3",
        budgetName: "Budget Infrastructure",
        projectName: "Projet Infrastructure Gamma",
        type: "OVERRUN",
        threshold: 0,
        currentAmount: 1200000,
        budgetAmount: 1000000,
        status: "TRIGGERED",
        priority: "CRITICAL",
        createdAt: "2024-03-01",
        lastTriggered: "2024-03-15",
        description: "Le budget a été dépassé de 20%",
      },
      {
        id: "4",
        name: "Sous-utilisation - Projet Delta",
        budgetId: "budget-4",
        budgetName: "Budget Maintenance",
        projectName: "Projet Maintenance Delta",
        type: "UNDERSPEND",
        threshold: 20,
        currentAmount: 50000,
        budgetAmount: 300000,
        status: "ACTIVE",
        priority: "LOW",
        createdAt: "2024-02-01",
        description: "Le budget est sous-utilisé à 16.7%",
      },
    ];

    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.budgetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || alert.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || alert.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Actif
          </Badge>
        );
      case "TRIGGERED":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Déclenché
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Résolu
          </Badge>
        );
      case "DISABLED":
        return <Badge variant="secondary">Désactivé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return (
          <Badge variant="destructive" className="bg-red-600 text-white">
            Critique
          </Badge>
        );
      case "HIGH":
        return (
          <Badge
            variant="destructive"
            className="bg-orange-100 text-orange-800"
          >
            Élevé
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Moyen
          </Badge>
        );
      case "LOW":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Faible
          </Badge>
        );
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "THRESHOLD":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "DEADLINE":
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case "OVERRUN":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "UNDERSPEND":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA");
  };

  const getUsagePercentage = (current: number, budget: number) => {
    return Math.round((current / budget) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alertes de Budget</h1>
          <p className="text-gray-600">
            Surveillance et notifications des budgets de projets
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configurer les alertes
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Alertes Déclenchées
                </p>
                <p className="text-2xl font-bold">
                  {alerts.filter((a) => a.status === "TRIGGERED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Alertes Actives
                </p>
                <p className="text-2xl font-bold">
                  {alerts.filter((a) => a.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Alertes Critiques
                </p>
                <p className="text-2xl font-bold">
                  {alerts.filter((a) => a.priority === "CRITICAL").length}
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
                  Total Alertes
                </p>
                <p className="text-2xl font-bold">{alerts.length}</p>
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
                  placeholder="Rechercher par nom, projet ou budget..."
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
                <SelectItem value="TRIGGERED">Déclenché</SelectItem>
                <SelectItem value="RESOLVED">Résolu</SelectItem>
                <SelectItem value="DISABLED">Désactivé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="CRITICAL">Critique</SelectItem>
                <SelectItem value="HIGH">Élevé</SelectItem>
                <SelectItem value="MEDIUM">Moyen</SelectItem>
                <SelectItem value="LOW">Faible</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune alerte trouvée
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all"
                    ? "Aucune alerte ne correspond à vos critères de recherche."
                    : "Aucune alerte configurée pour le moment."}
                </p>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurer des alertes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {alert.name}
                            </h3>
                            {getStatusBadge(alert.status)}
                            {getPriorityBadge(alert.priority)}
                          </div>
                          <p className="text-gray-600 mb-3">
                            {alert.projectName} - {alert.budgetName}
                          </p>
                          <p className="text-sm text-gray-700 mb-4">
                            {alert.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                Budget total
                              </p>
                              <p className="font-semibold">
                                {formatCurrency(alert.budgetAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Montant actuel
                              </p>
                              <p className="font-semibold">
                                {formatCurrency(alert.currentAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Utilisation
                              </p>
                              <p className="font-semibold">
                                {getUsagePercentage(
                                  alert.currentAmount,
                                  alert.budgetAmount
                                )}
                                %
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progression</span>
                              <span>
                                {getUsagePercentage(
                                  alert.currentAmount,
                                  alert.budgetAmount
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  alert.priority === "CRITICAL"
                                    ? "bg-red-600"
                                    : alert.priority === "HIGH"
                                      ? "bg-orange-600"
                                      : alert.priority === "MEDIUM"
                                        ? "bg-yellow-600"
                                        : "bg-green-600"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    getUsagePercentage(
                                      alert.currentAmount,
                                      alert.budgetAmount
                                    ),
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Créé le {formatDate(alert.createdAt)}</span>
                            {alert.lastTriggered && (
                              <span>
                                Déclenché le {formatDate(alert.lastTriggered)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <BellOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Notification</CardTitle>
              <CardDescription>
                Configurez comment vous souhaitez recevoir les alertes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Notifications par email
                    </label>
                    <p className="text-sm text-gray-600">
                      Recevoir les alertes par email
                    </p>
                  </div>
                  <Switch
                    checked={alertSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => ({
                        ...prev,
                        emailNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Notifications push
                    </label>
                    <p className="text-sm text-gray-600">
                      Recevoir les alertes dans l'application
                    </p>
                  </div>
                  <Switch
                    checked={alertSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => ({
                        ...prev,
                        pushNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Notifications SMS
                    </label>
                    <p className="text-sm text-gray-600">
                      Recevoir les alertes critiques par SMS
                    </p>
                  </div>
                  <Switch
                    checked={alertSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => ({
                        ...prev,
                        smsNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Résumé quotidien
                    </label>
                    <p className="text-sm text-gray-600">
                      Recevoir un résumé quotidien des alertes
                    </p>
                  </div>
                  <Switch
                    checked={alertSettings.dailyDigest}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => ({
                        ...prev,
                        dailyDigest: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Rapport hebdomadaire
                    </label>
                    <p className="text-sm text-gray-600">
                      Recevoir un rapport hebdomadaire des budgets
                    </p>
                  </div>
                  <Switch
                    checked={alertSettings.weeklyReport}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => ({
                        ...prev,
                        weeklyReport: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
