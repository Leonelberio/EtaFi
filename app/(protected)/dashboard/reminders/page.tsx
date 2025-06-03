"use client";

import { Bell, Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RemindersPage() {
  const reminders = [
    {
      id: 1,
      title: "Déclaration TVA",
      description: "Déclaration TVA mensuelle à soumettre",
      dueDate: "2024-02-15",
      priority: "high",
      company: "EtaFi Corp",
      status: "pending",
    },
    {
      id: 2,
      title: "Clôture exercice",
      description: "Préparation de la clôture de l'exercice fiscal",
      dueDate: "2024-03-31",
      priority: "medium",
      company: "Tech Solutions",
      status: "in_progress",
    },
    {
      id: 3,
      title: "Audit annuel",
      description: "Préparation des documents pour l'audit",
      dueDate: "2024-04-15",
      priority: "low",
      company: "Commerce Plus",
      status: "pending",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in-up">
              <h1 className="etafi-section-header">Rappels</h1>
              <p className="etafi-section-subtitle">
                Gérez vos échéances et obligations comptables
              </p>
            </div>
            <div className="animate-fade-in-up">
              <Button className="etafi-button-primary">
                <Plus className="h-5 w-5 mr-2" />
                Nouveau Rappel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rappels Actifs
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">1 priorité haute</p>
            </CardContent>
          </Card>

          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cette Semaine
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">échéance à venir</p>
            </CardContent>
          </Card>

          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Retard</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Tout est à jour</p>
            </CardContent>
          </Card>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <Card
              key={reminder.id}
              className="etafi-card hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reminder.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(reminder.priority)}
                      >
                        {reminder.priority === "high" && "Priorité haute"}
                        {reminder.priority === "medium" && "Priorité moyenne"}
                        {reminder.priority === "low" && "Priorité basse"}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(reminder.status)}
                      >
                        {reminder.status === "pending" && "En attente"}
                        {reminder.status === "in_progress" && "En cours"}
                        {reminder.status === "completed" && "Terminé"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{reminder.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Échéance:{" "}
                        {new Date(reminder.dueDate).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bell className="h-4 w-4" />
                        {reminder.company}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm">
                      Marquer terminé
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reminders.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun rappel
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier rappel pour ne rien oublier
            </p>
            <Button className="etafi-button-primary">
              <Plus className="h-5 w-5 mr-2" />
              Créer un Rappel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
