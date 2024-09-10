// @ts-nocheck


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Calendar } from 'lucide-react'; // Importing Trash and Calendar Icons
import { useParams } from 'next/navigation';
import ReminderForm from './new-reminder';
import { useToast } from '@/components/hooks/use-toast'; // Import the useToast hook
import { formatNumber } from '@/lib/utils';

export default function ReminderTable({ reminders, onSaveReminder, onDeleteReminder }) {
  const { toast } = useToast(); // Use custom useToast hook
  const [selectedReminderId, setSelectedReminderId] = useState(null); // Track which reminder is selected for delete
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Control delete confirmation modal
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control form dialog visibility
  const [editingReminder, setEditingReminder] = useState(null); // Store reminder for editing
  const { companyId, exerciceId } = useParams();

  // Utility function to calculate days remaining until the next payment date
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const [day, month, year] = dateString.split('/').map(Number); // Split the date in DD/MM/YYYY format or DD/MM

    // If year is not provided, assume it's the current year
    const currentYear = today.getFullYear();
    const targetYear = year || currentYear;

    // Construct the date object, using the provided or current year
    const targetDate = new Date(targetYear, month - 1, day); // Months are zero-indexed

    // Calculate the difference in time and convert to days
    const timeDiff = targetDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert time difference to days

    return daysRemaining;
  };

  // Function to trigger manual notification immediately with the remaining days
  const triggerManualNotification = (companyName, reminder, toast) => {
    const upcomingAlert = reminder.alerts.find((alert) => {
      const daysRemaining = getDaysRemaining(alert.date);
      return daysRemaining >= 0 && alert.status === 'Non payé'; // Only consider unpaid, future alerts
    });

    if (upcomingAlert) {
      const daysRemaining = getDaysRemaining(upcomingAlert.date);
      let description = `La société ${companyName} doit payer ${formatNumber(upcomingAlert.amount)} F le ${upcomingAlert.date}`;

      if (daysRemaining > 0) {
        description += ` dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}.`;
      } else if (daysRemaining === 0) {
        description += ` Aujourd'hui est le jour de paiement !`;
      }

      // Show toast notification with remaining days
      toast({ description });
    } else {
      toast({ description: `Aucune échéance impayée à venir pour la société ${companyName}.` });
    }
  };

  // Open dialog for creating a new reminder
  const handleCreateNewReminder = () => {
    setEditingReminder(null); // Clear editing state
    setIsDialogOpen(true); // Open the dialog for creating a reminder
  };

  // Open dialog for editing a reminder
  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder); // Set reminder in editing mode
    setIsDialogOpen(true); // Open dialog for editing
  };

  // Handle delete click
  const handleDeleteClick = (id) => {
    setSelectedReminderId(id);
    setShowConfirmDelete(true); // Open confirmation modal
  };

  // Confirm delete reminder
  const handleConfirmDelete = async () => {
    if (selectedReminderId) {
      await onDeleteReminder(selectedReminderId); // Call delete function
      setShowConfirmDelete(false); // Close modal
      setSelectedReminderId(null); // Reset selected reminder ID
    }
  };

  // Manual trigger for notifications
  const handleManualNotification = (reminder) => {
    triggerManualNotification('Nom de la Société', reminder, toast); // Trigger toast with remaining days for the next payment
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Rappels</h2>

        {/* Dialog trigger for creating a new reminder */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNewReminder}>+ Ajouter un Rappel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>{editingReminder ? 'Modifier le Rappel' : 'Ajouter un Rappel'}</DialogTitle>
            <div className="mt-4">
              <ReminderForm
                existingReminder={editingReminder}
                onSaveReminder={(reminderData) => {
                  const reminderId = editingReminder ? editingReminder.id : null; // Pass reminder ID if editing
                  onSaveReminder(reminderData, reminderId); // Pass reminder ID to the save function
                  setIsDialogOpen(false); // Close dialog after saving
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reminder List */}
      {reminders.length > 0 ? (
        reminders.map((reminder) => {
          const totalAmount = reminder.alerts.reduce((sum, alert) => sum + alert.amount, 0); // Calculate total amount
          const remainingAmount = reminder.alerts
            .filter((alert) => alert.status === 'Non payé')
            .reduce((sum, alert) => sum + alert.amount, 0); // Calculate remaining unpaid amount

          return (
            <div key={reminder.id} className="w-full">
              <CardContent className="flex items-center justify-between gap-4 py-4 px-6 border border-gray-300 rounded-md shadow-sm">
                {/* Reminder Type and Calendar Icon */}
                <div className="flex items-center gap-4">
                  <Calendar className="w-6 h-6 text-gray-500" />
                  <p className="text-sm font-medium">{reminder.type}</p>
                </div>

                {/* Rectangles for alert statuses */}
                <div className="flex items-center gap-2">
                  {reminder.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded ${alert.status === 'Payé' ? 'bg-green-500' : 'bg-red-500'}`}
                      title={`Échéance du ${alert.date}: ${alert.status}`}
                    />
                  ))}
                </div>

                {/* Total Amount and Remaining Amount */}
                <div className="flex flex-col text-right">
                  <p className="text-sm font-medium">Total: {formatNumber(totalAmount)} F</p>
                  <p className="text-sm font-medium text-red-500">Restant: {formatNumber(remainingAmount)} F</p>
                </div>

                {/* Notification Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleManualNotification(reminder)}
                >
                  Rappeler
                </Button>

<div className='flex align-middle justify-center gap-4'>

                {/* Edit Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditReminder(reminder)}
                  >
                  Modifier
                </Button>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600"
                  onClick={() => handleDeleteClick(reminder.id)} // Trigger the delete confirmation
                  >
                  <Trash2 className="w-5 h-5" />
                </Button>
                  </div>
              </CardContent>
            </div>
          );
        })
      ) : (
        <p>Aucun rappel trouvé</p>
      )}

      {/* Confirmation Dialog for Deleting a Reminder */}
      {showConfirmDelete && (
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent>
            <DialogTitle>Confirmation de suppression</DialogTitle>
            <p>Êtes-vous sûr de vouloir supprimer ce rappel ?</p>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
