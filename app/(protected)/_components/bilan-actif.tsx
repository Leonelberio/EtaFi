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

// Data structure for the Bilan Actif rows
const bilanActif: Section[] = [
  {
    section: "IMMOBILISATIONS INCORPORELLES",
    notesAnnexes: "3",
    ref: "AD",
    accounts: [
      { ref: "AE", accountNumber: "211", libelle: "Frais de développement et de prospection", brut: 0, amort: 0, net: 0 },
      { ref: "AF", accountNumber: "212", libelle: "Brevets, licences, logiciels et droits similaires", brut: 0, amort: 0, net: 0 },
      { ref: "AG", accountNumber: "213", libelle: "Fonds commercial et droit au bail", brut: 0, amort: 0, net: 0 },
      { ref: "AH", accountNumber: "214", libelle: "Autres immobilisations incorporelles", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "IMMOBILISATIONS CORPORELLES",
    notesAnnexes: "3",
    ref: "AI",
    accounts: [
      { ref: "AJ", accountNumber: "22", libelle: "Terrains", brut: 0, amort: 0, net: 0 },
      { ref: "AK", accountNumber: "23", libelle: "Bâtiments", brut: 0, amort: 0, net: 0 },
      { ref: "AL", accountNumber: "24", libelle: "Aménagements, agencements et installations", brut: 0, amort: 0, net: 0 },
      { ref: "AN", accountNumber: "218", libelle: "Matériel de transport", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS",
    notesAnnexes: "3",
    ref: "AP",
    accounts: [
      { ref: "AP", accountNumber: "238", libelle: "Avances et acomptes versés sur immobilisations", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "IMMOBILISATIONS FINANCIÈRES",
    notesAnnexes: "4",
    ref: "AQ",
    accounts: [
      { ref: "AR", accountNumber: "231", libelle: "Titres de participation", brut: 0, amort: 0, net: 0 },
      { ref: "AS", accountNumber: "27", libelle: "Autres immobilisations financières", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "TOTAL ACTIF IMMOBILISÉ",
    notesAnnexes: "",
    ref: "AZ",
    accounts: []
  },
  {
    section: "STOCKS ET EN-COURS",
    notesAnnexes: "6",
    ref: "BB",
    accounts: [
      { ref: "BB", accountNumber: "31", libelle: "Stocks de matières premières", brut: 0, amort: 0, net: 0 },
      { ref: "BB", accountNumber: "32", libelle: "En-cours de production de biens", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "CRÉANCES ET EMPLOIS ASSIMILÉS",
    notesAnnexes: "7",
    ref: "BG",
    accounts: [
      { ref: "BH", accountNumber: "411", libelle: "Clients", brut: 0, amort: 0, net: 0 },
      { ref: "BI", accountNumber: "416", libelle: "Autres créances", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "TOTAL ACTIF CIRCULANT",
    notesAnnexes: "",
    ref: "BK",
    accounts: []
  },
  {
    section: "TRÉSORERIE ACTIF",
    notesAnnexes: "11",
    ref: "BT",
    accounts: [
      { ref: "BS", accountNumber: "512", libelle: "Banques, chèques postaux, caisse et assimilés", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "ÉCART DE CONVERSION ACTIF",
    notesAnnexes: "12",
    ref: "BU",
    accounts: [
      { ref: "BU", accountNumber: "47", libelle: "Écarts de conversion - Actif", brut: 0, amort: 0, net: 0 }
    ]
  },

];

// Function to calculate totals for each section
const calculerTotal = (accounts: Account[]) => {
  return accounts.reduce(
    (total, account) => ({
      brut: total.brut + account.brut,
      amort: total.amort + account.amort,
      net: total.net + account.net
    }),
    { brut: 0, amort: 0, net: 0 }
  );
};

// Function to calculate the total for each major section (AZ, BK, BZ) and update directly in `actifData`
const updateSectionTotals = (sections: Section[]) => {
  const updatedSections = sections.map((section) => {
    if (section.ref === "AZ") {
      // Total Actif Immobilisé
      const relevantSections = sections.filter((s) => ["AD", "AI", "AP", "AQ"].includes(s.ref));
      const total = relevantSections.reduce((acc, s) => {
        const sectionTotal = calculerTotal(s.accounts);
        acc.brut += sectionTotal.brut;
        acc.amort += sectionTotal.amort;
        acc.net += sectionTotal.net;
        return acc;
      }, { brut: 0, amort: 0, net: 0 });
      section.accounts = [{ ref: "AZ", accountNumber: "", libelle: "Total Actif Immobilisé", brut: total.brut, amort: total.amort, net: total.net }];
    }

    if (section.ref === "BK") {
      // Total Actif Circulant
      const relevantSections = sections.filter((s) => ["BB", "BG"].includes(s.ref));
      const total = relevantSections.reduce((acc, s) => {
        const sectionTotal = calculerTotal(s.accounts);
        acc.brut += sectionTotal.brut;
        acc.amort += sectionTotal.amort;
        acc.net += sectionTotal.net;
        return acc;
      }, { brut: 0, amort: 0, net: 0 });
      section.accounts = [{ ref: "BK", accountNumber: "", libelle: "Total Actif Circulant", brut: total.brut, amort: total.amort, net: total.net }];
    }

    return section;
  });

  return updatedSections;
};

// Function to calculate Total General
const calculateTotalGeneral = (sections: Section[]) => {
  const relevantSections = sections.filter((s) => ["AZ", "BK", "BT", "BU"].includes(s.ref));
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
  const [actifData, setActifData] = useState<Section[]>(bilanActif);
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

    // Decide whether to load from API or LocalStorage
    if (navigator.onLine) {
      loadBalanceFromAPI();
    } else {
      loadBalanceFromLocalStorage();
    }
  }, [companyId, exerciceId]);

  // Map balance to Bilan Actif
  const mapBalanceToBilanActif = () => {
    const updatedActif = actifData.map((section) => {
      const updatedAccounts = section.accounts.map((account) => {
        const matchingAccount = balance.find((bal) => bal.accountNumber === account.accountNumber);
        if (matchingAccount) {
          return {
            ...account,
            brut: parseFloat(matchingAccount.debits.replace(/\s/g, "")) || 0,
            amort: parseFloat(matchingAccount.credits.replace(/\s/g, "")) || 0,
            net: parseFloat(matchingAccount.solde.replace(/\s/g, "")) || 0,
          };
        }
        return account;
      });
      return { ...section, accounts: updatedAccounts };
    });

    const updatedActifWithTotals = updateSectionTotals(updatedActif);
    setActifData(updatedActifWithTotals);
  };

  // Trigger mapping when balance is loaded
  useEffect(() => {
    if (balance?.length > 0) {
      mapBalanceToBilanActif();
    }
  }, [balance]);

  // Calculate Total General
  const totalGeneral = calculateTotalGeneral(actifData);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bilan Actif</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Réf</TableHead>
            <TableHead>ACTIF</TableHead>
            <TableHead>NOTE</TableHead>
            <TableHead className="text-right">BRUT</TableHead>
            <TableHead className="text-right">AMORT ET DÉPRÉC.</TableHead>
            <TableHead className="text-right">NET</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actifData?.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              <TableRow>
                <TableCell className="bg-gray-200 font-bold">{section.ref}</TableCell>
                <TableCell className="bg-gray-200 font-bold">{section.section}</TableCell>
                <TableCell className="bg-gray-200 font-bold">{section.notesAnnexes}</TableCell>
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
                  <TableCell className="text-right">{formatNumber(account.brut)}</TableCell>
                  <TableCell className="text-right">{formatNumber(account.amort)}</TableCell>
                  <TableCell className="text-right">{formatNumber(account.net)}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}

          {/* BZ Total General */}
          <TableRow className="bg-gray-200 font-bold">
            <TableCell>BZ</TableCell>
            <TableCell>TOTAL GENERAL</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">{formatNumber(totalGeneral.brut)}</TableCell>
            <TableCell className="text-right">{formatNumber(totalGeneral.amort)}</TableCell>
            <TableCell className="text-right">{formatNumber(totalGeneral.net)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
