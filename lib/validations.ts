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

  // 🆕 MOD Hours tracking
  budgetMODHours: z.number().min(0).optional(), // Heures MOD budgétées
  actualMODHours: z.number().min(0).optional(), // Heures MOD réelles

  // 🆕 Cost type classification
  costType: z.enum(["FIXED", "VARIABLE"]).optional().default("FIXED"),

  // 🆕 Cost category classification
  costCategory: z
    .enum(["CONTRACTUAL", "CLIENT_EXTRA", "SUBCONTRACTOR_EXTRA"])
    .optional()
    .default("CONTRACTUAL"),

  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

// Schéma pour les sous-activités dans le formulaire
export const subActivityFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  estimatedHours: z.number().min(0).default(0),
  estimatedCost: z.number().min(0).default(0),
});

// Schéma étendu pour les activités avec sous-activités
export const activityWithSubActivitiesSchema = activitySchema.extend({
  subActivities: z.array(subActivityFormSchema).optional().default([]),
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

  // 🆕 MOD Hours tracking
  budgetMODHours: z.number().min(0).optional(), // Heures MOD budgétées
  actualMODHours: z.number().min(0).optional(), // Heures MOD réelles

  // 🆕 Cost type classification
  costType: z.enum(["FIXED", "VARIABLE"]).optional().default("FIXED"),

  // 🆕 Cost category classification
  costCategory: z
    .enum(["CONTRACTUAL", "CLIENT_EXTRA", "SUBCONTRACTOR_EXTRA"])
    .optional()
    .default("CONTRACTUAL"),

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
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  payableAccountId: z.string().optional(),
});

// Schéma pour la création d'un client
export const customerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  receivableAccountId: z.string().optional(),
});

// Journal Entry Schemas
export const journalLineSchema = z
  .object({
    accountId: z.string().min(1, "Account is required"),
    description: z.string().min(1, "Description is required"),
    debitAmount: z.number().min(0).optional(),
    creditAmount: z.number().min(0).optional(),
    projectId: z.string().optional(),
    activityId: z.string().optional(),
    subActivityId: z.string().optional(),
    costGroup: z.string().optional(),
    taxCodeId: z.string().optional(),
    reference: z.string().optional(),
    // 🆕 Cost classification fields for NCECF compliance
    costType: z.enum(["FIXED", "VARIABLE"]).optional(),
    costCategory: z
      .enum([
        "ADMINISTRATIVE",
        "CONTRACTUAL",
        "CLIENT_EXTRA",
        "SUBCONTRACTOR_EXTRA",
      ])
      .optional(),
  })
  .refine(
    (data) => {
      // Must have either debit or credit, but not both
      const hasDebit = data.debitAmount !== undefined && data.debitAmount > 0;
      const hasCredit =
        data.creditAmount !== undefined && data.creditAmount > 0;
      return (hasDebit && !hasCredit) || (!hasDebit && hasCredit);
    },
    {
      message:
        "Each line must have either a debit or credit amount, but not both",
      path: ["debitAmount"],
    }
  );

// 🆕 Journal reversal schema for NCECF compliance
export const journalReversalSchema = z.object({
  reversalReason: z.string().min(1, "Reversal reason is required").max(500),
  reversalDate: z.string().min(1, "Reversal date is required"),
});

export const journalSchema = z
  .object({
    journalType: z.enum([
      "PURCHASE",
      "SALES",
      "CASH_RECEIPTS",
      "CASH_DISBURSEMENTS",
      "GENERAL",
    ]),
    entryDate: z.string().min(1, "Entry date is required"),
    reference: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    lines: z
      .array(journalLineSchema)
      .min(2, "At least 2 journal lines are required"),
  })
  .refine(
    (data) => {
      // Check that total debits equal total credits
      const totalDebits = data.lines.reduce(
        (sum, line) => sum + (line.debitAmount || 0),
        0
      );
      const totalCredits = data.lines.reduce(
        (sum, line) => sum + (line.creditAmount || 0),
        0
      );

      return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for rounding errors
    },
    {
      message: "Total debits must equal total credits",
      path: ["lines"],
    }
  );

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

// Project Template Schemas
export const projectTemplateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  industry: z.string().optional(),
  totalBudget: z.number().min(0).optional(),
  currency: z.string().default("CAD"),
  isPublic: z.boolean().default(false),
  isActive: z.boolean().default(true),
  activities: z
    .array(
      z.object({
        code: z.string().min(3).max(20),
        name: z.string().min(2).max(200),
        description: z.string().optional(),
        budgetAmount: z.number().min(0).optional(),
        budgetM: z.number().min(0).optional(),
        budgetS: z.number().min(0).optional(),
        budgetD: z.number().min(0).optional(),
        budgetE: z.number().min(0).optional(),
        budgetMOD: z.number().min(0).optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
        subActivities: z
          .array(
            z.object({
              code: z.string().min(3).max(20),
              name: z.string().min(2).max(200),
              description: z.string().optional(),
              budgetAmount: z.number().min(0).optional(),
              budgetM: z.number().min(0).optional(),
              budgetS: z.number().min(0).optional(),
              budgetD: z.number().min(0).optional(),
              budgetE: z.number().min(0).optional(),
              budgetMOD: z.number().min(0).optional(),
              isActive: z.boolean().default(true),
              sortOrder: z.number().default(0),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

export const applyTemplateSchema = z.object({
  projectCode: z.string().min(3).max(20),
  projectName: z.string().min(2).max(200),
  projectDescription: z.string().optional(),
  clientId: z.string().optional(),
  managerId: z.string().optional(),
  tempManagerId: z.string().optional(),
  tempManagerEnd: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalBudget: z.number().min(0).optional(),
  currency: z.string().default("CAD"),
  kind: z.enum(["BILLABLE", "ADMIN"]).default("BILLABLE"),
  status: z
    .enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .default("ACTIVE"),
});

// Budget Management Schemas
export const budgetSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  budgetAmount: z.number().min(0),
  currency: z.string().default("CAD"),
  budgetM: z.number().min(0).optional(),
  budgetS: z.number().min(0).optional(),
  budgetD: z.number().min(0).optional(),
  budgetE: z.number().min(0).optional(),
  budgetMOD: z.number().min(0).optional(),
  status: z.enum(["ACTIVE", "REVISED", "CLOSED"]).default("ACTIVE"),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectId: z.string().min(1),
  activityId: z.string().optional(),
  subActivityId: z.string().optional(),
});

export const budgetRevisionSchema = z.object({
  reason: z.string().min(2).max(200),
  description: z.string().optional(),
  newBudgetAmount: z.number().min(0),
  newBudgetM: z.number().min(0).optional(),
  newBudgetS: z.number().min(0).optional(),
  newBudgetD: z.number().min(0).optional(),
  newBudgetE: z.number().min(0).optional(),
  newBudgetMOD: z.number().min(0).optional(),
  budgetId: z.string().min(1),
});

export const budgetAlertSchema = z.object({
  type: z.enum(["OVERRUN", "WARNING", "APPROACHING_LIMIT"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  title: z.string().min(2).max(200),
  message: z.string().min(2).max(500),
  threshold: z.number().min(0).max(100).optional(),
  budgetId: z.string().min(1),
});

// 🆕 Schémas pour les nouveaux modèles

// Schéma pour les groupes de coûts d'activité
export const activityCostGroupSchema = z.object({
  costGroup: z.enum(["M", "S", "D", "E", "MOD"]),
  percentage: z.number().min(0).max(100),
  glAccountId: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

// Schéma pour l'assignation de codes GL par projet
export const projectCostGroupCodeSchema = z.object({
  costGroup: z.enum(["M", "S", "D", "E", "MOD"]),
  glAccountId: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
});

// Schéma pour les transferts de coûts
export const costTransferSchema = z
  .object({
    sourceType: z.enum(["PROJECT", "ACTIVITY", "SUB_ACTIVITY"]),
    sourceProjectId: z.string().optional(),
    sourceActivityId: z.string().optional(),
    sourceSubActivityId: z.string().optional(),

    targetType: z.enum(["PROJECT", "ACTIVITY", "SUB_ACTIVITY"]),
    targetProjectId: z.string().optional(),
    targetActivityId: z.string().optional(),
    targetSubActivityId: z.string().optional(),

    amount: z.number().min(0.01),
    costGroups: z.array(
      z.object({
        group: z.enum(["M", "S", "D", "E", "MOD"]),
        amount: z.number().min(0.01),
      })
    ),
    description: z.string().min(2).max(500),
    reference: z.string().optional(),
    approvalRequired: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      // Validation : source et target doivent être différents
      if (data.sourceType === data.targetType) {
        if (
          data.sourceType === "PROJECT" &&
          data.sourceProjectId === data.targetProjectId
        )
          return false;
        if (
          data.sourceType === "ACTIVITY" &&
          data.sourceActivityId === data.targetActivityId
        )
          return false;
        if (
          data.sourceType === "SUB_ACTIVITY" &&
          data.sourceSubActivityId === data.targetSubActivityId
        )
          return false;
      }
      return true;
    },
    { message: "Source and target must be different" }
  )
  .refine(
    (data) => {
      // Validation : montants des groupes = montant total
      const totalGroupAmount = data.costGroups.reduce(
        (sum, group) => sum + group.amount,
        0
      );
      return Math.abs(totalGroupAmount - data.amount) < 0.01;
    },
    { message: "Total of cost groups must equal transfer amount" }
  );

// Schéma pour l'activité mise à jour avec groupes multiples
export const enhancedActivitySchema = activitySchema.extend({
  costGroups: z.array(activityCostGroupSchema).optional(),
});

// Types TypeScript dérivés des schémas
export type ProjectTemplateInput = z.infer<typeof projectTemplateSchema>;
export type ApplyTemplateInput = z.infer<typeof applyTemplateSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type BudgetRevisionInput = z.infer<typeof budgetRevisionSchema>;
export type BudgetAlertInput = z.infer<typeof budgetAlertSchema>;

// 🆕 Nouveaux types
export type ActivityCostGroupInput = z.infer<typeof activityCostGroupSchema>;
export type ProjectCostGroupCodeInput = z.infer<
  typeof projectCostGroupCodeSchema
>;
export type CostTransferInput = z.infer<typeof costTransferSchema>;
export type EnhancedActivityInput = z.infer<typeof enhancedActivitySchema>;
