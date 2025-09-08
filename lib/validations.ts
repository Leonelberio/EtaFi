import { z } from "zod";

// Schéma pour la création d'un code de taxe
export const taxCodeSchema = z.object({
  code: z.string().min(2).max(20), // "GST", "QST", "HST"
  name: z.string().min(2).max(100), // "GST 5%", "QST 9.975%", "HST 13%"
  rate: z.number().min(0).max(1), // 0.05 pour 5%
  province: z.string().optional(), // Province for HST rates
  isActive: z.boolean().optional().default(true),
  isCompound: z.boolean().optional().default(false), // For compound taxes like QST on GST
  description: z.string().optional(),
});

// Schéma pour la création d'une activité de projet
export const activitySchema = z.object({
  code: z.string().min(3).max(20), // Activity code (e.g., "01010", "01135")
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  budgetAmount: z.number().min(0).optional(),

  // 5-group budget breakdown
  budgetM: z.number().min(0).optional(), // Matériel
  budgetS: z.number().min(0).optional(), // Sous-traitance
  budgetD: z.number().min(0).optional(), // Divers
  budgetE: z.number().min(0).optional(), // Équipement
  budgetMOD: z.number().min(0).optional(), // Main-d'œuvre

  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

// Schéma pour la création d'une sous-activité
export const subActivitySchema = z.object({
  code: z.string().min(3).max(20), // Sub-activity code (e.g., "01010-01")
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  budgetAmount: z.number().min(0).optional(),

  // 5-group budget breakdown
  budgetM: z.number().min(0).optional(),
  budgetS: z.number().min(0).optional(),
  budgetD: z.number().min(0).optional(),
  budgetE: z.number().min(0).optional(),
  budgetMOD: z.number().min(0).optional(),

  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

// Schéma pour la création d'un projet
export const projectSchema = z.object({
  name: z.string().min(2).max(100),
  kind: z.enum(["ADMIN", "BILLABLE"]),
});

// Schéma pour la création d'un fournisseur
export const vendorSchema = z.object({
  name: z.string().min(2).max(100),
  payableAccountNumber: z.string().min(3).max(10), // "401000"
});

// Schéma pour la création d'un client
export const customerSchema = z.object({
  name: z.string().min(2).max(100),
  receivableAccountNumber: z.string().min(3).max(10), // "411000"
});

// Schéma pour une ligne de facture
export const invoiceLineSchema = z.object({
  activityId: z.string().cuid(),
  groupCode: z.enum(["M", "S", "D", "E", "L", "R"]),
  description: z.string().min(1).max(200),
  amountHT: z.number().nonnegative(),
  taxCodeId: z.string().cuid().nullable().optional(),
});

// Schéma pour la création d'une facture
export const invoiceSchema = z.object({
  type: z.enum(["PURCHASE", "SALES"]),
  date: z.string(), // ISO
  ref: z.string().min(1).max(50),
  projectId: z.string().cuid().nullable().optional(),
  vendorId: z.string().cuid().nullable().optional(),
  customerId: z.string().cuid().nullable().optional(),
  currency: z.string().default("XOF"),
  lines: z.array(invoiceLineSchema).min(1),
});

// Schéma pour la création d'un compte comptable
export const chartAccountSchema = z.object({
  number: z.string().min(3).max(10), // "401000", "411000", "44571"
  name: z.string().min(2).max(100),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE", "TAX"]),
});

// Schéma pour le mapping de posting
export const postingMapSchema = z.object({
  type: z.enum(["PURCHASE", "SALES"]),
  groupCode: z.enum(["M", "S", "D", "E", "L", "R"]),
  accountNumber: z.string().min(3).max(10),
});

// Types TypeScript dérivés des schémas
export type TaxCodeInput = z.infer<typeof taxCodeSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type SubActivityInput = z.infer<typeof subActivitySchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>;
export type ChartAccountInput = z.infer<typeof chartAccountSchema>;
export type PostingMapInput = z.infer<typeof postingMapSchema>;
