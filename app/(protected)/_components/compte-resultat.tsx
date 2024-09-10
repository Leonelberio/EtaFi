/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { formatNumber } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParams } from "next/navigation";

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

// List of references that should be displayed in parentheses (i.e., subtracted refs)
const subtractedRefs = ["RA", "RB", "RC", "RD", "RE", "RF", "RG", "TP", "TB", "TD"];

// Initial data structure for the Compte de Résultat
const compteResultat: Section[] = [
  { ref: "TA", libelle: "Ventes de marchandises", note: "21", accounts: [{ ref: "TA", accountNumber: "701", libelle: "Ventes de marchandises", montant: 0 }] },
  { ref: "RA", libelle: "Achats de marchandises", note: "22", accounts: [{ ref: "RA", accountNumber: "601", libelle: "Achats de marchandises", montant: 0 }] },
  { ref: "RB", libelle: "Variation de stocks de marchandises", note: "6", accounts: [{ ref: "RB", accountNumber: "603", libelle: "Variation de stocks de marchandises", montant: 0 }] },
  { ref: "XA", libelle: "MARGE COMMERCIALE (A - B)", note: "", accounts: [], total: true }, // Total row

  { ref: "TB", libelle: "Ventes de produits fabriqués B", note: "21", accounts: [{ ref: "TB", accountNumber: "701", libelle: "Ventes de produits fabriqués", montant: 0 }] },
  { ref: "TC", libelle: "Travaux, services vendus C", note: "21", accounts: [{ ref: "TC", accountNumber: "706", libelle: "Travaux, services vendus", montant: 0 }] },
  { ref: "TD", libelle: "Produits accessoires D", note: "21", accounts: [{ ref: "TD", accountNumber: "707", libelle: "Produits accessoires", montant: 0 }] },
  { ref: "XB", libelle: "CHIFFRES D'AFFAIRES (A + B + C + D)", note: "", accounts: [], total: true }, // Total row

  { ref: "TE", libelle: "Production stockée", note: "6", accounts: [{ ref: "TE", accountNumber: "73", libelle: "Production stockée", montant: 0 }] },
  { ref: "TF", libelle: "Production immobilisée", note: "21", accounts: [{ ref: "TF", accountNumber: "72", libelle: "Production immobilisée", montant: 0 }] },
  { ref: "TG", libelle: "Subventions d'exploitation", note: "21", accounts: [{ ref: "TG", accountNumber: "74", libelle: "Subventions d'exploitation", montant: 0 }] },
  { ref: "TH", libelle: "Autres produits", note: "21", accounts: [{ ref: "TH", accountNumber: "75", libelle: "Autres produits", montant: 0 }] },
  { ref: "TI", libelle: "Transferts de charges d'exploitation", note: "12", accounts: [{ ref: "TI", accountNumber: "781", libelle: "Transferts de charges d'exploitation", montant: 0 }] },

  { ref: "RC", libelle: "Achats de matières premières et fournitures", note: "22", accounts: [{ ref: "RC", accountNumber: "601", libelle: "Achats de matières premières et fournitures", montant: 0 }] },
  { ref: "RD", libelle: "Variation de stocks de matières premières et fournitures", note: "6", accounts: [{ ref: "RD", accountNumber: "6032", libelle: "Variation de stocks de matières premières et fournitures", montant: 0 }] },
  { ref: "RE", libelle: "Autres achats", note: "22", accounts: [{ ref: "RE", accountNumber: "604", libelle: "Autres achats", montant: 0 }] },
  { ref: "RF", libelle: "Variation de stocks d'autres approvisionnements", note: "6", accounts: [{ ref: "RF", accountNumber: "603", libelle: "Variation de stocks d'autres approvisionnements", montant: 0 }] },
  { ref: "RG", libelle: "Transports", note: "23", accounts: [{ ref: "RG", accountNumber: "645", libelle: "Transports", montant: 0 }] },
  { ref: "RH", libelle: "Services extérieurs", note: "24", accounts: [{ ref: "RH", accountNumber: "60", libelle: "Services extérieurs", montant: 0 }] },
  { ref: "RI", libelle: "Impôts et taxes", note: "25", accounts: [{ ref: "RI", accountNumber: "60", libelle: "Impôts et taxes", montant: 0 }] },
  { ref: "RJ", libelle: "Autres charges", note: "26", accounts: [{ ref: "RJ", accountNumber: "60", libelle: "Autres charges", montant: 0 }] },

  { ref: "XC", libelle: "VALEUR AJOUTÉE (XB + RA + RB)", note: "", accounts: [], total: true }, // Total row
  { ref: "RK", libelle: "Charges de personnel", note: "27", accounts: [{ ref: "RK", accountNumber: "645", libelle: "Charges de personnel", montant: 0 }] },
  { ref: "XD", libelle: "EXCÉDENT BRUT D'EXPLOITATION (XC + RK)", note: "", accounts: [], total: true }, // Total row

  { ref: "TJ", libelle: "Reprises d'amortissements, provisions et dépréciations", note: "28", accounts: [{ ref: "TJ", accountNumber: "681", libelle: "Reprises d'amortissements, provisions et dépréciations", montant: 0 }] },
  { ref: "TL", libelle: "Dotations aux amortissements, provisions et dépréciations", note: "3C&28", accounts: [{ ref: "TL", accountNumber: "681", libelle: "Dotations aux amortissements, provisions et dépréciations", montant: 0 }] },
  { ref: "XE", libelle: "RÉSULTAT D'EXPLOITATION (XD + TJ + RL)", note: "", accounts: [], total: true }, // Total row

  { ref: "TK", libelle: "Revenus financiers et assimilés", note: "29", accounts: [{ ref: "TK", accountNumber: "76", libelle: "Revenus financiers et assimilés", montant: 0 }] },
  { ref: "TM", libelle: "Transferts de charges financières", note: "12", accounts: [{ ref: "TM", accountNumber: "791", libelle: "Transferts de charges financières", montant: 0 }] },
  { ref: "XF", libelle: "RÉSULTAT FINANCIER (Somme TK + TB)", note: "", accounts: [], total: true }, // Total row

  { ref: "TN", libelle: "Produits des cessions d'immobilisations", note: "3D", accounts: [{ ref: "TN", accountNumber: "775", libelle: "Produits des cessions d'immobilisations", montant: 0 }] },
  { ref: "RP", libelle: "Valeurs comptables des cessions d'immobilisations", note: "3D", accounts: [{ ref: "RP", accountNumber: "67", libelle: "Valeurs comptables des cessions d'immobilisations", montant: 0 }] },
  { ref: "RM", libelle: "Autres produits", note: "30", accounts: [{ ref: "RM", accountNumber: "70", libelle: "Autres produits", montant: 0 }] },
  { ref: "XE", libelle: "RÉSULTAT D'ACTIVITÉS ORDINAIRES (XE + XF)", note: "", accounts: [], total: true }, // Total row

  { ref: "XG", libelle: "RESULTAT NET AVANT IMPÔTS (XD + XE)", note: "", accounts: [], total: true }, // Total row
  { ref: "XH", libelle: "RESULTAT NET (XG + XF)", note: "", accounts: [], total: true }, // Total row
  { ref: "XI", libelle: "Résultat net (XH + RQ)", note: "", accounts: [], total: true }, // Final total row
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
const calculateSpecialTotals = (ref: string, sections: Section[]) => {
  switch (ref) {
    case "XA": // Marge commerciale: TA - RA + RB
      const totalTA_XA = calculerTotal(sections.find(s => s.ref === "TA")?.accounts || []);
      const totalRA_XA = calculerTotal(sections.find(s => s.ref === "RA")?.accounts || []);
      const totalRB_XA = calculerTotal(sections.find(s => s.ref === "RB")?.accounts || []);
      return totalTA_XA - totalRA_XA + totalRB_XA;

    case "XB": // Chiffre d'affaires: TA + TB + TC + TD
      const totalTA_XB = calculerTotal(sections.find(s => s.ref === "TA")?.accounts || []);
      const totalTB_XB = calculerTotal(sections.find(s => s.ref === "TB")?.accounts || []);
      const totalTC_XB = calculerTotal(sections.find(s => s.ref === "TC")?.accounts || []);
      const totalTD_XB = calculerTotal(sections.find(s => s.ref === "TD")?.accounts || []);
      return totalTA_XB + totalTB_XB + totalTC_XB + totalTD_XB;

    case "XC": // Valeur ajoutée: XB - RA - RB + (TE + TF + TG + TH + TI) - (RC + RD + RE + RF)
      const totalXB_XC = calculateSpecialTotals("XB", sections);
      const totalRA_XC = calculerTotal(sections.find(s => s.ref === "RA")?.accounts || []);
      const totalRB_XC = calculerTotal(sections.find(s => s.ref === "RB")?.accounts || []);
      const totalTE_XC = calculerTotal(sections.find(s => s.ref === "TE")?.accounts || []);
      const totalTF_XC = calculerTotal(sections.find(s => s.ref === "TF")?.accounts || []);
      const totalTG_XC = calculerTotal(sections.find(s => s.ref === "TG")?.accounts || []);
      const totalTH_XC = calculerTotal(sections.find(s => s.ref === "TH")?.accounts || []);
      const totalTI_XC = calculerTotal(sections.find(s => s.ref === "TI")?.accounts || []);
      const totalRC_XC = calculerTotal(sections.find(s => s.ref === "RC")?.accounts || []);
      const totalRD_XC = calculerTotal(sections.find(s => s.ref === "RD")?.accounts || []);
      const totalRE_XC = calculerTotal(sections.find(s => s.ref === "RE")?.accounts || []);
      const totalRF_XC = calculerTotal(sections.find(s => s.ref === "RF")?.accounts || []);
      return totalXB_XC - totalRA_XC - totalRB_XC + (totalTE_XC + totalTF_XC + totalTG_XC + totalTH_XC + totalTI_XC) - (totalRC_XC + totalRD_XC + totalRE_XC + totalRF_XC);

    case "XD": // Excédent brut d'exploitation: XC - RK
      const totalXC_XD = calculateSpecialTotals("XC", sections);
      const totalRK_XD = calculerTotal(sections.find(s => s.ref === "RK")?.accounts || []);
      return totalXC_XD - totalRK_XD;

    case "XE": // Résultat d'exploitation: XD - TJ + RL
      const totalXD_XE = calculateSpecialTotals("XD", sections);
      const totalTJ_XE = calculerTotal(sections.find(s => s.ref === "TJ")?.accounts || []);
      const totalRL_XE = calculerTotal(sections.find(s => s.ref === "RL")?.accounts || []); // Assuming RL is the reference for "reprises"
      return totalXD_XE - totalTJ_XE + totalRL_XE;

    case "XF": // Résultat financier: TK - (TL + TM)
      const totalTK_XF = calculerTotal(sections.find(s => s.ref === "TK")?.accounts || []);
      const totalTL_XF = calculerTotal(sections.find(s => s.ref === "TL")?.accounts || []);
      const totalTM_XF = calculerTotal(sections.find(s => s.ref === "TM")?.accounts || []);
      return totalTK_XF - (totalTL_XF + totalTM_XF);

    case "XG": // Résultat des activités ordinaires: XE + XF
      const totalXE_XG = calculateSpecialTotals("XE", sections);
      const totalXF_XG = calculateSpecialTotals("XF", sections);
      return totalXE_XG + totalXF_XG;

    case "XH": // Résultat exceptionnel: TN - TP
      const totalTN_XH = calculerTotal(sections.find(s => s.ref === "TN")?.accounts || []);
      const totalTP_XH = calculerTotal(sections.find(s => s.ref === "TP")?.accounts || []);
      return totalTN_XH - totalTP_XH;

    case "XI": // Résultat net: RP - RS
      const totalXG_XI = calculateSpecialTotals("XG", sections);
      const totalXH_XI = calculateSpecialTotals("XH", sections);
      return totalXG_XI + totalXH_XI;

    default:
      return 0;
  }
};



// Main Compte de Résultat component
export default function CompteResultat() {
  const [resultatData, setResultatData] = useState(compteResultat);
  const [balance, setBalance] = useState([]);
  const { exerciceId, companyId } = useParams();

  // Load balance from API or LocalStorage
  useEffect(() => {
    const loadBalanceFromAPI = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}/balance`);
        if (response.ok) {
          const data = await response.json();
          setBalance(data.data);
        } else {
          console.error("Failed to fetch balance from API.");
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    const loadBalanceFromLocalStorage = () => {
      const storedBalance = localStorage.getItem(`balance_${exerciceId}`);
      if (storedBalance) {
        setBalance(JSON.parse(storedBalance));
      }
    };

    if (navigator.onLine) {
      loadBalanceFromAPI();
    } else {
      loadBalanceFromLocalStorage();
    }
  }, [companyId, exerciceId]);

  // Map balance to Compte de Résultat
  const mapBalanceToCompteResultat = () => {
    const updatedResultat = resultatData.map((section) => {
      const updatedAccounts = section.accounts.map((account) => {
        const matchingAccount = balance.find((bal) => bal.accountNumber === account.accountNumber);
        if (matchingAccount) {
          return {
            ...account,
            montant: parseFloat(matchingAccount.solde.replace(/\s/g, "")) || 0
          };
        }
        return account;
      });
      return { ...section, accounts: updatedAccounts };
    });

    setResultatData(updatedResultat);
  };

  // Trigger mapping when balance is loaded
  useEffect(() => {
    if (balance?.length > 0) {
      mapBalanceToCompteResultat();
    }
  }, [balance]);

  // Calculate the total for sections that have total set to true
  const calculateSectionTotal = (section: Section) => {
    if (section.total) {
      if (["XA", "XB", "XC", "XD"].includes(section.ref)) {
        return formatNumber(calculateSpecialTotals(section.ref, resultatData));
      }
      return formatNumber(calculerTotal(section.accounts));
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Compte de Résultat</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Réf</TableHead>
            <TableHead>LIBELLÉS</TableHead>
            <TableHead>NOTE</TableHead>
            <TableHead className="text-right">Exo. 2019 NET</TableHead>
            <TableHead className="text-right">Exo. 2018 NET</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultatData?.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              {/* Render account rows first */}
              {section.accounts.map((account, accountIndex) => (
                <TableRow key={accountIndex}>
                  <TableCell>{account.ref}</TableCell>
                  <TableCell>{account.libelle}</TableCell>
                  <TableCell>{account.note || ""}</TableCell>
                  <TableCell className="text-right">
                    {subtractedRefs.includes(account.ref)
                      ? `(${formatNumber(account.montant)})`
                      : formatNumber(account.montant)}
                  </TableCell>
                  <TableCell className="text-right">0</TableCell>
                </TableRow>
              ))}

              {/* Render the total row only if the section has total set to true */}
              {section.total && (
                <TableRow>
                  <TableCell className="bg-gray-200 font-bold">{section.ref}</TableCell>
                  <TableCell className="bg-gray-200 font-bold">{section.libelle}</TableCell>
                  <TableCell className="bg-gray-200 font-bold">{section.note}</TableCell>
                  <TableCell className="text-right bg-gray-200 font-bold">
                    {calculateSectionTotal(section)}
                  </TableCell>
                  <TableCell className="text-right bg-gray-200 font-bold">0</TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
