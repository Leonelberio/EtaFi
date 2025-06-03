import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface BalanceData {
  accountNumber: string;
  account: string;
  debits: string;
  credits: string;
  solde: string;
}

// Computed financial totals interface
export interface FinancialTotals {
  totalActif: number;
  totalPassif: number;
  resultatNet: number;
  fluxTresorerie: number;
}

interface BalanceStore {
  balance: BalanceData[];
  lastUpdated: number;
  isLoading: boolean;
  isSaving: boolean;

  // Cached computed values
  _financialTotals: FinancialTotals;

  // Actions
  setBalance: (balance: BalanceData[]) => void;
  updateBalanceRow: (
    accountNumber: string,
    updates: Partial<BalanceData>
  ) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  addSampleData: () => void;

  // Computed getters - now return cached values
  getTotalActif: () => number;
  getTotalPassif: () => number;
  getResultatNet: () => number;
  getFluxTresorerie: () => number;
  getFinancialTotals: () => FinancialTotals;

  // Internal method to recalculate totals
  _calculateFinancialTotals: () => FinancialTotals;
}

export const useBalanceStore = create<BalanceStore>()(
  subscribeWithSelector((set, get) => ({
    balance: [],
    lastUpdated: Date.now(),
    isLoading: false,
    isSaving: false,
    _financialTotals: {
      totalActif: 0,
      totalPassif: 0,
      resultatNet: 0,
      fluxTresorerie: 0,
    },

    _calculateFinancialTotals: (): FinancialTotals => {
      const { balance } = get();
      let totalActif = 0;
      let totalPassif = 0;
      let resultatNet = 0;
      let fluxTresorerie = 0;

      balance.forEach((row: BalanceData) => {
        const solde = parseFloat(row.solde.replace(/[^0-9.-]/g, "")) || 0;
        const accountNum = row.accountNumber;

        // Calculate total actif (Classes 2, 3, 4-receivables, 5)
        if (
          accountNum.startsWith("2") ||
          accountNum.startsWith("3") ||
          accountNum.startsWith("5") ||
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("41") || accountNum.startsWith("45")))
        ) {
          totalActif += Math.abs(solde);
        }

        // Calculate total passif (Class 1 + Class 4-payables)
        if (
          accountNum.startsWith("1") ||
          (accountNum.startsWith("4") &&
            !(accountNum.startsWith("41") || accountNum.startsWith("45")))
        ) {
          totalPassif += Math.abs(solde);
        }

        // Calculate net result (Class 7 - Class 6)
        if (accountNum.startsWith("7")) {
          resultatNet += Math.abs(solde);
        } else if (accountNum.startsWith("6")) {
          resultatNet -= Math.abs(solde);
        }

        // Calculate cash flow approximation (Class 5 - treasury accounts)
        if (accountNum.startsWith("5")) {
          fluxTresorerie += Math.abs(solde);
        }
      });

      return { totalActif, totalPassif, resultatNet, fluxTresorerie };
    },

    setBalance: (balance: BalanceData[]) => {
      // Calculate totals with the new balance
      let totalActif = 0;
      let totalPassif = 0;
      let resultatNet = 0;
      let fluxTresorerie = 0;

      balance.forEach((row: BalanceData) => {
        const solde = parseFloat(row.solde.replace(/[^0-9.-]/g, "")) || 0;
        const accountNum = row.accountNumber;

        // Calculate total actif (Classes 2, 3, 4-receivables, 5)
        if (
          accountNum.startsWith("2") ||
          accountNum.startsWith("3") ||
          accountNum.startsWith("5") ||
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("41") || accountNum.startsWith("45")))
        ) {
          totalActif += Math.abs(solde);
        }

        // Calculate total passif (Class 1 + Class 4-payables)
        if (
          accountNum.startsWith("1") ||
          (accountNum.startsWith("4") &&
            !(accountNum.startsWith("41") || accountNum.startsWith("45")))
        ) {
          totalPassif += Math.abs(solde);
        }

        // Calculate net result (Class 7 - Class 6)
        if (accountNum.startsWith("7")) {
          resultatNet += Math.abs(solde);
        } else if (accountNum.startsWith("6")) {
          resultatNet -= Math.abs(solde);
        }

        // Calculate cash flow approximation (Class 5 - treasury accounts)
        if (accountNum.startsWith("5")) {
          fluxTresorerie += Math.abs(solde);
        }
      });

      const newTotals = {
        totalActif,
        totalPassif,
        resultatNet,
        fluxTresorerie,
      };

      set({
        balance,
        lastUpdated: Date.now(),
        isLoading: false,
        isSaving: false,
        _financialTotals: newTotals,
      });
    },

    updateBalanceRow: (
      accountNumber: string,
      updates: Partial<BalanceData>
    ) => {
      const { balance } = get();
      const updatedBalance = balance.map((row: BalanceData) =>
        row.accountNumber === accountNumber ? { ...row, ...updates } : row
      );

      // Calculate totals with the updated balance
      let totalActif = 0;
      let totalPassif = 0;
      let resultatNet = 0;
      let fluxTresorerie = 0;

      updatedBalance.forEach((row: BalanceData) => {
        const solde = parseFloat(row.solde.replace(/[^0-9.-]/g, "")) || 0;
        const accountNum = row.accountNumber;

        // Calculate total actif (Classes 2, 3, 4-receivables, 5)
        if (
          accountNum.startsWith("2") ||
          accountNum.startsWith("3") ||
          accountNum.startsWith("5") ||
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("41") || accountNum.startsWith("45")))
        ) {
          totalActif += Math.abs(solde);
        }

        // Calculate total passif (Class 1 + Class 4-payables)
        if (
          accountNum.startsWith("1") ||
          (accountNum.startsWith("4") &&
            !(accountNum.startsWith("41") || accountNum.startsWith("45")))
        ) {
          totalPassif += Math.abs(solde);
        }

        // Calculate net result (Class 7 - Class 6)
        if (accountNum.startsWith("7")) {
          resultatNet += Math.abs(solde);
        } else if (accountNum.startsWith("6")) {
          resultatNet -= Math.abs(solde);
        }

        // Calculate cash flow approximation (Class 5 - treasury accounts)
        if (accountNum.startsWith("5")) {
          fluxTresorerie += Math.abs(solde);
        }
      });

      const newTotals = {
        totalActif,
        totalPassif,
        resultatNet,
        fluxTresorerie,
      };

      set({
        balance: updatedBalance,
        lastUpdated: Date.now(),
        isSaving: true,
        _financialTotals: newTotals,
      });

      // Save to localStorage for immediate persistence
      const exerciceId = localStorage.getItem("currentExerciceId");
      if (exerciceId) {
        localStorage.setItem(
          `balance_${exerciceId}`,
          JSON.stringify(updatedBalance)
        );
      }

      // Save to database asynchronously
      if (exerciceId) {
        const saveToDatabase = async () => {
          try {
            // Set saving state to true
            set({ isSaving: true });

            const companyId = window.location.pathname.split("/")[3]; // Extract from URL
            const response = await fetch(
              `/api/companies/${companyId}/exercice/${exerciceId}/balance`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: updatedBalance }),
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to save balance: ${response.statusText}`);
            }

            // Success - update saving state
            set({ isSaving: false });
            console.log("✅ Balance successfully saved to database");
          } catch (error) {
            console.error("❌ Error saving balance to database:", error);
            // Reset saving state on error
            set({ isSaving: false });
          }
        };

        // Save to database without blocking the UI
        saveToDatabase();
      } else {
        // If no exerciceId, reset saving state
        set({ isSaving: false });
      }
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setSaving: (isSaving: boolean) => {
      set({ isSaving });
    },

    // Computed getters now return cached values
    getTotalActif: () => {
      return get()._financialTotals.totalActif;
    },

    getTotalPassif: () => {
      return get()._financialTotals.totalPassif;
    },

    getResultatNet: () => {
      return get()._financialTotals.resultatNet;
    },

    getFluxTresorerie: () => {
      return get()._financialTotals.fluxTresorerie;
    },

    getFinancialTotals: () => {
      return get()._financialTotals;
    },

    addSampleData: () => {
      // Sample SYSCOHADA balance sheet data for testing
      const sampleBalance: BalanceData[] = [
        // Class 1 - Ressources durables (Equity & Long-term liabilities)
        {
          accountNumber: "101",
          account: "Capital",
          debits: "0",
          credits: "5,000,000",
          solde: "-5,000,000",
        },
        {
          accountNumber: "106",
          account: "Réserves",
          debits: "0",
          credits: "1,500,000",
          solde: "-1,500,000",
        },
        {
          accountNumber: "110",
          account: "Report à nouveau",
          debits: "0",
          credits: "800,000",
          solde: "-800,000",
        },
        {
          accountNumber: "120",
          account: "Résultat de l'exercice",
          debits: "0",
          credits: "950,000",
          solde: "-950,000",
        },
        {
          accountNumber: "161",
          account: "Emprunts et dettes",
          debits: "0",
          credits: "2,500,000",
          solde: "-2,500,000",
        },

        // Class 2 - Immobilisations (Fixed Assets)
        {
          accountNumber: "211",
          account: "Brevets, licences, logiciels",
          debits: "300,000",
          credits: "0",
          solde: "300,000",
        },
        {
          accountNumber: "221",
          account: "Terrains",
          debits: "1,200,000",
          credits: "0",
          solde: "1,200,000",
        },
        {
          accountNumber: "231",
          account: "Bâtiments",
          debits: "3,500,000",
          credits: "0",
          solde: "3,500,000",
        },
        {
          accountNumber: "241",
          account: "Matériel et outillage",
          debits: "1,800,000",
          credits: "0",
          solde: "1,800,000",
        },
        {
          accountNumber: "245",
          account: "Matériel de transport",
          debits: "600,000",
          credits: "0",
          solde: "600,000",
        },

        // Class 3 - Stocks
        {
          accountNumber: "311",
          account: "Stocks de matières premières",
          debits: "450,000",
          credits: "0",
          solde: "450,000",
        },
        {
          accountNumber: "321",
          account: "En-cours de production",
          debits: "280,000",
          credits: "0",
          solde: "280,000",
        },
        {
          accountNumber: "371",
          account: "Stocks de marchandises",
          debits: "720,000",
          credits: "0",
          solde: "720,000",
        },

        // Class 4 - Tiers (Third parties)
        {
          accountNumber: "411",
          account: "Clients",
          debits: "1,250,000",
          credits: "0",
          solde: "1,250,000",
        },
        {
          accountNumber: "401",
          account: "Fournisseurs",
          debits: "0",
          credits: "850,000",
          solde: "-850,000",
        },
        {
          accountNumber: "421",
          account: "Personnel",
          debits: "0",
          credits: "180,000",
          solde: "-180,000",
        },
        {
          accountNumber: "431",
          account: "Sécurité sociale",
          debits: "0",
          credits: "95,000",
          solde: "-95,000",
        },
        {
          accountNumber: "441",
          account: "État et collectivités",
          debits: "0",
          credits: "220,000",
          solde: "-220,000",
        },

        // Class 5 - Trésorerie (Cash)
        {
          accountNumber: "512",
          account: "Banques",
          debits: "890,000",
          credits: "0",
          solde: "890,000",
        },
        {
          accountNumber: "531",
          account: "Caisse",
          debits: "45,000",
          credits: "0",
          solde: "45,000",
        },

        // Class 6 - Charges (Expenses)
        {
          accountNumber: "601",
          account: "Achats de marchandises",
          debits: "3,200,000",
          credits: "0",
          solde: "3,200,000",
        },
        {
          accountNumber: "621",
          account: "Services extérieurs A",
          debits: "680,000",
          credits: "0",
          solde: "680,000",
        },
        {
          accountNumber: "631",
          account: "Services extérieurs B",
          debits: "420,000",
          credits: "0",
          solde: "420,000",
        },
        {
          accountNumber: "641",
          account: "Charges de personnel",
          debits: "2,100,000",
          credits: "0",
          solde: "2,100,000",
        },
        {
          accountNumber: "661",
          account: "Charges financières",
          debits: "150,000",
          credits: "0",
          solde: "150,000",
        },
        {
          accountNumber: "681",
          account: "Dotations amortissements",
          debits: "380,000",
          credits: "0",
          solde: "380,000",
        },

        // Class 7 - Produits (Revenue)
        {
          accountNumber: "701",
          account: "Ventes de marchandises",
          debits: "0",
          credits: "5,800,000",
          solde: "-5,800,000",
        },
        {
          accountNumber: "706",
          account: "Prestations de services",
          debits: "0",
          credits: "2,400,000",
          solde: "-2,400,000",
        },
        {
          accountNumber: "754",
          account: "Produits exceptionnels",
          debits: "0",
          credits: "180,000",
          solde: "-180,000",
        },
        {
          accountNumber: "771",
          account: "Produits financiers",
          debits: "0",
          credits: "45,000",
          solde: "-45,000",
        },
      ];

      // Use setBalance to properly calculate totals
      get().setBalance(sampleBalance);

      // Save to localStorage
      const exerciceId = localStorage.getItem("currentExerciceId");
      if (exerciceId) {
        localStorage.setItem(
          `balance_${exerciceId}`,
          JSON.stringify(sampleBalance)
        );
      }
    },
  }))
);

// Selector hooks for performance
export const useBalanceData = () =>
  useBalanceStore((state: BalanceStore) => state.balance);
export const useBalanceLastUpdated = () =>
  useBalanceStore((state: BalanceStore) => state.lastUpdated);
export const useBalanceIsSaving = () =>
  useBalanceStore((state: BalanceStore) => state.isSaving);
export const useFinancialTotals = () =>
  useBalanceStore((state: BalanceStore) => state._financialTotals);
