// @ts-nocheck


"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { formatNumber } from "@/lib/utils";

// Define the account type
type Account = {
  ref: string;
  accountNumber: string;
  libelle: string;
  montant: number;
};

// Define the section type
type Section = {
  ref: string;
  libelle: string;
  note: string;
  accounts: Account[];
  total?: boolean; // To mark the total row
};

// Cash Flow Data (Flux de trésorerie)
const fluxTresorerie: Section[] = [
  {
    ref: "ZA",
    libelle: "Trésorerie nette au 1er Janvier",
    note: "A",
    accounts: [{ ref: "ZA", accountNumber: "500", libelle: "Trésorerie nette au 1er Janvier", montant: 0 }],
  },
  {
    ref: "FA",
    libelle: "Flux de trésorerie provenant des activités opérationnelles",
    note: "",
    accounts: [
      { ref: "FA", accountNumber: "701", libelle: "Capacité d'Autofinancement Globale (CAFG)", montant: 0 },
      { ref: "FB", accountNumber: "602", libelle: "Variation de l'actif circulant HAO", montant: 0 },
      { ref: "FC", accountNumber: "603", libelle: "Variation des stocks", montant: 0 },
      { ref: "FD", accountNumber: "604", libelle: "Variation des créances", montant: 0 },
      { ref: "FE", accountNumber: "605", libelle: "Variation du passif circulant", montant: 0 },
    ],
    total: true,
  },
  {
    ref: "ZB",
    libelle: "Flux de trésorerie provenant des activités opérationnelles (somme FA à FE)",
    note: "B",
    accounts: [],
    total: true,
  },
  {
    ref: "FF",
    libelle: "Flux de trésorerie provenant des activités d'investissement",
    note: "",
    accounts: [
      { ref: "FF", accountNumber: "701", libelle: "Désinvestissements", montant: 0 },
      { ref: "FG", accountNumber: "702", libelle: "Investissements matériels", montant: 0 },
      { ref: "FH", accountNumber: "703", libelle: "Investissements incorporels", montant: 0 },
      { ref: "FI", accountNumber: "704", libelle: "Investissements financiers", montant: 0 },
      { ref: "FJ", accountNumber: "705", libelle: "Encaissements liés aux cessions d'immobilisations", montant: 0 },
    ],
    total: true,
  },
  {
    ref: "ZC",
    libelle: "Flux de trésorerie provenant des activités d'investissement (somme FF à FJ)",
    note: "C",
    accounts: [],
    total: true,
  },
  {
    ref: "FK",
    libelle: "Flux de trésorerie provenant des activités de financement",
    note: "",
    accounts: [
      { ref: "FK", accountNumber: "706", libelle: "Augmentations de capital", montant: 0 },
      { ref: "FL", accountNumber: "707", libelle: "Subventions d'investissement", montant: 0 },
      { ref: "FM", accountNumber: "708", libelle: "Prélèvements sur le capital", montant: 0 },
      { ref: "FN", accountNumber: "709", libelle: "Dividendes versés", montant: 0 },
    ],
    total: true,
  },
  {
    ref: "ZD",
    libelle: "Flux de trésorerie provenant des activités de financement (somme FK à FN)",
    note: "D",
    accounts: [],
    total: true,
  },
  {
    ref: "ZG",
    libelle: "Variation de la trésorerie nette de la période",
    note: "G",
    accounts: [],
    total: true,
  },
  {
    ref: "ZH",
    libelle: "Trésorerie nette au 31 Décembre",
    note: "H",
    accounts: [],
    total: true,
  },
];

// Function to calculate totals
const calculerTotal = (accounts: Account[]) => {
  return accounts.reduce((total, account) => total + account.montant, 0);
};

// Function to calculate specific totals for ZB, ZC, ZD, and ZG
const calculateSpecialTotals = (ref: string, sections: Section[]) => {
  switch (ref) {
    case "ZB": // Flux de trésorerie provenant des activités opérationnelles: FA + FB + FC + FD + FE
      return sections
        .filter((section) => ["FA", "FB", "FC", "FD", "FE"].includes(section.ref))
        .reduce((sum, section) => sum + calculerTotal(section.accounts), 0);

    case "ZC": // Flux de trésorerie provenant des activités d'investissement: FF + FG + FH + FI + FJ
      return sections
        .filter((section) => ["FF", "FG", "FH", "FI", "FJ"].includes(section.ref))
        .reduce((sum, section) => sum + calculerTotal(section.accounts), 0);

    case "ZD": // Flux de trésorerie provenant des activités de financement: FK + FL + FM + FN
      return sections
        .filter((section) => ["FK", "FL", "FM", "FN"].includes(section.ref))
        .reduce((sum, section) => sum + calculerTotal(section.accounts), 0);

    case "ZG": // Variation de la trésorerie nette de la période: ZB + ZC + ZD
      const totalZB = calculateSpecialTotals("ZB", sections);
      const totalZC = calculateSpecialTotals("ZC", sections);
      const totalZD = calculateSpecialTotals("ZD", sections);
      return totalZB + totalZC + totalZD;

    default:
      return 0;
  }
};

// Main component for Flux de Trésorerie (Cash Flow)
export default function FluxTresorerie() {
  const [fluxData, setFluxData] = useState(fluxTresorerie);

  // Update totals based on calculation logic
  useEffect(() => {
    const updatedData = fluxData.map((section) => {
      if (section.total) {
        const totalMontant = calculateSpecialTotals(section.ref, fluxData);
        section.accounts = [
          {
            ref: section.ref,
            accountNumber: "",
            libelle: section.libelle,
            montant: totalMontant,
          },
        ];
      }
      return section;
    });
    setFluxData(updatedData);
  }, [fluxData]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Flux de Trésorerie</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Réf</TableHead>
            <TableHead>LIBELLÉS</TableHead>
            <TableHead>NOTE</TableHead>
            <TableHead className="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fluxData.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              {/* Render account rows first */}
              {section.accounts.map((account, accountIndex) => (
                <TableRow key={accountIndex}>
                  <TableCell>{account.ref}</TableCell>
                  <TableCell>{account.libelle}</TableCell>
                  <TableCell>{section.note || ""}</TableCell>
                  <TableCell className="text-right">{formatNumber(account.montant)}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
