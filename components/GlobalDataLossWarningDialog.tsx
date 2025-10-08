"use client";

import { useUnsavedChanges } from "@/lib/contexts/unsaved-changes-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function GlobalDataLossWarningDialog() {
  const {
    showExitDialog,
    setShowExitDialog,
    confirmExit,
    cancelExit,
  } = useUnsavedChanges();

  return (
    <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            ⚠️ Modifications non sauvegardées
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700">
            <div className="space-y-2">
              <p>
                <strong>Attention !</strong> Vous avez des modifications non sauvegardées.
              </p>
              <p>
                Si vous naviguez vers une autre page maintenant,{" "}
                <strong>
                  toutes vos modifications seront définitivement perdues
                </strong>
                , y compris :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Les informations saisies dans les formulaires</li>
                <li>Les données temporaires</li>
                <li>Tous les changements non sauvegardés</li>
              </ul>
              <p className="font-medium text-red-600">
                Voulez-vous vraiment quitter sans sauvegarder ?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={cancelExit} className="flex-1">
            Annuler et continuer l'édition
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmExit}
            className="bg-red-600 hover:bg-red-700 flex-1"
          >
            Quitter sans sauvegarder
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
