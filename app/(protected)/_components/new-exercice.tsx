// @ts-nocheck


'use client';

import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Importing the date picker CSS
import { getMonth, getYear, addYears } from "date-fns"; // Import getYear, getMonth, and addYears from date-fns
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const monthsInFrench = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", 
  "Septembre", "Octobre", "Novembre", "Décembre",
];

const years = Array.from({ length: 50 }, (_, i) => i + 1990);

export default function NewExerciceForm({ onNewExercice, existingExercices }) {
  const [name, setName] = React.useState<number | null>(null); // Change name to an integer
  const [startDate, setStartDate] = React.useState<Date | null>(new Date()); 
  const [endDate, setEndDate] = React.useState<Date | null>(addYears(new Date(), 1));
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleCreateExercice = async () => {
    // Check if the name already exists in the list of exercises
    const nameExists = existingExercices?.some(exercice => exercice.name === name);
  
    

    if (name === null || !startDate || !endDate) {
      setErrorMessage("All fields are required");
      return;
    }

    if (nameExists) {
      setErrorMessage("L'exercice existe déjà.");
      return;
    }

    await onNewExercice(name, startDate, endDate); 
    setErrorMessage(null); 
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date) {
      const newEndDate = addYears(date, 1);
      setEndDate(newEndDate);
    }
  };

  return (
    <div className="space-y-8">
      {/* Exercice Name */}
      <div className="grid gap-6">
        <div>
          <Label htmlFor="name">Nom de l&apos;exercice (année)</Label>
          <Input
            id="name"
            type="number" // Set input type to number
            value={name !== null ? name : ""}
            onChange={(e) => setName(e.target.value ? parseInt(e.target.value, 10) : null)} // Ensure it's an integer
            placeholder="Ex: 2024, 2025"
            required
          />
          {errorMessage && <p className="text-red-500 mt-1">{errorMessage}</p>}
        </div>

        {/* Start Date Picker */}
        <div>
          <Label>Date de début</Label>
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange} 
              dateFormat="dd/MM/yyyy"
              className={cn(
                "w-full pl-10 pr-3 py-2 border rounded-md shadow-sm",
                "text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              )}
              placeholderText="Sélectionnez la date de début"
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="flex justify-between items-center px-2">
                  <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                    {"<"}
                  </button>
                  <div className="flex items-center space-x-2">
                    <select
                      className="border rounded-md p-1"
                      value={getYear(date)}
                      onChange={({ target: { value } }) => changeYear(parseInt(value))}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <select
                      className="border rounded-md p-1"
                      value={monthsInFrench[getMonth(date)]}
                      onChange={({ target: { value } }) =>
                        changeMonth(monthsInFrench.indexOf(value))
                      }
                    >
                      {monthsInFrench.map((month, index) => (
                        <option key={index} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                    {">"}
                  </button>
                </div>
              )}
            />
            <CalendarIcon className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5 pointer-events-none" />
          </div>
        </div>

        {/* End Date Picker */}
        <div>
          <Label>Date de fin</Label>
          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className={cn(
                "w-full pl-10 pr-3 py-2 border rounded-md shadow-sm",
                "text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              )}
              placeholderText="Sélectionnez la date de fin"
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="flex justify-between items-center px-2">
                  <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                    {"<"}
                  </button>
                  <div className="flex items-center space-x-2">
                    <select
                      className="border rounded-md p-1"
                      value={getYear(date)}
                      onChange={({ target: { value } }) => changeYear(parseInt(value))}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <select
                      className="border rounded-md p-1"
                      value={monthsInFrench[getMonth(date)]}
                      onChange={({ target: { value } }) =>
                        changeMonth(monthsInFrench.indexOf(value))
                      }
                    >
                      {monthsInFrench.map((month, index) => (
                        <option key={index} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                    {">"}
                  </button>
                </div>
              )}
            />
            <CalendarIcon className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5 pointer-events-none" />
          </div>
        </div>

        {/* Create Exercise Button */}
        <Button onClick={handleCreateExercice}>Ajouter l&apos;exercice</Button>
      </div>
    </div>
  );
}
