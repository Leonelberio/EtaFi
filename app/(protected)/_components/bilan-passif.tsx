/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import { formatNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import {
  useBalanceData,
  useBalanceLastUpdated,
} from "@/lib/stores/balance-store";

// Define the account type
type Account = {
  ref: string;
  accountNumber: string;
  libelle: string;
  brut: number;
  amort: number;
  net: number;
  note?: string;
};

// Define the section type for Bilan Passif
type Section = {
  section: string;
  notesAnnexes: string;
  accounts: Account[];
  ref: string;
};

// Data structure for the Bilan Passif rows
const bilanPassif: Section[] = [
  {
    section: "CAPITAUX PROPRES",
    notesAnnexes: "3",
    ref: "CP",
    accounts: [
      {
        ref: "CA",
        accountNumber: "101",
        libelle: "Capital",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CB",
        accountNumber: "102",
        libelle: "Apporteurs capital non appelé (-)",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CD",
        accountNumber: "104",
        libelle: "Primes liées au capital social",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CE",
        accountNumber: "105",
        libelle: "Écarts de réévaluation",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CF",
        accountNumber: "1061",
        libelle: "Réserves indisponibles",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CG",
        accountNumber: "1068",
        libelle: "Réserves libres",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CH",
        accountNumber: "110",
        libelle: "Report à nouveau",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CJ",
        accountNumber: "12",
        libelle: "Résultat net de l'exercice",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CL",
        accountNumber: "131",
        libelle: "Subventions d'investissement",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "CM",
        accountNumber: "14",
        libelle: "Provisions réglementées",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "DETTES FINANCIÈRES ET PROVISIONS",
    notesAnnexes: "5",
    ref: "DD",
    accounts: [
      {
        ref: "DA",
        accountNumber: "16",
        libelle: "Emprunts et dettes financières diverses",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "DB",
        accountNumber: "17",
        libelle: "Dettes de location acquisition",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "DC",
        accountNumber: "151",
        libelle: "Provisions pour risques et charges",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "PASSIF CIRCULANT",
    notesAnnexes: "7",
    ref: "DP",
    accounts: [
      {
        ref: "DH",
        accountNumber: "42",
        libelle: "Dettes circulantes HAO",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "DI",
        accountNumber: "419",
        libelle: "Clients, avances reçues",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "DJ",
        accountNumber: "401",
        libelle: "Fournisseurs d'exploitation",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "DK",
        accountNumber: "44",
        libelle: "Dettes fiscales et sociales",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "DM",
        accountNumber: "46",
        libelle: "Autres dettes",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "DN",
        accountNumber: "1515",
        libelle: "Provisions pour risques à court terme",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "TRÉSORERIE PASSIF",
    notesAnnexes: "9",
    ref: "DT",
    accounts: [
      {
        ref: "DQ",
        accountNumber: "5124",
        libelle: "Banques, crédits d'escompte",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "DR",
        accountNumber: "5123",
        libelle: "Banques, établissements financiers et crédits de trésorerie",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
];

// Function to calculate totals for each section
const calculerTotal = (accounts: Account[]) => {
  return accounts.reduce(
    (total, account) => ({
      brut: total.brut + account.brut,
      amort: total.amort + account.amort,
      net: total.net + account.net,
    }),
    { brut: 0, amort: 0, net: 0 }
  );
};

// Function to calculate the total for each major section and update directly in `passifData`
const updateSectionTotals = (sections: Section[]) => {
  const updatedSections = sections.map((section) => {
    // Don't add totals to individual account sections, only calculate them
    return section;
  });

  return updatedSections;
};

// Calculate totals for major groups
const calculateMajorTotals = (sections: Section[]) => {
  const capitauxPropres = sections.find((s) => s.ref === "CP");
  const dettesFinancieres = sections.find((s) => s.ref === "DD");
  const passifCirculant = sections.find((s) => s.ref === "DP");
  const tresoreriePassif = sections.find((s) => s.ref === "DT");

  const totals = {
    capitauxPropres: capitauxPropres
      ? calculerTotal(capitauxPropres.accounts)
      : { brut: 0, amort: 0, net: 0 },
    dettesFinancieres: dettesFinancieres
      ? calculerTotal(dettesFinancieres.accounts)
      : { brut: 0, amort: 0, net: 0 },
    passifCirculant: passifCirculant
      ? calculerTotal(passifCirculant.accounts)
      : { brut: 0, amort: 0, net: 0 },
    tresoreriePassif: tresoreriePassif
      ? calculerTotal(tresoreriePassif.accounts)
      : { brut: 0, amort: 0, net: 0 },
  };

  const totalGeneral = {
    brut:
      totals.capitauxPropres.brut +
      totals.dettesFinancieres.brut +
      totals.passifCirculant.brut +
      totals.tresoreriePassif.brut,
    amort:
      totals.capitauxPropres.amort +
      totals.dettesFinancieres.amort +
      totals.passifCirculant.amort +
      totals.tresoreriePassif.amort,
    net:
      totals.capitauxPropres.net +
      totals.dettesFinancieres.net +
      totals.passifCirculant.net +
      totals.tresoreriePassif.net,
  };

  return { ...totals, totalGeneral };
};

// Main Bilan Passif component
export default function BilanPassif() {
  const [passifData, setPassifData] = useState<Section[]>(bilanPassif);

  // Use global balance store instead of local state
  const balanceData = useBalanceData();
  const lastUpdated = useBalanceLastUpdated();

  const { exerciceId, companyId } = useParams() as {
    exerciceId: string;
    companyId: string;
  };

  // Map balance to Bilan Passif - using correct aggregation at section level
  const mapBalanceToBilanPassif = () => {
    if (!balanceData || balanceData.length === 0) return;

    // Helper function to get total for account class prefixes - same as balance store
    const getAccountClassTotal = (prefixes: string[]): number => {
      return balanceData
        .filter((acc) =>
          prefixes.some((prefix) => acc.accountNumber.startsWith(prefix))
        )
        .reduce((total, acc) => {
          const solde = parseFloat(acc.solde.replace(/[^0-9.-]/g, "")) || 0;
          return total + Math.abs(solde);
        }, 0);
    };

    const updatedPassif = passifData.map((section) => {
      if (section.ref === "CP") {
        // CAPITAUX PROPRES - show as section total
        const total = getAccountClassTotal(["10", "11", "12", "13"]);
        section.accounts = [
          {
            ref: "CP",
            accountNumber: "10-13",
            libelle: "Capitaux propres",
            brut: Math.round(total),
            amort: 0,
            net: Math.round(total),
          },
        ];
      } else if (section.ref === "DD") {
        // DETTES FINANCIÈRES ET PROVISIONS - show as section total
        const dettes = getAccountClassTotal(["16", "17"]);
        const provisions = getAccountClassTotal(["15"]);
        const total = dettes + provisions;
        section.accounts = [
          {
            ref: "DD",
            accountNumber: "15-17",
            libelle: "Dettes financières et provisions",
            brut: Math.round(total),
            amort: 0,
            net: Math.round(total),
          },
        ];
      } else if (section.ref === "DP") {
        // PASSIF CIRCULANT - show as section total
        const total = getAccountClassTotal([
          "40",
          "42",
          "43",
          "44",
          "46",
          "47",
          "49",
        ]);
        section.accounts = [
          {
            ref: "DP",
            accountNumber: "40-49",
            libelle: "Passif circulant",
            brut: Math.round(total),
            amort: 0,
            net: Math.round(total),
          },
        ];
      } else if (section.ref === "DT") {
        // TRÉSORERIE PASSIF - show as section total
        const total = getAccountClassTotal(["55", "56", "57"]);
        section.accounts = [
          {
            ref: "DT",
            accountNumber: "55-57",
            libelle: "Trésorerie passif",
            brut: Math.round(total),
            amort: 0,
            net: Math.round(total),
          },
        ];
      }

      return section;
    });

    // Update section totals
    const passifWithTotals = updateSectionTotals(updatedPassif);
    setPassifData(passifWithTotals);
  };

  // Auto-update when balance data changes in the global store
  useEffect(() => {
    if (balanceData.length > 0) {
      mapBalanceToBilanPassif();
    }
  }, [balanceData, lastUpdated]);

  // Calculate totals for display
  const majorTotals = calculateMajorTotals(passifData);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bilan Passif</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Réf</TableHead>
            <TableHead>PASSIF</TableHead>
            <TableHead>NOTE</TableHead>
            <TableHead className="text-right">BRUT</TableHead>
            <TableHead className="text-right">AMORT ET DÉPRÉC.</TableHead>
            <TableHead className="text-right">NET</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passifData?.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              <TableRow>
                <TableCell className="bg-gray-200 font-bold">
                  {section.ref}
                </TableCell>
                <TableCell className="bg-gray-200 font-bold">
                  {section.section}
                </TableCell>
                <TableCell className="bg-gray-200 font-bold">
                  {section.notesAnnexes}
                </TableCell>
                <TableCell className="text-right bg-gray-200 font-bold">
                  {formatNumber(calculerTotal(section.accounts).brut)}
                </TableCell>
                <TableCell className="text-right bg-gray-200 font-bold">
                  {formatNumber(calculerTotal(section.accounts).amort)}
                </TableCell>
                <TableCell className="text-right bg-gray-200 font-bold">
                  {formatNumber(calculerTotal(section.accounts).net)}
                </TableCell>
              </TableRow>

              {section.accounts.map((account, accountIndex) => (
                <TableRow key={accountIndex}>
                  <TableCell>{account.ref}</TableCell>
                  <TableCell>{account.libelle}</TableCell>
                  <TableCell>{account.note || ""}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(account.brut)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(account.amort)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(account.net)}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}

          {/* DZ Total General */}
          <TableRow className="bg-gray-200 font-bold">
            <TableCell>DZ</TableCell>
            <TableCell>TOTAL GENERAL</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">
              {formatNumber(majorTotals.totalGeneral.brut)}
            </TableCell>
            <TableCell className="text-right">
              {formatNumber(majorTotals.totalGeneral.amort)}
            </TableCell>
            <TableCell className="text-right">
              {formatNumber(majorTotals.totalGeneral.net)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
