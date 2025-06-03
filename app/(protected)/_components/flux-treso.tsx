/* eslint-disable react-hooks/exhaustive-deps */
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import {
  useBalanceData,
  useBalanceLastUpdated,
} from "@/lib/stores/balance-store";

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

interface BalanceData {
  accountNumber: string;
  account: string;
  debits: string;
  credits: string;
  solde: string;
}

// Cash Flow Data structure following SYSCOHADA
const fluxTresorerie: Section[] = [
  {
    ref: "ZA",
    libelle: "FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS OPÉRATIONNELLES",
    note: "",
    accounts: [
      {
        ref: "FA",
        accountNumber: "120", // Résultat net de l'exercice
        libelle: "Résultat net de l'exercice",
        montant: 0,
      },
      {
        ref: "FB",
        accountNumber: "681", // Dotations aux amortissements
        libelle: "Dotations aux amortissements et provisions",
        montant: 0,
      },
      {
        ref: "FC",
        accountNumber: "775", // Produits de cessions d'immobilisations
        libelle: "Plus-values de cession d'immobilisations (-)",
        montant: 0,
      },
      {
        ref: "FD",
        accountNumber: "31", // Variation des stocks
        libelle: "Variation des stocks",
        montant: 0,
      },
      {
        ref: "FE",
        accountNumber: "411", // Variation des créances clients
        libelle: "Variation des créances clients et autres créances",
        montant: 0,
      },
      {
        ref: "FF",
        accountNumber: "401", // Variation des dettes fournisseurs
        libelle: "Variation des dettes fournisseurs et autres dettes",
        montant: 0,
      },
    ],
  },
  {
    ref: "ZB",
    libelle: "FLUX NET DE TRÉSORERIE LIÉ AUX ACTIVITÉS OPÉRATIONNELLES",
    note: "A",
    accounts: [],
    total: true,
  },
  {
    ref: "ZC",
    libelle: "FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS D'INVESTISSEMENT",
    note: "",
    accounts: [
      {
        ref: "FG",
        accountNumber: "21", // Acquisitions d'immobilisations incorporelles
        libelle: "Acquisitions d'immobilisations incorporelles",
        montant: 0,
      },
      {
        ref: "FH",
        accountNumber: "22", // Acquisitions d'immobilisations corporelles
        libelle: "Acquisitions d'immobilisations corporelles",
        montant: 0,
      },
      {
        ref: "FI",
        accountNumber: "26", // Acquisitions d'immobilisations financières
        libelle: "Acquisitions d'immobilisations financières",
        montant: 0,
      },
      {
        ref: "FJ",
        accountNumber: "775", // Cessions d'immobilisations
        libelle: "Cessions d'immobilisations",
        montant: 0,
      },
    ],
  },
  {
    ref: "ZD",
    libelle: "FLUX NET DE TRÉSORERIE LIÉ AUX ACTIVITÉS D'INVESTISSEMENT",
    note: "B",
    accounts: [],
    total: true,
  },
  {
    ref: "ZE",
    libelle: "FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS DE FINANCEMENT",
    note: "",
    accounts: [
      {
        ref: "FK",
        accountNumber: "101", // Augmentations de capital
        libelle: "Augmentations de capital",
        montant: 0,
      },
      {
        ref: "FL",
        accountNumber: "16", // Emprunts
        libelle: "Nouveaux emprunts",
        montant: 0,
      },
      {
        ref: "FM",
        accountNumber: "16", // Remboursements d'emprunts
        libelle: "Remboursements d'emprunts",
        montant: 0,
      },
      {
        ref: "FN",
        accountNumber: "457", // Dividendes versés
        libelle: "Dividendes versés aux actionnaires",
        montant: 0,
      },
    ],
  },
  {
    ref: "ZF",
    libelle: "FLUX NET DE TRÉSORERIE LIÉ AUX ACTIVITÉS DE FINANCEMENT",
    note: "C",
    accounts: [],
    total: true,
  },
  {
    ref: "ZG",
    libelle: "VARIATION NETTE DE LA TRÉSORERIE",
    note: "D = A + B + C",
    accounts: [],
    total: true,
  },
  {
    ref: "ZH",
    libelle: "TRÉSORERIE À L'OUVERTURE",
    note: "",
    accounts: [
      {
        ref: "ZH",
        accountNumber: "5", // Trésorerie
        libelle: "Trésorerie à l&apos;ouverture de l&apos;exercice",
        montant: 0,
      },
    ],
  },
  {
    ref: "ZI",
    libelle: "TRÉSORERIE À LA CLÔTURE",
    note: "E = D + Ouverture",
    accounts: [],
    total: true,
  },
];

// Function to calculate totals
const calculerTotal = (accounts: Account[]) => {
  return accounts.reduce((total, account) => total + account.montant, 0);
};

// Function to calculate specific totals for cash flow sections
const calculateSpecialTotals = (ref: string, sections: Section[]): number => {
  switch (ref) {
    case "ZB": // Flux net de trésorerie lié aux activités opérationnelles
      const operationalSection = sections.find((s) => s.ref === "ZA");
      return operationalSection
        ? calculerTotal(operationalSection.accounts)
        : 0;

    case "ZD": // Flux net de trésorerie lié aux activités d'investissement
      const investmentSection = sections.find((s) => s.ref === "ZC");
      return investmentSection ? -calculerTotal(investmentSection.accounts) : 0; // Negative because investments are outflows

    case "ZF": // Flux net de trésorerie lié aux activités de financement
      const financingSection = sections.find((s) => s.ref === "ZE");
      return financingSection ? calculerTotal(financingSection.accounts) : 0;

    case "ZG": // Variation nette de la trésorerie
      const totalZB: number = calculateSpecialTotals("ZB", sections);
      const totalZD: number = calculateSpecialTotals("ZD", sections);
      const totalZF: number = calculateSpecialTotals("ZF", sections);
      return totalZB + totalZD + totalZF;

    case "ZI": // Trésorerie à la clôture
      const totalZG: number = calculateSpecialTotals("ZG", sections);
      const tresorerieOuverture = sections.find((s) => s.ref === "ZH");
      const ouverture = tresorerieOuverture
        ? calculerTotal(tresorerieOuverture.accounts)
        : 0;
      return ouverture + totalZG;

    default:
      return 0;
  }
};

// Main component for Flux de Trésorerie (Cash Flow)
export default function FluxTresorerie() {
  const [fluxData, setFluxData] = useState<Section[]>(fluxTresorerie);

  // Use global balance store instead of local state
  const balanceData = useBalanceData();
  const lastUpdated = useBalanceLastUpdated();

  const { exerciceId, companyId } = useParams() as {
    exerciceId: string;
    companyId: string;
  };

  // Map balance to Cash Flow Statement - now using global store data
  const mapBalanceToFluxTresorerie = () => {
    const updatedFlux = fluxData.map((section) => {
      const updatedAccounts = section.accounts.map((account) => {
        // Find matching accounts by account number prefix
        const matchingAccounts = balanceData.filter((bal) =>
          bal.accountNumber.startsWith(account.accountNumber)
        );

        if (matchingAccounts.length > 0) {
          // Calculate total for all matching accounts
          const totalMontant = matchingAccounts.reduce((sum, bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            return sum + Math.abs(solde);
          }, 0);

          return {
            ...account,
            montant: totalMontant,
          };
        }
        return account;
      });

      return { ...section, accounts: updatedAccounts };
    });

    setFluxData(updatedFlux);
  };

  // Auto-update when balance data changes in the global store
  useEffect(() => {
    if (balanceData.length > 0) {
      mapBalanceToFluxTresorerie();
    }
  }, [balanceData, lastUpdated]);

  // Calculate total cash flow metrics
  const cashFlowMetrics = {
    operational: calculateSpecialTotals("ZB", fluxData),
    investment: calculateSpecialTotals("ZD", fluxData),
    financing: calculateSpecialTotals("ZF", fluxData),
    netChange: calculateSpecialTotals("ZG", fluxData),
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dashboard-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-metric-label">Flux Opérationnels</p>
              <p
                className={`dashboard-metric-value text-xl ${
                  cashFlowMetrics.operational >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatNumber(cashFlowMetrics.operational.toString())}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="dashboard-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-metric-label">
                Flux d&apos;Investissement
              </p>
              <p
                className={`dashboard-metric-value text-xl ${
                  cashFlowMetrics.investment >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatNumber(cashFlowMetrics.investment.toString())}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="dashboard-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-metric-label">Variation Nette</p>
              <p
                className={`dashboard-metric-value text-xl ${
                  cashFlowMetrics.netChange >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatNumber(cashFlowMetrics.netChange.toString())}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Cash Flow Table */}
      <Card className="etafi-card">
        <CardHeader className="syscohada-header rounded-t-2xl">
          <div className="text-center">
            <CardTitle className="syscohada-title">
              TABLEAU DES FLUX DE TRÉSORERIE - SYSCOHADA
            </CardTitle>
            <CardDescription className="syscohada-subtitle">
              Au 31 décembre 2023 (en francs CFA)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="etafi-table">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 font-semibold text-gray-900 text-center">
                    REF
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    LIBELLÉS
                  </TableHead>
                  <TableHead className="w-16 font-semibold text-gray-900 text-center">
                    NOTE
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 min-w-32">
                    MONTANT
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fluxData.map((section, sectionIndex) => (
                  <React.Fragment key={sectionIndex}>
                    {/* Section header if not a total section */}
                    {!section.total && section.accounts.length > 0 && (
                      <TableRow className="financial-table-section">
                        <TableCell className="text-center font-bold text-gray-700">
                          {section.ref}
                        </TableCell>
                        <TableCell className="font-bold uppercase text-gray-700">
                          {section.libelle}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-600">
                          {section.note}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}

                    {/* Account rows */}
                    {section.accounts.map((account, accountIndex) => (
                      <TableRow
                        key={`${sectionIndex}-${accountIndex}`}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <TableCell className="text-center font-medium text-gray-700">
                          {account.ref}
                        </TableCell>
                        <TableCell className="text-gray-900 font-medium">
                          {account.libelle}
                        </TableCell>
                        <TableCell className="text-center text-gray-600">
                          {section.note}
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900">
                          {formatNumber(account.montant.toString())}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Total rows */}
                    {section.total && (
                      <TableRow
                        className={`financial-table-total ${
                          section.ref === "ZI"
                            ? "bg-gradient-to-r from-gray-100 to-gray-200 border-t-2 border-gray-300"
                            : "bg-gray-50 border-t border-gray-200"
                        }`}
                      >
                        <TableCell className="text-center font-bold text-gray-900">
                          {section.ref}
                        </TableCell>
                        <TableCell className="font-bold text-gray-900">
                          {section.libelle}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-600">
                          {section.note}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold text-gray-900 ${
                            section.ref === "ZI" ? "text-lg" : ""
                          }`}
                        >
                          {formatNumber(
                            calculateSpecialTotals(
                              section.ref,
                              fluxData
                            ).toString()
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
