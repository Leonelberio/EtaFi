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
import { Building2, Calendar, FileText } from "lucide-react";
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

// Define the section type for Bilan Actif
type Section = {
  section: string;
  notesAnnexes: string;
  accounts: Account[];
  ref: string;
};

interface BalanceData {
  accountNumber: string;
  account: string;
  debits: string;
  credits: string;
  solde: string;
}

// Data structure for the Bilan Actif rows
const bilanActif: Section[] = [
  {
    section: "IMMOBILISATIONS INCORPORELLES",
    notesAnnexes: "3",
    ref: "AD",
    accounts: [
      {
        ref: "AE",
        accountNumber: "211",
        libelle: "Frais de développement et de prospection",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "AF",
        accountNumber: "212",
        libelle: "Brevets, licences, logiciels et droits similaires",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "AG",
        accountNumber: "213",
        libelle: "Fonds commercial et droit au bail",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "AH",
        accountNumber: "214",
        libelle: "Autres immobilisations incorporelles",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "IMMOBILISATIONS CORPORELLES",
    notesAnnexes: "3",
    ref: "AI",
    accounts: [
      {
        ref: "AJ",
        accountNumber: "22",
        libelle: "Terrains",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "AK",
        accountNumber: "23",
        libelle: "Bâtiments",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "AL",
        accountNumber: "24",
        libelle: "Aménagements, agencements et installations",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "AN",
        accountNumber: "218",
        libelle: "Matériel de transport",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS",
    notesAnnexes: "3",
    ref: "AP",
    accounts: [
      {
        ref: "AP",
        accountNumber: "238",
        libelle: "Avances et acomptes versés sur immobilisations",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "IMMOBILISATIONS FINANCIÈRES",
    notesAnnexes: "4",
    ref: "AQ",
    accounts: [
      {
        ref: "AR",
        accountNumber: "231",
        libelle: "Titres de participation",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "AS",
        accountNumber: "27",
        libelle: "Autres immobilisations financières",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "TOTAL ACTIF IMMOBILISÉ",
    notesAnnexes: "",
    ref: "AZ",
    accounts: [],
  },
  {
    section: "STOCKS ET EN-COURS",
    notesAnnexes: "6",
    ref: "BB",
    accounts: [
      {
        ref: "BB",
        accountNumber: "31",
        libelle: "Stocks de matières premières",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "BB",
        accountNumber: "32",
        libelle: "En-cours de production de biens",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "CRÉANCES ET EMPLOIS ASSIMILÉS",
    notesAnnexes: "7",
    ref: "BG",
    accounts: [
      {
        ref: "BH",
        accountNumber: "411",
        libelle: "Clients",
        brut: 0,
        amort: 0,
        net: 0,
      },
      {
        ref: "BI",
        accountNumber: "416",
        libelle: "Autres créances",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "TOTAL ACTIF CIRCULANT",
    notesAnnexes: "",
    ref: "BK",
    accounts: [],
  },
  {
    section: "TRÉSORERIE ACTIF",
    notesAnnexes: "11",
    ref: "BT",
    accounts: [
      {
        ref: "BS",
        accountNumber: "512",
        libelle: "Banques, chèques postaux, caisse et assimilés",
        brut: 0,
        amort: 0,
        net: 0,
      },
    ],
  },
  {
    section: "ÉCART DE CONVERSION ACTIF",
    notesAnnexes: "12",
    ref: "BU",
    accounts: [
      {
        ref: "BU",
        accountNumber: "47",
        libelle: "Écarts de conversion - Actif",
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

// Function to calculate the total for each major section (AZ, BK, BZ) and update directly in `actifData`
const updateSectionTotals = (sections: Section[]) => {
  const updatedSections = sections.map((section) => {
    if (section.ref === "AZ") {
      // Total Actif Immobilisé
      const relevantSections = sections.filter((s) =>
        ["AD", "AI", "AP", "AQ"].includes(s.ref)
      );
      const total = relevantSections.reduce(
        (acc, s) => {
          const sectionTotal = calculerTotal(s.accounts);
          acc.brut += sectionTotal.brut;
          acc.amort += sectionTotal.amort;
          acc.net += sectionTotal.net;
          return acc;
        },
        { brut: 0, amort: 0, net: 0 }
      );
      section.accounts = [
        {
          ref: "AZ",
          accountNumber: "",
          libelle: "Total Actif Immobilisé",
          brut: total.brut,
          amort: total.amort,
          net: total.net,
        },
      ];
    }

    if (section.ref === "BK") {
      // Total Actif Circulant
      const relevantSections = sections.filter((s) =>
        ["BB", "BG"].includes(s.ref)
      );
      const total = relevantSections.reduce(
        (acc, s) => {
          const sectionTotal = calculerTotal(s.accounts);
          acc.brut += sectionTotal.brut;
          acc.amort += sectionTotal.amort;
          acc.net += sectionTotal.net;
          return acc;
        },
        { brut: 0, amort: 0, net: 0 }
      );
      section.accounts = [
        {
          ref: "BK",
          accountNumber: "",
          libelle: "Total Actif Circulant",
          brut: total.brut,
          amort: total.amort,
          net: total.net,
        },
      ];
    }

    return section;
  });

  return updatedSections;
};

// Function to calculate Total General
const calculateTotalGeneral = (sections: Section[]) => {
  const relevantSections = sections.filter((s) =>
    ["AZ", "BK", "BT", "BU"].includes(s.ref)
  );
  const total = relevantSections.reduce(
    (acc, section) => {
      const sectionTotal = calculerTotal(section.accounts);
      acc.brut += sectionTotal.brut;
      acc.amort += sectionTotal.amort;
      acc.net += sectionTotal.net;
      return acc;
    },
    { brut: 0, amort: 0, net: 0 }
  );
  return total;
};

// Main Bilan Actif component
export default function BilanActif() {
  const [bilanData, setBilanData] = useState<Section[]>(bilanActif);

  // Use global balance store instead of local state
  const balanceData = useBalanceData();
  const lastUpdated = useBalanceLastUpdated();

  const { exerciceId, companyId } = useParams() as {
    exerciceId: string;
    companyId: string;
  };

  // Map balance to Bilan Actif - using correct aggregation at section level
  const mapBalanceToBilanActif = () => {
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

    const updatedBilan = bilanData.map((section) => {
      if (section.ref === "AD") {
        // IMMOBILISATIONS INCORPORELLES - show as section total
        const total = getAccountClassTotal(["21"]);
        const amort = getAccountClassTotal(["281"]);
        section.accounts = [
          {
            ref: "AD",
            accountNumber: "21",
            libelle: "Immobilisations incorporelles",
            brut: Math.round(total),
            amort: Math.round(amort),
            net: Math.round(total - amort),
          },
        ];
      } else if (section.ref === "AI") {
        // IMMOBILISATIONS CORPORELLES - show as section total
        const total = getAccountClassTotal(["22", "23", "24", "245"]);
        const amort = getAccountClassTotal(["282", "283", "284"]);
        section.accounts = [
          {
            ref: "AI",
            accountNumber: "22-24",
            libelle: "Immobilisations corporelles",
            brut: Math.round(total),
            amort: Math.round(amort),
            net: Math.round(total - amort),
          },
        ];
      } else if (section.ref === "AQ") {
        // IMMOBILISATIONS FINANCIÈRES - show as section total
        const total = getAccountClassTotal(["26", "27"]);
        section.accounts = [
          {
            ref: "AQ",
            accountNumber: "26-27",
            libelle: "Immobilisations financières",
            brut: Math.round(total),
            amort: 0,
            net: Math.round(total),
          },
        ];
      } else if (section.ref === "BB") {
        // STOCKS ET EN-COURS - show as section total
        const total = getAccountClassTotal(["3"]);
        const amort = getAccountClassTotal(["39"]);
        section.accounts = [
          {
            ref: "BB",
            accountNumber: "3",
            libelle: "Stocks et en-cours",
            brut: Math.round(total),
            amort: Math.round(amort),
            net: Math.round(total - amort),
          },
        ];
      } else if (section.ref === "BG") {
        // CRÉANCES ET EMPLOIS ASSIMILÉS - show as section total
        const total = getAccountClassTotal([
          "41",
          "42",
          "43",
          "44",
          "45",
          "46",
          "47",
          "48",
        ]);
        const provisions = getAccountClassTotal(["491"]);
        section.accounts = [
          {
            ref: "BG",
            accountNumber: "41-48",
            libelle: "Créances et emplois assimilés",
            brut: Math.round(total),
            amort: Math.round(provisions),
            net: Math.round(total - provisions),
          },
        ];
      } else if (section.ref === "BT") {
        // TRÉSORERIE ACTIF - show as section total
        const total = getAccountClassTotal(["51", "52", "53", "58"]);
        section.accounts = [
          {
            ref: "BT",
            accountNumber: "51-53",
            libelle: "Trésorerie actif",
            brut: Math.round(total),
            amort: 0,
            net: Math.round(total),
          },
        ];
      } else if (section.ref === "BU") {
        // ÉCART DE CONVERSION ACTIF - show as section total
        const total = getAccountClassTotal(["47"]);
        section.accounts = [
          {
            ref: "BU",
            accountNumber: "47",
            libelle: "Écart de conversion actif",
            brut: Math.round(total),
            amort: 0,
            net: Math.round(total),
          },
        ];
      }

      return section;
    });

    // Update section totals
    const bilanWithTotals = updateSectionTotals(updatedBilan);
    setBilanData(bilanWithTotals);
  };

  // Auto-update when balance data changes in the global store
  useEffect(() => {
    if (balanceData.length > 0) {
      mapBalanceToBilanActif();
    }
  }, [balanceData, lastUpdated]);

  const totalGeneral = calculateTotalGeneral(bilanData);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="etafi-card">
        <CardHeader className="syscohada-header rounded-t-2xl">
          <div className="text-center">
            <CardTitle className="syscohada-title">
              BILAN ACTIF - SYSCOHADA
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
                    ACTIF
                  </TableHead>
                  <TableHead className="w-16 font-semibold text-gray-900 text-center">
                    Note
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 min-w-32">
                    BRUT
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 min-w-32">
                    Amort/Prov
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 min-w-32">
                    NET
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bilanData.map((section: Section, sectionIndex: number) => (
                  <React.Fragment key={section.ref}>
                    {/* Section header */}
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableCell className="font-semibold text-gray-900 text-center">
                        {section.ref}
                      </TableCell>
                      <TableCell
                        colSpan={4}
                        className="font-semibold text-gray-900 uppercase"
                      >
                        {section.section}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-center">
                        {section.notesAnnexes}
                      </TableCell>
                    </TableRow>

                    {/* Section accounts */}
                    {section.accounts.map(
                      (account: Account, accountIndex: number) => (
                        <TableRow
                          key={`${section.ref}-${accountIndex}`}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <TableCell className="text-center text-sm text-gray-600">
                            {account.ref}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {account.libelle}
                          </TableCell>
                          <TableCell className="text-right text-gray-900">
                            {formatNumber(account.brut.toString())}
                          </TableCell>
                          <TableCell className="text-right text-gray-900">
                            {formatNumber(account.amort.toString())}
                          </TableCell>
                          <TableCell className="text-right text-gray-900 font-semibold">
                            {formatNumber(account.net.toString())}
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-600">
                            {account.note || ""}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </React.Fragment>
                ))}

                {/* TOTAL GÉNÉRAL */}
                <TableRow className="financial-table-total bg-gradient-to-r from-gray-100 to-gray-200 border-t-2 border-gray-300">
                  <TableCell className="text-center font-bold text-gray-900">
                    BZ
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 text-lg">
                    TOTAL GÉNÉRAL
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold text-gray-900 text-lg">
                    {formatNumber(totalGeneral.brut.toString())}
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900 text-lg">
                    {formatNumber(totalGeneral.amort.toString())}
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900 text-lg">
                    {formatNumber(totalGeneral.net.toString())}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dashboard-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-metric-label">Actif Immobilisé</p>
              <p className="dashboard-metric-value text-xl">
                {formatNumber(
                  bilanData
                    .find((s: Section) => s.ref === "AZ")
                    ?.accounts[0]?.net.toString() || "0"
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="dashboard-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-metric-label">Actif Circulant</p>
              <p className="dashboard-metric-value text-xl">
                {formatNumber(
                  bilanData
                    .find((s: Section) => s.ref === "BK")
                    ?.accounts[0]?.net.toString() || "0"
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="dashboard-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-metric-label">Total Actif</p>
              <p className="dashboard-metric-value text-xl">
                {formatNumber(totalGeneral.net.toString())}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
