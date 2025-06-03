"use client";

import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getMonth, getYear, addYears, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CalendarDays,
  Hash,
  Plus,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const monthsInFrench = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const years = Array.from({ length: 50 }, (_, i) => i + 1990);

interface NewExerciceFormProps {
  onNewExercice: (
    name: number,
    startDate: Date,
    endDate: Date
  ) => Promise<void>;
  existingExercices?: Array<{ name: number; id: string }>;
}

export default function NewExerciceForm({
  onNewExercice,
  existingExercices = [],
}: NewExerciceFormProps) {
  const [name, setName] = React.useState<number | null>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(
    addYears(new Date(), 1)
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );

  const handleCreateExercice = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Validation
      if (name === null || !startDate || !endDate) {
        setErrorMessage("Tous les champs sont obligatoires");
        return;
      }

      if (name < 1990 || name > 2050) {
        setErrorMessage("L'année doit être comprise entre 1990 et 2050");
        return;
      }

      // Check if the name already exists
      const nameExists = existingExercices?.some(
        (exercice) => exercice.name === name
      );

      if (nameExists) {
        setErrorMessage("Un exercice avec cette année existe déjà");
        return;
      }

      if (endDate <= startDate) {
        setErrorMessage(
          "La date de fin doit être postérieure à la date de début"
        );
        return;
      }

      await onNewExercice(name, startDate, endDate);
      setSuccessMessage("Exercice créé avec succès!");

      // Reset form after successful creation
      setTimeout(() => {
        setName(null);
        setStartDate(new Date());
        setEndDate(addYears(new Date(), 1));
        setSuccessMessage(null);
      }, 2000);
    } catch (error) {
      setErrorMessage("Erreur lors de la création de l'exercice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date) {
      const newEndDate = addYears(date, 1);
      setEndDate(newEndDate);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value ? parseInt(value, 10) : null);
    setErrorMessage(null);
  };

  const getExerciseDuration = () => {
    if (startDate && endDate) {
      const diffMonths = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      return `${diffMonths} mois`;
    }
    return "";
  };

  const CustomDatePickerInput = React.forwardRef<
    HTMLInputElement,
    {
      value?: string;
      onClick?: () => void;
      placeholder?: string;
      icon: React.ReactNode;
    }
  >(({ value, onClick, placeholder, icon, ...props }, ref) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        {...props}
        ref={ref}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer hover:border-gray-400 transition-colors"
      />
    </div>
  ));

  CustomDatePickerInput.displayName = "CustomDatePickerInput";

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-lg">Nouvel Exercice Financier</CardTitle>
          </div>
          <CardDescription>
            Créez un nouvel exercice financier pour cette entreprise. Les
            exercices durent généralement 12 mois.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Exercise Name/Year */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              <Hash className="h-4 w-4 inline mr-1" />
              Année de l&apos;exercice *
            </Label>
            <Input
              id="name"
              type="number"
              min="1990"
              max="2050"
              value={name !== null ? name : ""}
              onChange={handleNameChange}
              placeholder="Ex: 2024, 2025"
              className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-600">
              Entrez l&apos;année de référence pour cet exercice
            </p>
          </div>

          <Separator />

          {/* Date Range Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                Période de l&apos;Exercice
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Date de début *
                </Label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                  customInput={
                    <CustomDatePickerInput
                      placeholder="Sélectionnez la date de début"
                      icon={<Calendar className="h-4 w-4 text-gray-400" />}
                    />
                  }
                  disabled={isLoading}
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center space-x-2">
                        <select
                          className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={getYear(date)}
                          onChange={({ target: { value } }) =>
                            changeYear(parseInt(value))
                          }
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>

                        <select
                          className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
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

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Date de fin *
                </Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                  customInput={
                    <CustomDatePickerInput
                      placeholder="Sélectionnez la date de fin"
                      icon={<Calendar className="h-4 w-4 text-gray-400" />}
                    />
                  }
                  disabled={isLoading}
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center space-x-2">
                        <select
                          className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={getYear(date)}
                          onChange={({ target: { value } }) =>
                            changeYear(parseInt(value))
                          }
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>

                        <select
                          className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
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

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Duration Info */}
            {startDate && endDate && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Durée de l&apos;exercice:{" "}
                  <strong>{getExerciseDuration()}</strong>
                </span>
                <Badge variant="secondary" className="ml-auto">
                  {startDate && format(startDate, "dd MMM", { locale: fr })} →{" "}
                  {endDate && format(endDate, "dd MMM yyyy", { locale: fr })}
                </Badge>
              </div>
            )}
          </div>

          {/* Error and Success Messages */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-800">{successMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            <Button
              onClick={handleCreateExercice}
              disabled={isLoading || !name || !startDate || !endDate}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer l&apos;Exercice
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
