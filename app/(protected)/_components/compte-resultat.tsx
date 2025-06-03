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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TrendingUp, Activity, DollarSign } from "lucide-react";
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
  note?: string;
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

// List of references that should be displayed in parentheses (i.e., subtracted refs)
const subtractedRefs = [
  "RA",
  "RB",
  "RC",
  "RD",
  "RE",
  "RF",
  "RG",
  "TP",
  "TB",
  "TD",
];

// Initial data structure for the Compte de Résultat
const compteResultat: Section[] = [
  {
    ref: "TA",
    libelle: "Ventes de marchandises",
    note: "21",
    accounts: [
      {
        ref: "TA",
        accountNumber: "701",
        libelle: "Ventes de marchandises",
        montant: 0,
      },
    ],
  },
  {
    ref: "RA",
    libelle: "Achats de marchandises",
    note: "22",
    accounts: [
      {
        ref: "RA",
        accountNumber: "601",
        libelle: "Achats de marchandises",
        montant: 0,
      },
    ],
  },
  {
    ref: "RB",
    libelle: "Variation de stocks de marchandises",
    note: "6",
    accounts: [
      {
        ref: "RB",
        accountNumber: "603",
        libelle: "Variation de stocks de marchandises",
        montant: 0,
      },
    ],
  },
  {
    ref: "XA",
    libelle: "MARGE COMMERCIALE (A - B)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row

  {
    ref: "TB",
    libelle: "Ventes de produits fabriqués B",
    note: "21",
    accounts: [
      {
        ref: "TB",
        accountNumber: "701",
        libelle: "Ventes de produits fabriqués",
        montant: 0,
      },
    ],
  },
  {
    ref: "TC",
    libelle: "Travaux, services vendus C",
    note: "21",
    accounts: [
      {
        ref: "TC",
        accountNumber: "706",
        libelle: "Travaux, services vendus",
        montant: 0,
      },
    ],
  },
  {
    ref: "TD",
    libelle: "Produits accessoires D",
    note: "21",
    accounts: [
      {
        ref: "TD",
        accountNumber: "707",
        libelle: "Produits accessoires",
        montant: 0,
      },
    ],
  },
  {
    ref: "XB",
    libelle: "CHIFFRES D'AFFAIRES (A + B + C + D)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row

  {
    ref: "TE",
    libelle: "Production stockée",
    note: "6",
    accounts: [
      {
        ref: "TE",
        accountNumber: "73",
        libelle: "Production stockée",
        montant: 0,
      },
    ],
  },
  {
    ref: "TF",
    libelle: "Production immobilisée",
    note: "21",
    accounts: [
      {
        ref: "TF",
        accountNumber: "72",
        libelle: "Production immobilisée",
        montant: 0,
      },
    ],
  },
  {
    ref: "TG",
    libelle: "Subventions d'exploitation",
    note: "21",
    accounts: [
      {
        ref: "TG",
        accountNumber: "74",
        libelle: "Subventions d'exploitation",
        montant: 0,
      },
    ],
  },
  {
    ref: "TH",
    libelle: "Autres produits",
    note: "21",
    accounts: [
      {
        ref: "TH",
        accountNumber: "75",
        libelle: "Autres produits",
        montant: 0,
      },
    ],
  },
  {
    ref: "TI",
    libelle: "Transferts de charges d'exploitation",
    note: "12",
    accounts: [
      {
        ref: "TI",
        accountNumber: "781",
        libelle: "Transferts de charges d'exploitation",
        montant: 0,
      },
    ],
  },

  {
    ref: "RC",
    libelle: "Achats de matières premières et fournitures",
    note: "22",
    accounts: [
      {
        ref: "RC",
        accountNumber: "601",
        libelle: "Achats de matières premières et fournitures",
        montant: 0,
      },
    ],
  },
  {
    ref: "RD",
    libelle: "Variation de stocks de matières premières et fournitures",
    note: "6",
    accounts: [
      {
        ref: "RD",
        accountNumber: "6032",
        libelle: "Variation de stocks de matières premières et fournitures",
        montant: 0,
      },
    ],
  },
  {
    ref: "RE",
    libelle: "Autres achats",
    note: "22",
    accounts: [
      { ref: "RE", accountNumber: "604", libelle: "Autres achats", montant: 0 },
    ],
  },
  {
    ref: "RF",
    libelle: "Variation de stocks d'autres approvisionnements",
    note: "6",
    accounts: [
      {
        ref: "RF",
        accountNumber: "603",
        libelle: "Variation de stocks d'autres approvisionnements",
        montant: 0,
      },
    ],
  },
  {
    ref: "RG",
    libelle: "Transports",
    note: "23",
    accounts: [
      { ref: "RG", accountNumber: "645", libelle: "Transports", montant: 0 },
    ],
  },
  {
    ref: "RH",
    libelle: "Services extérieurs",
    note: "24",
    accounts: [
      {
        ref: "RH",
        accountNumber: "60",
        libelle: "Services extérieurs",
        montant: 0,
      },
    ],
  },
  {
    ref: "RI",
    libelle: "Impôts et taxes",
    note: "25",
    accounts: [
      {
        ref: "RI",
        accountNumber: "60",
        libelle: "Impôts et taxes",
        montant: 0,
      },
    ],
  },
  {
    ref: "RJ",
    libelle: "Autres charges",
    note: "26",
    accounts: [
      { ref: "RJ", accountNumber: "60", libelle: "Autres charges", montant: 0 },
    ],
  },

  {
    ref: "XC",
    libelle: "VALEUR AJOUTÉE (XB + RA + RB)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row
  {
    ref: "RK",
    libelle: "Charges de personnel",
    note: "27",
    accounts: [
      {
        ref: "RK",
        accountNumber: "645",
        libelle: "Charges de personnel",
        montant: 0,
      },
    ],
  },
  {
    ref: "XD",
    libelle: "EXCÉDENT BRUT D'EXPLOITATION (XC + RK)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row

  {
    ref: "TJ",
    libelle: "Reprises d'amortissements, provisions et dépréciations",
    note: "28",
    accounts: [
      {
        ref: "TJ",
        accountNumber: "681",
        libelle: "Reprises d'amortissements, provisions et dépréciations",
        montant: 0,
      },
    ],
  },
  {
    ref: "TL",
    libelle: "Dotations aux amortissements, provisions et dépréciations",
    note: "3C&28",
    accounts: [
      {
        ref: "TL",
        accountNumber: "681",
        libelle: "Dotations aux amortissements, provisions et dépréciations",
        montant: 0,
      },
    ],
  },
  {
    ref: "XE",
    libelle: "RÉSULTAT D'EXPLOITATION (XD + TJ + RL)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row

  {
    ref: "TK",
    libelle: "Revenus financiers et assimilés",
    note: "29",
    accounts: [
      {
        ref: "TK",
        accountNumber: "76",
        libelle: "Revenus financiers et assimilés",
        montant: 0,
      },
    ],
  },
  {
    ref: "TM",
    libelle: "Transferts de charges financières",
    note: "12",
    accounts: [
      {
        ref: "TM",
        accountNumber: "791",
        libelle: "Transferts de charges financières",
        montant: 0,
      },
    ],
  },
  {
    ref: "XF",
    libelle: "RÉSULTAT FINANCIER (Somme TK + TB)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row

  {
    ref: "TN",
    libelle: "Produits des cessions d'immobilisations",
    note: "3D",
    accounts: [
      {
        ref: "TN",
        accountNumber: "775",
        libelle: "Produits des cessions d'immobilisations",
        montant: 0,
      },
    ],
  },
  {
    ref: "RP",
    libelle: "Valeurs comptables des cessions d'immobilisations",
    note: "3D",
    accounts: [
      {
        ref: "RP",
        accountNumber: "67",
        libelle: "Valeurs comptables des cessions d'immobilisations",
        montant: 0,
      },
    ],
  },
  {
    ref: "RM",
    libelle: "Autres produits",
    note: "30",
    accounts: [
      {
        ref: "RM",
        accountNumber: "70",
        libelle: "Autres produits",
        montant: 0,
      },
    ],
  },
  {
    ref: "XE",
    libelle: "RÉSULTAT D'ACTIVITÉS ORDINAIRES (XE + XF)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row

  {
    ref: "XG",
    libelle: "RESULTAT NET AVANT IMPÔTS (XD + XE)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row
  {
    ref: "XH",
    libelle: "RESULTAT NET (XG + XF)",
    note: "",
    accounts: [],
    total: true,
  }, // Total row
  {
    ref: "XI",
    libelle: "Résultat net (XH + RQ)",
    note: "",
    accounts: [],
    total: true,
  }, // Final total row
];

// Function to calculate totals for specific sections
const calculerTotal = (accounts: Account[]) => {
  return accounts.reduce((total, account) => {
    const isSubtracted = subtractedRefs.includes(account.ref);
    const montant = isSubtracted ? -account.montant : account.montant;
    return total + montant;
  }, 0);
};

/// Function to calculate specific totals like XA, XB, XC, XD, XE, XF, XG, XH, and XI
const calculateSpecialTotals = (ref: string, sections: Section[]): number => {
  switch (ref) {
    case "XA": // Marge commerciale: TA - RA + RB
      const totalTA_XA = calculerTotal(
        sections.find((s) => s.ref === "TA")?.accounts || []
      );
      const totalRA_XA = calculerTotal(
        sections.find((s) => s.ref === "RA")?.accounts || []
      );
      const totalRB_XA = calculerTotal(
        sections.find((s) => s.ref === "RB")?.accounts || []
      );
      return totalTA_XA - totalRA_XA + totalRB_XA;

    case "XB": // Chiffre d'affaires: TA + TB + TC + TD
      const totalTA_XB = calculerTotal(
        sections.find((s) => s.ref === "TA")?.accounts || []
      );
      const totalTB_XB = calculerTotal(
        sections.find((s) => s.ref === "TB")?.accounts || []
      );
      const totalTC_XB = calculerTotal(
        sections.find((s) => s.ref === "TC")?.accounts || []
      );
      const totalTD_XB = calculerTotal(
        sections.find((s) => s.ref === "TD")?.accounts || []
      );
      return totalTA_XB + totalTB_XB + totalTC_XB + totalTD_XB;

    case "XC": // Valeur ajoutée: XB - RA - RB + (TE + TF + TG + TH + TI) - (RC + RD + RE + RF)
      const totalXB_XC: number = calculateSpecialTotals("XB", sections);
      const totalRA_XC = calculerTotal(
        sections.find((s) => s.ref === "RA")?.accounts || []
      );
      const totalRB_XC = calculerTotal(
        sections.find((s) => s.ref === "RB")?.accounts || []
      );
      const totalTE_XC = calculerTotal(
        sections.find((s) => s.ref === "TE")?.accounts || []
      );
      const totalTF_XC = calculerTotal(
        sections.find((s) => s.ref === "TF")?.accounts || []
      );
      const totalTG_XC = calculerTotal(
        sections.find((s) => s.ref === "TG")?.accounts || []
      );
      const totalTH_XC = calculerTotal(
        sections.find((s) => s.ref === "TH")?.accounts || []
      );
      const totalTI_XC = calculerTotal(
        sections.find((s) => s.ref === "TI")?.accounts || []
      );
      const totalRC_XC = calculerTotal(
        sections.find((s) => s.ref === "RC")?.accounts || []
      );
      const totalRD_XC = calculerTotal(
        sections.find((s) => s.ref === "RD")?.accounts || []
      );
      const totalRE_XC = calculerTotal(
        sections.find((s) => s.ref === "RE")?.accounts || []
      );
      const totalRF_XC = calculerTotal(
        sections.find((s) => s.ref === "RF")?.accounts || []
      );
      return (
        totalXB_XC -
        totalRA_XC -
        totalRB_XC +
        (totalTE_XC + totalTF_XC + totalTG_XC + totalTH_XC + totalTI_XC) -
        (totalRC_XC + totalRD_XC + totalRE_XC + totalRF_XC)
      );

    case "XD": // Excédent brut d'exploitation: XC - RK
      const totalXC_XD: number = calculateSpecialTotals("XC", sections);
      const totalRK_XD = calculerTotal(
        sections.find((s) => s.ref === "RK")?.accounts || []
      );
      return totalXC_XD - totalRK_XD;

    case "XE": // Résultat d'exploitation: XD - TJ + RL
      const totalXD_XE: number = calculateSpecialTotals("XD", sections);
      const totalTJ_XE = calculerTotal(
        sections.find((s) => s.ref === "TJ")?.accounts || []
      );
      const totalRL_XE = calculerTotal(
        sections.find((s) => s.ref === "RL")?.accounts || []
      ); // Assuming RL is the reference for "reprises"
      return totalXD_XE - totalTJ_XE + totalRL_XE;

    case "XF": // Résultat financier: TK - (TL + TM)
      const totalTK_XF = calculerTotal(
        sections.find((s) => s.ref === "TK")?.accounts || []
      );
      const totalTL_XF = calculerTotal(
        sections.find((s) => s.ref === "TL")?.accounts || []
      );
      const totalTM_XF = calculerTotal(
        sections.find((s) => s.ref === "TM")?.accounts || []
      );
      return totalTK_XF - (totalTL_XF + totalTM_XF);

    case "XG": // Résultat des activités ordinaires: XE + XF
      const totalXE_XG: number = calculateSpecialTotals("XE", sections);
      const totalXF_XG: number = calculateSpecialTotals("XF", sections);
      return totalXE_XG + totalXF_XG;

    case "XH": // Résultat exceptionnel: TN - TP
      const totalTN_XH = calculerTotal(
        sections.find((s) => s.ref === "TN")?.accounts || []
      );
      const totalTP_XH = calculerTotal(
        sections.find((s) => s.ref === "TP")?.accounts || []
      );
      return totalTN_XH - totalTP_XH;

    case "XI": // Résultat net: RP - RS
      const totalXG_XI: number = calculateSpecialTotals("XG", sections);
      const totalXH_XI: number = calculateSpecialTotals("XH", sections);
      return totalXG_XI + totalXH_XI;

    default:
      return 0;
  }
};

// Main Compte de Résultat component
export default function CompteResultat() {
  const [resultatData, setResultatData] = useState<Section[]>(compteResultat);

  // Use global balance store instead of local state
  const balanceData = useBalanceData();
  const lastUpdated = useBalanceLastUpdated();

  const { exerciceId, companyId } = useParams() as {
    exerciceId: string;
    companyId: string;
  };

  // Map balance to Compte de Résultat - now using global store data
  const mapBalanceToCompteResultat = () => {
    const updatedResultat = resultatData.map((section) => {
      const updatedAccounts = section.accounts.map((account) => {
        let montant = 0;

        // Map accounts based on SYSCOHADA account class ranges
        if (account.accountNumber === "701") {
          // Ventes de marchandises - All Class 7 revenue accounts
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("70")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "706") {
          // Travaux, services vendus - Services (706-708)
          const matchingAccounts = balanceData.filter(
            (bal) =>
              bal.accountNumber.startsWith("706") ||
              bal.accountNumber.startsWith("707") ||
              bal.accountNumber.startsWith("708")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "707") {
          // Produits accessoires - Other products (754, 758, 75x)
          const matchingAccounts = balanceData.filter(
            (bal) =>
              bal.accountNumber.startsWith("754") ||
              bal.accountNumber.startsWith("758") ||
              bal.accountNumber.startsWith("75")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "73" ||
          account.accountNumber === "72" ||
          account.accountNumber === "74"
        ) {
          // Production stockée, immobilisée, subventions (72-74)
          const prefix = account.accountNumber;
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith(prefix)
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "75") {
          // Autres produits (75x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("75")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "781") {
          // Transferts de charges (78x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("78")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "601") {
          // Achats - All purchase accounts (60x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("60")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (
          account.accountNumber === "603" ||
          account.accountNumber === "6032" ||
          account.accountNumber === "604"
        ) {
          // Variations de stocks et autres achats (603, 604)
          const prefixes = ["603", "604"];
          const matchingAccounts = balanceData.filter((bal) =>
            prefixes.some((prefix) => bal.accountNumber.startsWith(prefix))
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "645") {
          // Transports et charges de personnel (64x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("64")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "60") {
          // Services extérieurs, impôts, autres charges (61-65)
          const matchingAccounts = balanceData.filter(
            (bal) =>
              bal.accountNumber.startsWith("61") ||
              bal.accountNumber.startsWith("62") ||
              bal.accountNumber.startsWith("63") ||
              bal.accountNumber.startsWith("65")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "681") {
          // Amortissements et provisions (68x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("68")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "76") {
          // Revenus financiers (76x, 77x)
          const matchingAccounts = balanceData.filter(
            (bal) =>
              bal.accountNumber.startsWith("76") ||
              bal.accountNumber.startsWith("77")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "791") {
          // Transferts de charges financières (79x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("79")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "775") {
          // Produits des cessions (77x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("775")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "67") {
          // Valeurs comptables des cessions (67x)
          const matchingAccounts = balanceData.filter((bal) =>
            bal.accountNumber.startsWith("67")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
          });
        } else if (account.accountNumber === "70") {
          // Autres produits (84x, 85x)
          const matchingAccounts = balanceData.filter(
            (bal) =>
              bal.accountNumber.startsWith("84") ||
              bal.accountNumber.startsWith("85")
          );
          matchingAccounts.forEach((bal) => {
            const solde =
              parseFloat(bal.solde.replace(/\s/g, "").replace(",", ".")) || 0;
            montant += Math.abs(solde);
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
            montant = Math.abs(solde);
          }
        }

        return {
          ...account,
          montant: montant,
        };
      });

      return { ...section, accounts: updatedAccounts };
    });

    setResultatData(updatedResultat);
  };

  // Auto-update when balance data changes in the global store
  useEffect(() => {
    if (balanceData.length > 0) {
      mapBalanceToCompteResultat();
    }
  }, [balanceData, lastUpdated]);

  // Calculate the total for sections that have total set to true
  const calculateSectionTotal = (section: Section) => {
    if (section.total) {
      if (["XA", "XB", "XC", "XD"].includes(section.ref)) {
        return formatNumber(
          calculateSpecialTotals(section.ref, resultatData).toString()
        );
      }
      return formatNumber(calculerTotal(section.accounts).toString());
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dashboard-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-metric-label">Chiffre d&apos;Affaires</p>
              <p className="dashboard-metric-value text-xl">
                {formatNumber(
                  calculateSpecialTotals("XB", resultatData).toString()
                )}
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
              <p className="dashboard-metric-label">
                Résultat d&apos;Exploitation
              </p>
              <p
                className={`dashboard-metric-value text-xl ${
                  calculateSpecialTotals("XE", resultatData) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatNumber(
                  calculateSpecialTotals("XE", resultatData).toString()
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="dashboard-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-metric-label">Résultat Net</p>
              <p
                className={`dashboard-metric-value text-xl ${
                  calculateSpecialTotals("XI", resultatData) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatNumber(
                  calculateSpecialTotals("XI", resultatData).toString()
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Income Statement Table */}
      <Card className="etafi-card">
        <CardHeader className="syscohada-header rounded-t-2xl">
          <div className="text-center">
            <CardTitle className="syscohada-title">
              COMPTE DE RÉSULTAT - SYSCOHADA
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
                    Exercice 2023
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 min-w-32">
                    Exercice 2022
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultatData?.map((section, sectionIndex) => (
                  <React.Fragment key={sectionIndex}>
                    {/* Render account rows first */}
                    {section.accounts.map((account, accountIndex) => (
                      <TableRow
                        key={accountIndex}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <TableCell className="text-center font-medium text-gray-700">
                          {account.ref}
                        </TableCell>
                        <TableCell className="text-gray-900 font-medium">
                          {account.libelle}
                        </TableCell>
                        <TableCell className="text-center text-gray-600">
                          {account.note || ""}
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900">
                          {subtractedRefs.includes(account.ref)
                            ? `(${formatNumber(account.montant.toString())})`
                            : formatNumber(account.montant.toString())}
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-600">
                          —
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Render the total row only if the section has total set to true */}
                    {section.total && (
                      <TableRow
                        className={`financial-table-total ${
                          section.ref === "XI"
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
                            section.ref === "XI" ? "text-lg" : ""
                          }`}
                        >
                          {calculateSectionTotal(section)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-gray-600">
                          —
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
