"use client";

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

interface DataLossWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemsToLose?: string[];
}

export function DataLossWarningDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "⚠️ Modifications non sauvegardées",
  description = "Vous avez des modifications non sauvegardées.",
  itemsToLose = [],
}: DataLossWarningDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700">
            <div className="space-y-2">
              <p>
                <strong>Attention !</strong> {description}
              </p>
              <p>
                Si vous quittez maintenant,{" "}
                <strong>
                  toutes vos modifications seront définitivement perdues
                </strong>
                {itemsToLose.length > 0 && ", y compris :"}
              </p>
              {itemsToLose.length > 0 && (
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  {itemsToLose.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
              <p className="font-medium text-red-600">
                Voulez-vous vraiment quitter sans sauvegarder ?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={onClose} className="flex-1">
            Annuler et continuer l'édition
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 flex-1"
          >
            Quitter sans sauvegarder
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
