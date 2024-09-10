// @ts-nocheck


"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Fetch and display the plan comptable
export default function PlanComptablePage() {
  const [planComptable, setPlanComptable] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [filterClass, setFilterClass] = useState("all"); // For class filter

  // Fetch plan comptable from localStorage or server
  useEffect(() => {
    const savedPlan = localStorage.getItem("planComptable");
    if (savedPlan) {
      setPlanComptable(JSON.parse(savedPlan));
    } else {
      fetchPlanComptable();
    }
  }, []);

  // Function to fetch plan comptable from the server
  const fetchPlanComptable = async () => {
    try {
      const response = await fetch("/api/plan-comptable/all");
      if (response.ok) {
        const data = await response.json();
        setPlanComptable(data);
        localStorage.setItem("planComptable", JSON.stringify(data)); // Store in localStorage
      } else {
        alert("Erreur lors de la récupération du plan comptable.");
      }
    } catch (error) {
      console.error("Error fetching plan comptable:", error);
    }
  };

  // Filter the data based on the search term and selected class
  const filteredPlanComptable = planComptable.filter((account) => {
    const matchesSearch =
      account.numero_compte.includes(searchTerm) ||
      account.libelle_compte.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass === "all" ? true : account.numero_compte.startsWith(filterClass);

    return matchesSearch && matchesClass;
  });

  return (
    <div>
      <h1>Plan Comptable</h1>

      {/* Search Bar */}
      <Input
        placeholder="Rechercher un compte ou un numéro"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="my-4"
      />

      {/* Filter by Class */}
      <Select onValueChange={(value) => setFilterClass(value)} className="mb-4">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrer par classe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les classes</SelectItem> {/* Value updated to 'all' */}
          <SelectItem value="1">1 - Capitaux propres</SelectItem>
          <SelectItem value="2">2 - Immobilisations</SelectItem>
          <SelectItem value="3">3 - Stocks</SelectItem>
          <SelectItem value="4">4 - Tiers</SelectItem>
          <SelectItem value="5">5 - Trésorerie</SelectItem>
          <SelectItem value="6">6 - Charges</SelectItem>
          <SelectItem value="7">7 - Produits</SelectItem>
          <SelectItem value="8">8 - Engagements Hors Bilan</SelectItem>
          <SelectItem value="9">9 - Résultat Analytique</SelectItem>
        </SelectContent>
      </Select>

      {/* Plan Comptable Table */}
      <Table>
        <TableCaption>Liste du plan comptable.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Numéro de compte</TableHead>
            <TableHead>Libellé du compte</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPlanComptable.length > 0 ? (
            filteredPlanComptable.map((account) => (
              <TableRow key={account.numero_compte}>
                <TableCell>{account.numero_compte}</TableCell>
                <TableCell>{account.libelle_compte}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                Aucun compte trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total: {filteredPlanComptable.length} comptes</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
