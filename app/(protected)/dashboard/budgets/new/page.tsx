"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";

interface BudgetFormData {
  name: string;
  projectId: string;
  totalAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
}

export default function NewBudgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BudgetFormData>({
    name: "",
    projectId: "",
    totalAmount: 0,
    currency: "CAD",
    startDate: "",
    endDate: "",
    description: "",
    isActive: true,
  });

  // Mock data pour les projets
  const projects = [
    { id: "proj-1", name: "Projet Résidentiel Alpha" },
    { id: "proj-2", name: "Projet Commercial Beta" },
    { id: "proj-3", name: "Projet Infrastructure Gamma" },
  ];

  const currencies = [
    { value: "CAD", label: "CAD - Dollar canadien" },
    { value: "USD", label: "USD - Dollar américain" },
    { value: "EUR", label: "EUR - Euro" },
  ];

  const handleInputChange = (
    field: keyof BudgetFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simuler l'envoi des données
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Budget créé:", formData);
      router.push("/dashboard/budgets");
    } catch (error) {
      console.error("Erreur lors de la création du budget:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/budgets">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouveau Budget</h1>
          <p className="text-gray-600">
            Créer un nouveau budget pour un projet
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
                  Définissez les informations principales du budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du budget *</Label>
                    <Input
                      id="name"
                      placeholder="ex: Budget Q1 2024"
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez l'objectif et le contexte de ce budget..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Montants et dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  Montants et période
                </CardTitle>
                <CardDescription>
                  Définissez le montant total et la période du budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Montant total *</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      placeholder="0.00"
                      value={formData.totalAmount}
                      onChange={(e) =>
                        handleInputChange(
                          "totalAmount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise *</Label>
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
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">3</span>
                  </div>
                  Options
                </CardTitle>
                <CardDescription>
                  Configurez les options du budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Budget actif</Label>
                    <p className="text-sm text-gray-600">
                      Le budget sera actif et pourra recevoir des dépenses
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
                  <span className="text-sm text-gray-600">Montant:</span>
                  <span className="text-sm font-medium">
                    {formData.totalAmount > 0
                      ? new Intl.NumberFormat("fr-CA", {
                          style: "currency",
                          currency: formData.currency,
                        }).format(formData.totalAmount)
                      : "Non défini"}
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
                  <span className="text-sm text-gray-600">Statut:</span>
                  <span className="text-sm font-medium">
                    {formData.isActive ? "Actif" : "Inactif"}
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
                        Créer le budget
                      </>
                    )}
                  </Button>

                  <Link href="/dashboard/budgets">
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
