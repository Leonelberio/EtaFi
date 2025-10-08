// Utility function to determine if an account is a cost account
export function isCostAccount(accountType: string): boolean {
  return accountType === "EXPENSE";
}

// Utility function to get cost type options
export const COST_TYPE_OPTIONS = [
  { value: "FIXED", label: "Coût fixe" },
  { value: "VARIABLE", label: "Coût variable" },
] as const;

// Utility function to get cost category options
export const COST_CATEGORY_OPTIONS = [
  { value: "ADMINISTRATIVE", label: "Administratif" },
  { value: "CONTRACTUAL", label: "Contractuel" },
  { value: "CLIENT_EXTRA", label: "Suppl. rechargeable client" },
  { value: "SUBCONTRACTOR_EXTRA", label: "Suppl. rechargeable sous-traitant" },
] as const;
