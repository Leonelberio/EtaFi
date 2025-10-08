"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface ActivityFormData {
  name: string;
  projectId: string;
  parentActivityId?: string;
  description: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  estimatedCost: number;
  currency: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedTo?: string;
  isActive: boolean;
  dependencies: string[];
}

interface SubActivity {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  estimatedCost: number;
}

export default function NewActivityPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    name: "",
    projectId: "",
    parentActivityId: "",
    description: "",
    startDate: "",
    endDate: "",
    estimatedHours: 0,
    estimatedCost: 0,
    currency: "CAD",
    status: "PLANNED",
    priority: "MEDIUM",
    assignedTo: "",
    isActive: true,
    dependencies: [],
  });

  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [newSubActivity, setNewSubActivity] = useState<SubActivity>({
    id: "",
    name: "",
    description: "",
    estimatedHours: 0,
    estimatedCost: 0,
  });

  // Mock data
  const projects = [
    { id: "proj-1", name: "Projet Résidentiel Alpha" },
    { id: "proj-2", name: "Projet Commercial Beta" },
    { id: "proj-3", name: "Projet Infrastructure Gamma" },
  ];

  const parentActivities = [
    { id: "act-1", name: "Phase 1 - Fondations" },
    { id: "act-2", name: "Phase 2 - Structure" },
    { id: "act-3", name: "Phase 3 - Finitions" },
  ];

  const teamMembers = [
    { id: "user-1", name: "Jean Dupont", role: "Chef de projet" },
    { id: "user-2", name: "Marie Martin", role: "Ingénieur" },
    { id: "user-3", name: "Pierre Durand", role: "Technicien" },
  ];

  const currencies = [
    { value: "CAD", label: "CAD - Dollar canadien" },
    { value: "USD", label: "USD - Dollar américain" },
    { value: "EUR", label: "EUR - Euro" },
  ];

  const handleInputChange = (
    field: keyof ActivityFormData,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSubActivity = () => {
    if (newSubActivity.name.trim()) {
      const subActivity = {
        ...newSubActivity,
        id: `sub-${Date.now()}`,
      };
      setSubActivities((prev) => [...prev, subActivity]);
      setNewSubActivity({
        id: "",
        name: "",
        description: "",
        estimatedHours: 0,
        estimatedCost: 0,
      });
    }
  };

  const removeSubActivity = (id: string) => {
    setSubActivities((prev) => prev.filter((sub) => sub.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simuler l'envoi des données
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const activityData = {
        ...formData,
        subActivities,
      };
      console.log("Activité créée:", activityData);
      window.location.href = "/dashboard/activities";
    } catch (error) {
      console.error("Erreur lors de la création de l'activité:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/activities">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Activité</h1>
          <p className="text-gray-600">
            Créer une nouvelle activité pour un projet
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  Informations de base
                </CardTitle>
                <CardDescription>
                  Définissez les informations principales de l'activité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'activité *</Label>
                    <Input
                      id="name"
                      placeholder="ex: Installation électrique"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Projet *</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) =>
                        handleInputChange("projectId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un projet" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentActivityId">Activité parente</Label>
                  <Select
                    value={formData.parentActivityId}
                    onValueChange={(value) =>
                      handleInputChange("parentActivityId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une activité parente (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune activité parente</SelectItem>
                      {parentActivities.map((activity) => (
                        <SelectItem key={activity.id} value={activity.id}>
                          {activity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez les détails de cette activité..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dates et estimations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  Dates et estimations
                </CardTitle>
                <CardDescription>
                  Définissez la période et les estimations de l'activité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Heures estimées</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      placeholder="0"
                      value={formData.estimatedHours}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedHours",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost">Coût estimé</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      placeholder="0.00"
                      value={formData.estimatedCost}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedCost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      handleInputChange("currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Statut et priorité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">3</span>
                  </div>
                  Statut et assignation
                </CardTitle>
                <CardDescription>
                  Configurez le statut et l'assignation de l'activité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planifiée</SelectItem>
                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                        <SelectItem value="COMPLETED">Terminée</SelectItem>
                        <SelectItem value="CANCELLED">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorité</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        handleInputChange("priority", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyenne</SelectItem>
                        <SelectItem value="HIGH">Élevée</SelectItem>
                        <SelectItem value="CRITICAL">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigné à</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) =>
                      handleInputChange("assignedTo", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un membre de l'équipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non assigné</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Activité active</Label>
                    <p className="text-sm text-gray-600">
                      L'activité sera active et visible dans le projet
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sous-activités */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">4</span>
                  </div>
                  Sous-activités
                </CardTitle>
                <CardDescription>
                  Ajoutez des sous-activités détaillées (optionnel)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subActivityName">
                      Nom de la sous-activité
                    </Label>
                    <Input
                      id="subActivityName"
                      placeholder="ex: Installation des prises"
                      value={newSubActivity.name}
                      onChange={(e) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subActivityHours">Heures estimées</Label>
                    <Input
                      id="subActivityHours"
                      type="number"
                      placeholder="0"
                      value={newSubActivity.estimatedHours}
                      onChange={(e) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          estimatedHours: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subActivityDescription">Description</Label>
                    <Input
                      id="subActivityDescription"
                      placeholder="Description de la sous-activité"
                      value={newSubActivity.description}
                      onChange={(e) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subActivityCost">Coût estimé</Label>
                    <Input
                      id="subActivityCost"
                      type="number"
                      placeholder="0.00"
                      value={newSubActivity.estimatedCost}
                      onChange={(e) =>
                        setNewSubActivity((prev) => ({
                          ...prev,
                          estimatedCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSubActivity}
                  disabled={!newSubActivity.name.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter la sous-activité
                </Button>

                {subActivities.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sous-activités ajoutées</Label>
                    <div className="space-y-2">
                      {subActivities.map((subActivity) => (
                        <div
                          key={subActivity.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{subActivity.name}</p>
                            <p className="text-sm text-gray-600">
                              {subActivity.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subActivity.estimatedHours}h -{" "}
                              {formatCurrency(
                                subActivity.estimatedCost,
                                formData.currency
                              )}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSubActivity(subActivity.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Résumé */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nom:</span>
                  <span className="text-sm font-medium">
                    {formData.name || "Non défini"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Projet:</span>
                  <span className="text-sm font-medium">
                    {projects.find((p) => p.id === formData.projectId)?.name ||
                      "Non sélectionné"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Période:</span>
                  <span className="text-sm font-medium">
                    {formData.startDate && formData.endDate
                      ? `${new Date(formData.startDate).toLocaleDateString("fr-CA")} - ${new Date(formData.endDate).toLocaleDateString("fr-CA")}`
                      : "Non définie"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Heures:</span>
                  <span className="text-sm font-medium">
                    {formData.estimatedHours}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Coût:</span>
                  <span className="text-sm font-medium">
                    {formData.estimatedCost > 0
                      ? formatCurrency(
                          formData.estimatedCost,
                          formData.currency
                        )
                      : "Non défini"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Statut:</span>
                  <span className="text-sm font-medium">
                    {formData.status === "PLANNED"
                      ? "Planifiée"
                      : formData.status === "IN_PROGRESS"
                        ? "En cours"
                        : formData.status === "COMPLETED"
                          ? "Terminée"
                          : "Annulée"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Priorité:</span>
                  <span className="text-sm font-medium">
                    {formData.priority === "LOW"
                      ? "Faible"
                      : formData.priority === "MEDIUM"
                        ? "Moyenne"
                        : formData.priority === "HIGH"
                          ? "Élevée"
                          : "Critique"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sous-activités:</span>
                  <span className="text-sm font-medium">
                    {subActivities.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Créer l'activité
                      </>
                    )}
                  </Button>

                  <Link href="/dashboard/activities">
                    <Button variant="outline" className="w-full">
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
