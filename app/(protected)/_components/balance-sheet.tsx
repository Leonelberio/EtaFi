// @ts-nocheck


"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation"; // Import useRouter for navigation
import { parse } from 'csv-parse/sync'; // CSV parsing library

// Mapping CSV columns to internal keys
const columnMapping = {
  "Numéro de compte": "accountNumber",
  "Libellé du compte": "account",
  "Débit": "debits",
  "Crédit": "credits",
  "Solde": "solde",
};

// Format number for display
const formatNumber = (value:string) => {
  if (!value) return "";
  const number = parseFloat(value.replace(",", ".").replace(/[^0-9.]/g, ""));
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

// Convert formatted numbers to floats for calculations
const parseFormattedNumber = (value:string) => {
  if (!value) return 0;
  return parseFloat(value.replace(/\s/g, "").replace(",", "."));
};

// Grouping the balance sheet data by classes
const groupByClass = (data:any) => {
  const classes = {
    "Classe 1 : Comptes de Capitaux": [],
    "Classe 2 : Comptes d'Immobilisations": [],
    "Classe 3 : Comptes de Stocks": [],
    "Classe 4 : Comptes de Tiers": [],
    "Classe 5 : Comptes de Trésorerie": [],
    "Classe 6 : Comptes de Charges": [],
    "Classe 7 : Comptes de Produits": [],
  };

  data.forEach((row) => {
    const accountNumber = parseInt(row.accountNumber, 10);
    if (accountNumber >= 100 && accountNumber < 200) {
      classes["Classe 1 : Comptes de Capitaux"].push(row);
    } else if (accountNumber >= 200 && accountNumber < 300) {
      classes["Classe 2 : Comptes d'Immobilisations"].push(row);
    } else if (accountNumber >= 300 && accountNumber < 400) {
      classes["Classe 3 : Comptes de Stocks"].push(row);
    } else if (accountNumber >= 400 && accountNumber < 500) {
      classes["Classe 4 : Comptes de Tiers"].push(row);
    } else if (accountNumber >= 500 && accountNumber < 600) {
      classes["Classe 5 : Comptes de Trésorerie"].push(row);
    } else if (accountNumber >= 600 && accountNumber < 700) {
      classes["Classe 6 : Comptes de Charges"].push(row);
    } else if (accountNumber >= 700 && accountNumber < 800) {
      classes["Classe 7 : Comptes de Produits"].push(row);
    }
  });

  return classes;
};

// Main Balance Sheet Table component
export function BalanceSheetTable({ data = [], setData }) {
  const { exerciceId, companyId } = useParams(); // Fetch params from the router
  const router = useRouter(); // useRouter hook for navigation

  // Load balance from localStorage if available
  useEffect(() => {
    const storedBalance = localStorage.getItem(`balance_${exerciceId}`);
    if (storedBalance) {
      setData(JSON.parse(storedBalance));
    }
  }, [exerciceId, setData]);

  // Handle CSV upload, parse it and set it to state
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const csvData = e.target.result;
      const parsedData = parseCsv(csvData); // Parse the CSV data
      setData(parsedData); // Set parsed data into the state

      // Save to localStorage
    };

    reader.readAsText(file);
  };

  // Parse the CSV and map the columns
  const parseCsv = (csvData) => {
    try {
      // Parse CSV data with column mapping
      const records = parse(csvData, {
        columns: (header) => header.map((col) => columnMapping[col.trim()]), // Map columns
        skip_empty_lines: true,
        trim: true, // Trim whitespace around fields
      });

      // Format and return the parsed records
      return records.map((row) => ({
        accountNumber: row.accountNumber?.trim(),
        account: row.account?.trim(),
        debits: formatNumber(row.debits?.trim() || ""),
        credits: formatNumber(row.credits?.trim() || ""),
        solde: formatNumber(row.solde?.trim() || ""),
      }));
    } catch (error) {
      console.error("Error parsing CSV:", error);
      alert("Error parsing CSV file. Please check the file format.");
      return [];
    }
  };

  // Function to save or update the balance sheet data in the server
  const handleSaveBalance = async () => {
    try {
      const formData = new FormData();
      formData.append("balanceData", JSON.stringify(data)); // Convert data to JSON string

      const response = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}/balance`, {
        method: "POST",
        body: formData,
      });


      if (!response.ok) {
        throw new Error("Failed to save balance");
      }

      localStorage.removeItem(`balance_${exerciceId}`);

      localStorage.setItem(`balance_${exerciceId}`, JSON.stringify(data));

      alert("Balance saved successfully!");
    } catch (error) {
      console.error("Error saving balance:", error);
      alert("Error saving balance");
    }
  };

  // Function to handle the "Générer" button click
  const handleGenerate = () => {
    router.push(`/dashboard/companies/${companyId}/exercice/${exerciceId}/etats-fin`);
  };

  // Group data by classes
  const groupedData = groupByClass(data);

  // Calculate totals for debits and credits
  const totals = {
    debits: data.reduce((sum, row) => sum + parseFormattedNumber(row.debits), 0),
    credits: data.reduce((sum, row) => sum + parseFormattedNumber(row.credits), 0),
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        <Input type="file" accept=".csv" onChange={handleCsvUpload} />
        <Button onClick={handleSaveBalance}>Sauvegarder</Button>
        <Button onClick={handleGenerate}>Générer</Button> {/* Added the "Générer" button */}
      </div>

      <Table className="mt-6">
        <TableCaption>Exemple de Balance Comptable au 31 décembre N</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>N° de Compte</TableHead>
            <TableHead>Libellé du Compte</TableHead>
            <TableHead className="text-right">Débit (D)</TableHead>
            <TableHead className="text-right">Crédit (C)</TableHead>
            <TableHead className="text-right">Solde</TableHead>
          </TableRow>
        </TableHeader>

        {/* Group data by classes and render */}
        {Object.keys(groupedData).map((className) => (
          groupedData[className].length > 0 && ( // Only render non-empty classes
            <>
              <TableHeader key={className}>
                <TableRow>
                  <TableHead colSpan={5} className="bg-gray-100">{className}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {groupedData[className].map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.accountNumber}</TableCell>
                    <TableCell>{row.account}</TableCell>
                    <TableCell className="text-right">{row.debits}</TableCell>
                    <TableCell className="text-right">{row.credits}</TableCell>
                    <TableCell className="text-right">{row.solde}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )
        ))}

        <TableFooter>
          <TableRow>
            <TableCell className="font-bold" colSpan={2}>
              Totaux
            </TableCell>
            <TableCell className="text-right font-bold">{formatNumber(totals.debits.toString())}</TableCell>
            <TableCell className="text-right font-bold">{formatNumber(totals.credits.toString())}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
