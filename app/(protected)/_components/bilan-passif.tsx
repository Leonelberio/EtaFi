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
      { ref: "CA", accountNumber: "101", libelle: "Capital", brut: 0, amort: 0, net: 0 },
      { ref: "CB", accountNumber: "102", libelle: "Apporteurs capital non appelé (-)", brut: 0, amort: 0, net: 0 },
      { ref: "CD", accountNumber: "104", libelle: "Primes liées au capital social", brut: 0, amort: 0, net: 0 },
      { ref: "CE", accountNumber: "105", libelle: "Écarts de réévaluation", brut: 0, amort: 0, net: 0 },
      { ref: "CF", accountNumber: "1061", libelle: "Réserves indisponibles", brut: 0, amort: 0, net: 0 },
      { ref: "CG", accountNumber: "1068", libelle: "Réserves libres", brut: 0, amort: 0, net: 0 },
      { ref: "CH", accountNumber: "110", libelle: "Report à nouveau", brut: 0, amort: 0, net: 0 },
      { ref: "CJ", accountNumber: "12", libelle: "Résultat net de l'exercice", brut: 0, amort: 0, net: 0 },
      { ref: "CL", accountNumber: "131", libelle: "Subventions d'investissement", brut: 0, amort: 0, net: 0 },
      { ref: "CM", accountNumber: "14", libelle: "Provisions réglementées", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "DETTES FINANCIÈRES ET PROVISIONS",
    notesAnnexes: "5",
    ref: "DD",
    accounts: [
      { ref: "DA", accountNumber: "16", libelle: "Emprunts et dettes financières diverses", brut: 0, amort: 0, net: 0 },
      { ref: "DB", accountNumber: "17", libelle: "Dettes de location acquisition", brut: 0, amort: 0, net: 0 },
      { ref: "DC", accountNumber: "151", libelle: "Provisions pour risques et charges", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "PASSIF CIRCULANT",
    notesAnnexes: "7",
    ref: "DP",
    accounts: [
      { ref: "DH", accountNumber: "42", libelle: "Dettes circulantes HAO", brut: 0, amort: 0, net: 0 },
      { ref: "DI", accountNumber: "419", libelle: "Clients, avances reçues", brut: 0, amort: 0, net: 0 },
      { ref: "DJ", accountNumber: "401", libelle: "Fournisseurs d'exploitation", brut: 0, amort: 0, net: 0 },
      { ref: "DK", accountNumber: "44", libelle: "Dettes fiscales et sociales", brut: 0, amort: 0, net: 0 },
      { ref: "DM", accountNumber: "46", libelle: "Autres dettes", brut: 0, amort: 0, net: 0 },
      { ref: "DN", accountNumber: "1515", libelle: "Provisions pour risques à court terme", brut: 0, amort: 0, net: 0 }
    ]
  },
  {
    section: "TRÉSORERIE PASSIF",
    notesAnnexes: "9",
    ref: "DT",
    accounts: [
      { ref: "DQ", accountNumber: "5124", libelle: "Banques, crédits d'escompte", brut: 0, amort: 0, net: 0 },
      { ref: "DR", accountNumber: "5123", libelle: "Banques, établissements financiers et crédits de trésorerie", brut: 0, amort: 0, net: 0 }
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

// Function to calculate the total for each major section and update directly in `passifData`
const updateSectionTotals = (sections: Section[]) => {
  const updatedSections = sections.map((section) => {
    const previousAccounts = section.accounts; // Keep previous accounts

    if (section.ref === "CP") {
      // Total Capitaux Propres
      const relevantSections = sections.filter((s) => ["CA", "CB", "CD", "CE", "CF", "CG", "CH", "CJ", "CL", "CM"].includes(s.ref));
      const total = relevantSections.reduce((acc, s) => {
        const sectionTotal = calculerTotal(s.accounts);
        acc.brut += sectionTotal.brut;
        acc.amort += sectionTotal.amort;
        acc.net += sectionTotal.net;
        return acc;
      }, { brut: 0, amort: 0, net: 0 });
      section.accounts = [...previousAccounts, { ref: "CP", accountNumber: "", libelle: "Total Capitaux Propres", brut: total.brut, amort: total.amort, net: total.net }];
    }

    if (section.ref === "DD") {
      // Total Dettes Financières et Provisions
      const relevantSections = sections.filter((s) => ["DA", "DB", "DC"].includes(s.ref));
      const total = relevantSections.reduce((acc, s) => {
        const sectionTotal = calculerTotal(s.accounts);
        acc.brut += sectionTotal.brut;
        acc.amort += sectionTotal.amort;
        acc.net += sectionTotal.net;
        return acc;
      }, { brut: 0, amort: 0, net: 0 });
      section.accounts = [...previousAccounts, { ref: "DD", accountNumber: "", libelle: "Total Dettes Financières et Provisions", brut: total.brut, amort: total.amort, net: total.net }];
    }

    if (section.ref === "DP") {
      // Total Passif Circulant
      const relevantSections = sections.filter((s) => ["DH", "DI", "DJ", "DK", "DM", "DN"].includes(s.ref));
      const total = relevantSections.reduce((acc, s) => {
        const sectionTotal = calculerTotal(s.accounts);
        acc.brut += sectionTotal.brut;
        acc.amort += sectionTotal.amort;
        acc.net += sectionTotal.net;
        return acc;
      }, { brut: 0, amort: 0, net: 0 });
      section.accounts = [...previousAccounts, { ref: "DP", accountNumber: "", libelle: "Total Passif Circulant", brut: total.brut, amort: total.amort, net: total.net }];
    }

    return section;
  });

  return updatedSections;
};

// Main Bilan Passif component
export default function BilanPassif() {
  const [passifData, setPassifData] = useState<Section[]>(bilanPassif);
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

  // Map balance to Bilan Passif
  const mapBalanceToBilanPassif = () => {
    const updatedPassif = passifData.map((section) => {
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

    const updatedPassifWithTotals = updateSectionTotals(updatedPassif);
    setPassifData(updatedPassifWithTotals);
  };

  // Trigger mapping when balance is loaded
  useEffect(() => {
    if (balance?.length > 0) {
      mapBalanceToBilanPassif();
    }
  }, [balance]);

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

          {/* DZ Total General */}
          <TableRow className="bg-gray-200 font-bold">
            <TableCell>DZ</TableCell>
            <TableCell>TOTAL GENERAL</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">{formatNumber(calculerTotal(passifData.map(s => calculerTotal(s.accounts))).brut)}</TableCell>
            <TableCell className="text-right">{formatNumber(calculerTotal(passifData.map(s => calculerTotal(s.accounts))).amort)}</TableCell>
            <TableCell className="text-right">{formatNumber(calculerTotal(passifData.map(s => calculerTotal(s.accounts))).net)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
