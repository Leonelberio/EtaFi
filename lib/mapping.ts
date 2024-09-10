//@ts-nocheck

export const globalMapping = {
    actif: {
      "Immobilisations Incorporelles": ["211", "212", "213", "214", "215"],
      "Immobilisations Corporelles": ["22", "23", "24"],
      "Immobilisations Financières": ["26", "27"],
      "Stocks et En-cours": ["31", "32", "33"],
      "Créances Clients": ["411", "418"],
      "Autres Créances": ["42", "43", "44"],
      "Banque, Caisse, Trésorerie": ["512", "531", "54"]
    },
    passif: {
      "Capital Social": ["101", "102", "103"],
      "Réserves": ["106", "111", "113"],
      "Résultat Net": ["12"],
      "Emprunts": ["16", "181", "182"],
      "Fournisseurs": ["401", "408"],
      "Dettes Sociales et Fiscales": ["42", "43"]
    },
    compte_resultat: {
      "Produits": ["701", "702", "703"],
      "Charges": ["601", "602", "61", "62", "63"]
    }
  };
  
  export const mapBalanceToSections = (balance, mapping) => {
    const result = {};
    for (const [section, accounts] of Object.entries(mapping)) {
      result[section] = balance.filter((row) =>
        accounts.some((accountPrefix) => row.accountNumber.startsWith(accountPrefix))
      );
    }
    return result;
  };
  