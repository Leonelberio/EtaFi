// Utility function to determine if an account is a cost account
export function isCostAccount(accountType: string): boolean {
  return accountType === "EXPENSE";
}

// Utility function to get cost type options
export const COST_TYPE_OPTIONS = [
  { value: "FIXED", label: "Fixed Cost" },
  { value: "VARIABLE", label: "Variable Cost" },
] as const;

// Utility function to get cost category options
export const COST_CATEGORY_OPTIONS = [
  { value: "ADMINISTRATIVE", label: "Administrative" },
  { value: "CONTRACTUAL", label: "Contractual" },
  { value: "CLIENT_EXTRA", label: "Client Extra (Rechargeable)" },
  { value: "SUBCONTRACTOR_EXTRA", label: "Subcontractor Extra (Rechargeable)" },
] as const;
