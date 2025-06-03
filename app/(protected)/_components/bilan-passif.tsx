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

  // Map balance to Bilan Passif - now using global store data
  const mapBalanceToBilanPassif = () => {
    if (!balanceData || balanceData.length === 0) return;

    const updatedPassif = passifData.map((section) => {
      const updatedAccounts = section.accounts.map((account) => {
        let brut = 0;
        let amort = 0;
        let net = 0;

        // Map accounts based on SYSCOHADA account class ranges
        if (
          account.accountNumber === "101" ||
          account.accountNumber === "102" ||
          account.accountNumber === "104" ||
          account.accountNumber === "105"
        ) {
          // Capital and equity (10x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("10")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "1061" ||
          account.accountNumber === "1068"
        ) {
          // Réserves (106x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("106")
          );
          const totalReserves = matchingAccounts.reduce((sum, bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            return sum + Math.abs(solde);
          }, 0);

          // Split reserves between indisponibles (25%) and libres (75%)
          if (account.accountNumber === "1061") {
            brut = totalReserves * 0.25;
            net = totalReserves * 0.25;
          } else if (account.accountNumber === "1068") {
            brut = totalReserves * 0.75;
            net = totalReserves * 0.75;
          }
        } else if (account.accountNumber === "110") {
          // Report à nouveau (11x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("11")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (account.accountNumber === "12") {
          // Résultat de l'exercice (12x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("12")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (account.accountNumber === "131") {
          // Subventions d'investissement (13x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("13")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (account.accountNumber === "14") {
          // Provisions réglementées (14x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("14")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "15" ||
          account.accountNumber === "151"
        ) {
          // Provisions pour risques (15x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("15")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "16" ||
          account.accountNumber.startsWith("16")
        ) {
          // Emprunts et dettes financières (16x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("16")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (account.accountNumber === "17") {
          // Dettes de crédit-bail et contrats assimilés (17x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("17")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (account.accountNumber === "18") {
          // Dettes liées à des participations (18x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("18")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "40" ||
          account.accountNumber.startsWith("40")
        ) {
          // Fournisseurs et comptes rattachés (40x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("40")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "42" ||
          account.accountNumber.startsWith("42")
        ) {
          // Personnel et comptes rattachés (42x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("42")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "43" ||
          account.accountNumber.startsWith("43")
        ) {
          // Organismes sociaux (43x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("43")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "44" ||
          account.accountNumber.startsWith("44")
        ) {
          // État et collectivités publiques (44x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("44")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (account.accountNumber === "49") {
          // Provisions pour dépréciation des comptes de tiers (49x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("49")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "50" ||
          account.accountNumber.startsWith("50")
        ) {
          // Provisions pour risques à court terme (50x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("50")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "5124" ||
          account.accountNumber === "5123"
        ) {
          // Trésorerie passif (56x)
          const matchingAccounts = balanceData.filter(
            (bal) =>
              bal.accountNumber.startsWith("56") ||
              bal.accountNumber.startsWith("55") ||
              bal.accountNumber.startsWith("57")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            brut += Math.abs(solde);
            net += Math.abs(solde);
          });
        } else {
          // Exact match fallback
          const matchingAccount = balanceData.find(
            (bal) => bal.accountNumber === account.accountNumber
          );
          if (matchingAccount) {
            const solde =
              parseFloat(
                matchingAccount.solde.replace(/\s/g, "").replace(",", ".")
              ) || 0;
            brut = Math.abs(solde);
            net = Math.abs(solde);
          }
        }

        return {
          ...account,
          brut,
          amort,
          net,
        };
      });

      return { ...section, accounts: updatedAccounts };
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
