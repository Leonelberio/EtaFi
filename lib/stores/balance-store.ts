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

        // SYSCOHADA Balance Sheet Classification
        // ACTIF = Assets with debit normal balance (positive solde)
        if (
          // Class 2: Immobilisations (Fixed Assets) - BRUT values
          (accountNum.startsWith("2") && !accountNum.startsWith("28")) || // Exclude depreciation (28x)
          // Class 3: Stocks (Inventory)
          accountNum.startsWith("3") ||
          // Class 4: Créances (Receivables) - only asset accounts
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("41") || // Clients
              accountNum.startsWith("42") || // Personnel débiteur
              accountNum.startsWith("43") || // État débiteur
              accountNum.startsWith("44") || // État débiteur
              accountNum.startsWith("45") || // Groupe et associés débiteurs
              accountNum.startsWith("46") || // Débiteurs divers
              accountNum.startsWith("47") || // Comptes transitoires actif
              accountNum.startsWith("48"))) || // Charges constatées d'avance
          // Class 5: Trésorerie Actif (Cash and banks)
          (accountNum.startsWith("5") &&
            (accountNum.startsWith("51") || // Valeurs à encaisser
              accountNum.startsWith("52") || // Banques
              accountNum.startsWith("53") || // Établissements financiers et assimilés
              accountNum.startsWith("54") || // Instruments de trésorerie
              accountNum.startsWith("58"))) // Virements internes
        ) {
          totalActif += Math.abs(solde);
        }

        // PASSIF = Liabilities and Equity with credit normal balance (negative solde)
        if (
          // Class 1: Ressources durables (Equity and Long-term liabilities)
          accountNum.startsWith("1") ||
          // Class 2: Amortissements (Accumulated Depreciation) - contra-asset
          accountNum.startsWith("28") ||
          // Class 4: Dettes (Payables) - only liability accounts
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("40") || // Fournisseurs et comptes rattachés
              accountNum.startsWith("49"))) || // Provisions pour dépréciation
          // Class 5: Trésorerie Passif (Bank overdrafts)
          (accountNum.startsWith("5") &&
            (accountNum.startsWith("50") || // Provisions pour risques et charges
              accountNum.startsWith("55") || // Caisse et régies d'avance créditeurs
              accountNum.startsWith("56") || // Banques créditrices
              accountNum.startsWith("57"))) // Virements internes créditeurs
        ) {
          totalPassif += Math.abs(solde);
        }

        // Calculate net result (Class 7 - Class 6) - for P&L summary
        if (accountNum.startsWith("7")) {
          resultatNet += Math.abs(solde);
        } else if (accountNum.startsWith("6")) {
          resultatNet -= Math.abs(solde);
        }

        // Calculate cash flow (Class 5 - treasury accounts only)
        if (
          accountNum.startsWith("51") ||
          accountNum.startsWith("52") ||
          accountNum.startsWith("53")
        ) {
          fluxTresorerie += Math.abs(solde);
        }
      });

      return { totalActif, totalPassif, resultatNet, fluxTresorerie };
    },

    setBalance: (balance: BalanceData[]) => {
      // Calculate totals with the new balance using corrected SYSCOHADA classification
      let totalActif = 0;
      let totalPassif = 0;
      let resultatNet = 0;
      let fluxTresorerie = 0;

      balance.forEach((row: BalanceData) => {
        const solde = parseFloat(row.solde.replace(/[^0-9.-]/g, "")) || 0;
        const accountNum = row.accountNumber;

        // SYSCOHADA Balance Sheet Classification - ACTIF
        if (
          // Class 2: Immobilisations (Fixed Assets) - BRUT values
          (accountNum.startsWith("2") && !accountNum.startsWith("28")) || // Exclude depreciation (28x)
          // Class 3: Stocks (Inventory)
          accountNum.startsWith("3") ||
          // Class 4: Créances (Receivables) - only asset accounts
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("41") || // Clients
              accountNum.startsWith("42") || // Personnel débiteur
              accountNum.startsWith("43") || // État débiteur
              accountNum.startsWith("44") || // État débiteur
              accountNum.startsWith("45") || // Groupe et associés débiteurs
              accountNum.startsWith("46") || // Débiteurs divers
              accountNum.startsWith("47") || // Comptes transitoires actif
              accountNum.startsWith("48"))) || // Charges constatées d'avance
          // Class 5: Trésorerie Actif (Cash and banks)
          (accountNum.startsWith("5") &&
            (accountNum.startsWith("51") || // Valeurs à encaisser
              accountNum.startsWith("52") || // Banques
              accountNum.startsWith("53") || // Établissements financiers et assimilés
              accountNum.startsWith("54") || // Instruments de trésorerie
              accountNum.startsWith("58"))) // Virements internes
        ) {
          totalActif += Math.abs(solde);
        }

        // SYSCOHADA Balance Sheet Classification - PASSIF
        if (
          // Class 1: Ressources durables (Equity and Long-term liabilities)
          accountNum.startsWith("1") ||
          // Class 2: Amortissements (Accumulated Depreciation) - contra-asset
          accountNum.startsWith("28") ||
          // Class 4: Dettes (Payables) - only liability accounts
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("40") || // Fournisseurs et comptes rattachés
              accountNum.startsWith("49"))) || // Provisions pour dépréciation
          // Class 5: Trésorerie Passif (Bank overdrafts)
          (accountNum.startsWith("5") &&
            (accountNum.startsWith("50") || // Provisions pour risques et charges
              accountNum.startsWith("55") || // Caisse et régies d'avance créditeurs
              accountNum.startsWith("56") || // Banques créditrices
              accountNum.startsWith("57"))) // Virements internes créditeurs
        ) {
          totalPassif += Math.abs(solde);
        }

        // Calculate net result (Class 7 - Class 6) - for P&L summary
        if (accountNum.startsWith("7")) {
          resultatNet += Math.abs(solde);
        } else if (accountNum.startsWith("6")) {
          resultatNet -= Math.abs(solde);
        }

        // Calculate cash flow (Class 5 - treasury accounts only)
        if (
          accountNum.startsWith("51") ||
          accountNum.startsWith("52") ||
          accountNum.startsWith("53")
        ) {
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

        // SYSCOHADA Balance Sheet Classification - ACTIF
        if (
          // Class 2: Immobilisations (Fixed Assets) - BRUT values
          (accountNum.startsWith("2") && !accountNum.startsWith("28")) || // Exclude depreciation (28x)
          // Class 3: Stocks (Inventory)
          accountNum.startsWith("3") ||
          // Class 4: Créances (Receivables) - only asset accounts
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("41") || // Clients
              accountNum.startsWith("42") || // Personnel débiteur
              accountNum.startsWith("43") || // État débiteur
              accountNum.startsWith("44") || // État débiteur
              accountNum.startsWith("45") || // Groupe et associés débiteurs
              accountNum.startsWith("46") || // Débiteurs divers
              accountNum.startsWith("47") || // Comptes transitoires actif
              accountNum.startsWith("48"))) || // Charges constatées d'avance
          // Class 5: Trésorerie Actif (Cash and banks)
          (accountNum.startsWith("5") &&
            (accountNum.startsWith("51") || // Valeurs à encaisser
              accountNum.startsWith("52") || // Banques
              accountNum.startsWith("53") || // Établissements financiers et assimilés
              accountNum.startsWith("54") || // Instruments de trésorerie
              accountNum.startsWith("58"))) // Virements internes
        ) {
          totalActif += Math.abs(solde);
        }

        // SYSCOHADA Balance Sheet Classification - PASSIF
        if (
          // Class 1: Ressources durables (Equity and Long-term liabilities)
          accountNum.startsWith("1") ||
          // Class 2: Amortissements (Accumulated Depreciation) - contra-asset
          accountNum.startsWith("28") ||
          // Class 4: Dettes (Payables) - only liability accounts
          (accountNum.startsWith("4") &&
            (accountNum.startsWith("40") || // Fournisseurs et comptes rattachés
              accountNum.startsWith("49"))) || // Provisions pour dépréciation
          // Class 5: Trésorerie Passif (Bank overdrafts)
          (accountNum.startsWith("5") &&
            (accountNum.startsWith("50") || // Provisions pour risques et charges
              accountNum.startsWith("55") || // Caisse et régies d'avance créditeurs
              accountNum.startsWith("56") || // Banques créditrices
              accountNum.startsWith("57"))) // Virements internes créditeurs
        ) {
          totalPassif += Math.abs(solde);
        }

        // Calculate net result (Class 7 - Class 6) - for P&L summary
        if (accountNum.startsWith("7")) {
          resultatNet += Math.abs(solde);
        } else if (accountNum.startsWith("6")) {
          resultatNet -= Math.abs(solde);
        }

        // Calculate cash flow (Class 5 - treasury accounts only)
        if (
          accountNum.startsWith("51") ||
          accountNum.startsWith("52") ||
          accountNum.startsWith("53")
        ) {
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
