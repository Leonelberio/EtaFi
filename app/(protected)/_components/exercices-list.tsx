// @ts-nocheck

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trash2,
  Calendar,
  Plus,
  CalendarDays,
  Clock,
  FileText,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import NewExerciceForm from "./new-exercice";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ExercicesList({
  exercices,
  onNewExercice,
  onDeleteExercice,
}) {
  const [selectedExerciceId, setSelectedExerciceId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { companyId } = useParams();

  const handleDeleteClick = (id) => {
    setSelectedExerciceId(id);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedExerciceId) {
      await onDeleteExercice(selectedExerciceId);
      setShowConfirmDelete(false);
      setSelectedExerciceId(null);
    }
  };

  const handleNewExercice = async (name, startDate, endDate) => {
    await onNewExercice(name, startDate, endDate);
    setIsDialogOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getExerciseStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start)
      return {
        status: "À venir",
        variant: "secondary",
        color: "text-blue-600",
      };
    if (now > end)
      return { status: "Terminé", variant: "outline", color: "text-gray-600" };
    return { status: "En cours", variant: "default", color: "text-green-600" };
  };

  const getDurationInMonths = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
    return `${months} mois`;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-rose-600" />
            Exercices Financiers
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les périodes comptables de votre entreprise
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Exercice
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 shadow-lg rounded-lg max-w-2xl">
            <DialogTitle>Ajouter un nouvel exercice</DialogTitle>
            <NewExerciceForm
              onNewExercice={handleNewExercice}
              existingExercices={exercices}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Exercices List */}
      {exercices.length > 0 ? (
        <div className="grid gap-4">
          {exercices.map((exercice) => {
            const statusInfo = getExerciseStatus(
              exercice.startDate,
              exercice.endDate
            );
            return (
              <Card
                key={exercice.id}
                className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Exercise Icon */}
                      <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-rose-600" />
                      </div>

                      {/* Exercise Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Exercice {exercice.name}
                          </h3>
                          <Badge
                            variant={statusInfo.variant}
                            className="text-xs"
                          >
                            {statusInfo.status}
                          </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                              {formatDate(exercice.startDate)} -{" "}
                              {formatDate(exercice.endDate)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {getDurationInMonths(
                                exercice.startDate,
                                exercice.endDate
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* View Exercise Button */}
                      <Link
                        href={`/dashboard/companies/${companyId}/exercice/${exercice.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Voir
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(exercice.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun exercice financier
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Commencez par créer votre premier exercice financier pour
              organiser vos périodes comptables.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-2 rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier exercice
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-gray-200 shadow-lg rounded-lg max-w-2xl">
                <DialogTitle>Ajouter un nouvel exercice</DialogTitle>
                <NewExerciceForm
                  onNewExercice={handleNewExercice}
                  existingExercices={exercices}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog for Deleting an Exercise */}
      {showConfirmDelete && (
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent className="bg-white border border-gray-200 shadow-lg rounded-lg max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Confirmation de suppression
              </DialogTitle>
            </div>

            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est
              irréversible et supprimera toutes les données associées.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
