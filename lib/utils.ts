//@ts-nocheck

/**
 * Format number for display, converting it to the desired locale and format.
 * @param {string | number} value - The number to format
 * @returns {string} - Formatted number as string
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export const formatNumber = (value:string) => {
  if (!value) return "";
  const number = parseFloat(
    value
      .toString()
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "")
  );
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

/**
 * Parse a formatted number back to a float for calculations.
 * This removes any formatting and converts the string to a valid float.
 * @param {string} value - The formatted number to parse
 * @returns {number} - The parsed float value
 */
export const parseFormattedNumber = (value) => {
  if (!value) return 0;
  return parseFloat(value.replace(/\s/g, "").replace(",", "."));
};

/**
 * Group the balance sheet data by classes.
 * Classifies accounts into specific classes (capitaux, immobilisations, stocks, etc.)
 * based on the account number (SYSCOHADA or another accounting plan).
 * 
 * @param {Array} data - The array of balance sheet accounts.
 * @returns {Object} - An object grouping accounts by classes.
 */
export const groupByClass = (data) => {
  const classes = {
    "Classe 1 : Comptes de Capitaux": [],
    "Classe 2 : Comptes d'Immobilisations": [],
    "Classe 3 : Comptes de Stocks": [],
    "Classe 4 : Comptes de Tiers": [],
    "Classe 5 : Comptes de Trésorerie": [],
    "Classe 6 : Comptes de Charges": [],
    "Classe 7 : Comptes de Produits": [],
  };

  data.forEach((row) => {
    const accountNumber = parseInt(row.accountNumber, 10);

    if (accountNumber >= 100 && accountNumber < 200) {
      classes["Classe 1 : Comptes de Capitaux"].push(row);
    } else if (accountNumber >= 200 && accountNumber < 300) {
      classes["Classe 2 : Comptes d'Immobilisations"].push(row);
    } else if (accountNumber >= 300 && accountNumber < 400) {
      classes["Classe 3 : Comptes de Stocks"].push(row);
    } else if (accountNumber >= 400 && accountNumber < 500) {
      classes["Classe 4 : Comptes de Tiers"].push(row);
    } else if (accountNumber >= 500 && accountNumber < 600) {
      classes["Classe 5 : Comptes de Trésorerie"].push(row);
    } else if (accountNumber >= 600 && accountNumber < 700) {
      classes["Classe 6 : Comptes de Charges"].push(row);
    } else if (accountNumber >= 700 && accountNumber < 800) {
      classes["Classe 7 : Comptes de Produits"].push(row);
    }
  });

  return classes;
};


export const calculerTotal = (data) => {
  return data.reduce(
    (acc, row) => ({
      brut: acc.brut + row.brut,
      amort: acc.amort + row.amort,
      net: acc.net + row.net,
    }),
    { brut: 0, amort: 0, net: 0 }
  );
};