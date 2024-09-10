// @ts-nocheck


'use client';

import { useState } from "react";
import {
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Modal components
import { Trash2, Calendar } from "lucide-react"; // Importing Trash Icon and Calendar Icon
import NewExerciceForm from "./new-exercice";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExercicesList({ exercices, onNewExercice, onDeleteExercice }) {
  const [selectedExerciceId, setSelectedExerciceId] = useState(null); // Store selected exercise ID for deletion confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Control whether the delete confirmation modal is shown
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const { companyId } = useParams(); 

  const handleDeleteClick = (id) => {
    setSelectedExerciceId(id); // Set the ID of the exercise to delete
    setShowConfirmDelete(true); // Show confirmation dialog
  };

  const handleConfirmDelete = async () => {
    if (selectedExerciceId) {
      await onDeleteExercice(selectedExerciceId); // Delete the exercise from the database
      setShowConfirmDelete(false); // Close the dialog
      setSelectedExerciceId(null); // Reset selected exercise ID
    }
  };

  const handleNewExercice = async (name, startDate, endDate) => {
    await onNewExercice(name, startDate, endDate);
    setIsDialogOpen(false); // Close dialog after the exercise is created
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Exercices</h2>

        {/* Modal trigger for new exercise */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>+ Nouvel Exercice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Ajouter un nouvel exercice</DialogTitle>
            <NewExerciceForm onNewExercice={handleNewExercice} existingExercices={exercices} /> {/* Pass the callback to handle new exercise */}
          </DialogContent>
        </Dialog>
      </div>
      
      {exercices.length > 0 ? (
        exercices.map((exercice) => (
          <div key={exercice.id} className="m-4">
            <CardContent className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-muted-foreground" /> {/* Calendar Icon */}
              <Link href={`/dashboard/companies/${companyId}/exercice/${exercice.id}`}>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">{exercice.name}</p>
                </div>
                <div className="ml-auto font-medium">
                  <p className="text-sm text-muted-foreground">
                    {new Date(exercice.startDate).toLocaleDateString()} -{" "}
                    {new Date(exercice.endDate).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              {/* Delete Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 ml-4"
                onClick={() => handleDeleteClick(exercice.id)} // Trigger the delete confirmation
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardContent>
          </div>
        ))
      ) : (
        <p>Aucun exercice trouvé</p>
      )}

      {/* Confirmation Dialog for Deleting an Exercise */}
      {showConfirmDelete && (
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent>
            <DialogTitle>Confirmation de suppression</DialogTitle>
            <p>Êtes-vous sûr de vouloir supprimer cet exercice ?</p>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete} // Confirm delete
              >
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
