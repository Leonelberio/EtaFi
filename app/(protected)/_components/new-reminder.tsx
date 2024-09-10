// @ts-nocheck


'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"; // Import select component for reminder type
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatNumber } from '@/lib/utils';

// Helper function to divide impôt by 4
const divideImpotByFour = (amount) => {
  const part = (amount / 4).toFixed(2); // Divide by 4 with 2 decimal precision
  return Array(4).fill(Number(part));
};

export default function ReminderForm({ user, onSaveReminder, existingReminder = null }) {
  const [reminderType, setReminderType] = useState(existingReminder?.type || ''); // Store reminder type
  const [impotAmount, setImpotAmount] = useState(existingReminder?.alerts?.[0]?.amount * 4 || 0);
  const { exerciceId, companyId } = useParams();
  const { data: session } = useSession(); // Get session data

  const [dates, setDates] = useState([
    { date: "31/01", status: "Non payé", amount: 0 },
    { date: "31/05", status: "Non payé", amount: 0 },
    { date: "31/07", status: "Non payé", amount: 0 },
    { date: "31/10", status: "Non payé", amount: 0 },
  ]);

  // Populate form if editing an existing reminder
  useEffect(() => {
    if (existingReminder) {
      setReminderType(existingReminder.type);
      setImpotAmount(existingReminder.alerts[0].amount * 4);
      setDates(existingReminder.alerts);
    }
  }, [existingReminder]);

  // Handle change in reminder type
  const handleTypeChange = (type) => {
    setReminderType(type);
  };

  // When impôt amount changes, divide it by 4 and update amounts for each date
  const handleImpotAmountChange = (e) => {
    const amount = Number(e.target.value);
    setImpotAmount(amount);
    const dividedAmounts = divideImpotByFour(amount);
    const updatedDates = dates.map((d, index) => ({
      ...d,
     amount: dividedAmounts[index],
    }));
    setDates(updatedDates);
  };

  // Handle status change
  const handleStatusChange = (index) => {
    const updatedDates = [...dates];
    const dateObj = updatedDates[index];
    dateObj.status = dateObj.status === "Non payé" ? "Payé" : "Non payé"; // Toggle status
    dateObj.updatedBy = session?.user.name; // Add the name of the user who changed the status
    dateObj.updatedAt = new Date().toLocaleDateString(); // Add the updated date
    setDates(updatedDates);
  };

  // Save reminder
  const handleSave = () => {
    const reminderData = {
      type: reminderType,
      exerciceId: exerciceId, // Add this based on the selected exercice
      userId: session?.user.id,
      alerts: dates,  // Store the dates and amounts in the alerts field
    };

    // Call the save callback with reminder data and ID if it's an existing reminder
    onSaveReminder(reminderData, existingReminder?.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingReminder ? 'Modifier le Rappel' : 'Créer un Rappel'}</CardTitle>
        <CardDescription>{existingReminder ? 'Modifier le rappel existant.' : 'Ajouter un rappel pour les paiements d\'impôt ou autres.'}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Select Reminder Type */}
        <div>
          <Label htmlFor="reminderType">Type de rappel</Label>
          <Select onValueChange={handleTypeChange} value={reminderType}>
            <SelectTrigger id="reminderType">
              <span>{reminderType || "Sélectionner le type de rappel"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Impôt">Impôt</SelectItem>
              {/* You can add more types here */}
            </SelectContent>
          </Select>
        </div>

        {/* Show Impôt Amount Input and Payment Dates only if "Impôt" is selected */}
        {reminderType === "Impôt" && (
          <>
            {/* Impôt Amount Input */}
            <div>
              <Label htmlFor="impotAmount">Montant de l&apos;impôt</Label>
              <Input
                id="impotAmount"
                type="number"
                placeholder="Entrez le montant total de l'impôt"
                value={impotAmount}
                onChange={handleImpotAmountChange}
                min={0}
              />
            </div>

            {/* Table to show dates and amounts */}
            <div>
              <h4 className="font-semibold text-lg mb-2">Dates de paiement</h4>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Montant</th>
                    <th className="text-left">Statut</th>
                    <th className="text-left">Dernière mise à jour</th>
                  </tr>
                </thead>
                <tbody>
                  {dates.map((dateObj, index) => (
                    <tr key={index}>
                      <td>{dateObj.date}</td>
                      <td>{formatNumber(dateObj.amount)} F</td>
                      <td>
                        <Button
                          variant={dateObj.status === "Payé" ? "secondary" : "outline"}
                          onClick={() => handleStatusChange(index)}
                        >
                          {dateObj.status}
                        </Button>
                      </td>
                      <td>
                        {dateObj.updatedBy
                          ? `${dateObj.updatedBy} le ${dateObj.updatedAt}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Save Button */}
        <Button onClick={handleSave}>
          {existingReminder ? 'Mettre à jour le Rappel' : 'Enregistrer le Rappel'}
        </Button>
      </CardContent>
    </Card>
  );
}
