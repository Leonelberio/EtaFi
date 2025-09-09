import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";

// Default Canadian chart of accounts structure
const DEFAULT_ACCOUNTS = [
  // ASSETS (1000-1999)
  {
    number: "1000",
    name: "Caisse",
    type: "ASSET",
    description: "Argent en caisse",
  },
  {
    number: "1010",
    name: "Banque - Compte courant",
    type: "ASSET",
    description: "Compte bancaire principal",
  },
  {
    number: "1020",
    name: "Banque - Épargne",
    type: "ASSET",
    description: "Compte d'épargne",
  },
  {
    number: "1100",
    name: "Comptes clients",
    type: "ASSET",
    description: "Créances clients",
  },
  {
    number: "1200",
    name: "Stocks - Matières premières",
    type: "ASSET",
    description: "Inventaire matières premières",
  },
  {
    number: "1210",
    name: "Stocks - Produits finis",
    type: "ASSET",
    description: "Inventaire produits finis",
  },
  {
    number: "1500",
    name: "Équipements",
    type: "ASSET",
    description: "Équipements et outillage",
  },
  {
    number: "1510",
    name: "Véhicules",
    type: "ASSET",
    description: "Parc automobile",
  },
  {
    number: "1520",
    name: "Mobilier et agencement",
    type: "ASSET",
    description: "Mobilier de bureau",
  },
  {
    number: "1600",
    name: "Amortissement - Équipements",
    type: "ASSET",
    description: "Amortissement cumulé équipements",
  },
  {
    number: "1610",
    name: "Amortissement - Véhicules",
    type: "ASSET",
    description: "Amortissement cumulé véhicules",
  },

  // LIABILITIES (2000-2999)
  {
    number: "2000",
    name: "Comptes fournisseurs",
    type: "LIABILITY",
    description: "Dettes fournisseurs",
  },
  {
    number: "2100",
    name: "Emprunts bancaires",
    type: "LIABILITY",
    description: "Prêts bancaires",
  },
  {
    number: "2200",
    name: "Charges à payer",
    type: "LIABILITY",
    description: "Charges courus non payées",
  },
  {
    number: "2300",
    name: "GST/HST à payer",
    type: "LIABILITY",
    description: "Taxes de vente à remettre",
  },
  {
    number: "2310",
    name: "QST à payer",
    type: "LIABILITY",
    description: "Taxe provinciale Québec à remettre",
  },
  {
    number: "2400",
    name: "Salaires à payer",
    type: "LIABILITY",
    description: "Salaires courus",
  },
  {
    number: "2410",
    name: "Charges sociales à payer",
    type: "LIABILITY",
    description: "Cotisations employeur",
  },

  // EQUITY (3000-3999)
  {
    number: "3000",
    name: "Capital social",
    type: "EQUITY",
    description: "Capital investi",
  },
  {
    number: "3100",
    name: "Bénéfices non répartis",
    type: "EQUITY",
    description: "Résultats accumulés",
  },
  {
    number: "3200",
    name: "Apports en capital",
    type: "EQUITY",
    description: "Apports supplémentaires",
  },

  // REVENUE (4000-4999)
  {
    number: "4000",
    name: "Ventes - Services",
    type: "REVENUE",
    description: "Revenus de services",
  },
  {
    number: "4010",
    name: "Ventes - Produits",
    type: "REVENUE",
    description: "Revenus de vente de produits",
  },
  {
    number: "4100",
    name: "Revenus d'intérêts",
    type: "REVENUE",
    description: "Intérêts reçus",
  },
  {
    number: "4200",
    name: "Autres revenus",
    type: "REVENUE",
    description: "Revenus divers",
  },
  {
    number: "4500",
    name: "Subventions",
    type: "REVENUE",
    description: "Subventions gouvernementales",
  },

  // EXPENSES (5000-5999) - Organized by cost groups
  // Material & Supplies (M)
  {
    number: "5000",
    name: "Matières premières",
    type: "EXPENSE",
    description: "Coût matières premières - Groupe M",
  },
  {
    number: "5010",
    name: "Fournitures de bureau",
    type: "EXPENSE",
    description: "Fournitures administratives - Groupe M",
  },
  {
    number: "5020",
    name: "Fournitures d'atelier",
    type: "EXPENSE",
    description: "Fournitures production - Groupe M",
  },
  {
    number: "5030",
    name: "Emballages",
    type: "EXPENSE",
    description: "Matériel d'emballage - Groupe M",
  },

  // Subcontracting & Services (S)
  {
    number: "5100",
    name: "Sous-traitance",
    type: "EXPENSE",
    description: "Services sous-traitants - Groupe S",
  },
  {
    number: "5110",
    name: "Services professionnels",
    type: "EXPENSE",
    description: "Consultants, avocats - Groupe S",
  },
  {
    number: "5120",
    name: "Services informatiques",
    type: "EXPENSE",
    description: "Support IT externe - Groupe S",
  },
  {
    number: "5130",
    name: "Transport et livraison",
    type: "EXPENSE",
    description: "Services transport - Groupe S",
  },

  // Miscellaneous & General (D)
  {
    number: "5200",
    name: "Frais de bureau",
    type: "EXPENSE",
    description: "Frais administratifs - Groupe D",
  },
  {
    number: "5210",
    name: "Télécommunications",
    type: "EXPENSE",
    description: "Téléphone, internet - Groupe D",
  },
  {
    number: "5220",
    name: "Frais de déplacement",
    type: "EXPENSE",
    description: "Voyages d'affaires - Groupe D",
  },
  {
    number: "5230",
    name: "Formation",
    type: "EXPENSE",
    description: "Formation du personnel - Groupe D",
  },
  {
    number: "5240",
    name: "Publicité et marketing",
    type: "EXPENSE",
    description: "Promotion - Groupe D",
  },
  {
    number: "5250",
    name: "Assurances",
    type: "EXPENSE",
    description: "Primes d'assurance - Groupe D",
  },

  // Equipment & Tools (E)
  {
    number: "5300",
    name: "Location d'équipements",
    type: "EXPENSE",
    description: "Location matériel - Groupe E",
  },
  {
    number: "5310",
    name: "Maintenance équipements",
    type: "EXPENSE",
    description: "Réparations - Groupe E",
  },
  {
    number: "5320",
    name: "Outillage",
    type: "EXPENSE",
    description: "Outils consommables - Groupe E",
  },
  {
    number: "5330",
    name: "Carburant",
    type: "EXPENSE",
    description: "Essence véhicules - Groupe E",
  },

  // Direct Labor (MOD)
  {
    number: "5400",
    name: "Salaires directs",
    type: "EXPENSE",
    description: "Salaires production - Groupe MOD",
  },
  {
    number: "5410",
    name: "Charges sociales directes",
    type: "EXPENSE",
    description: "Cotisations sur salaires directs - Groupe MOD",
  },
  {
    number: "5420",
    name: "Heures supplémentaires",
    type: "EXPENSE",
    description: "Temps supplémentaire - Groupe MOD",
  },
  {
    number: "5430",
    name: "Prime de rendement",
    type: "EXPENSE",
    description: "Bonus production - Groupe MOD",
  },

  // Other Operating Expenses
  {
    number: "5500",
    name: "Loyer",
    type: "EXPENSE",
    description: "Location locaux",
  },
  {
    number: "5510",
    name: "Électricité",
    type: "EXPENSE",
    description: "Factures électricité",
  },
  {
    number: "5520",
    name: "Chauffage",
    type: "EXPENSE",
    description: "Frais de chauffage",
  },
  {
    number: "5600",
    name: "Amortissement",
    type: "EXPENSE",
    description: "Dotation aux amortissements",
  },
  {
    number: "5700",
    name: "Intérêts sur emprunts",
    type: "EXPENSE",
    description: "Charges financières",
  },

  // TAX ACCOUNTS (9000-9999)
  {
    number: "9000",
    name: "GST/HST payée",
    type: "TAX",
    description: "Taxes de vente payées sur achats",
  },
  {
    number: "9010",
    name: "QST payée",
    type: "TAX",
    description: "Taxe provinciale payée sur achats",
  },
  {
    number: "9100",
    name: "GST/HST perçue",
    type: "TAX",
    description: "Taxes de vente perçues sur ventes",
  },
  {
    number: "9110",
    name: "QST perçue",
    type: "TAX",
    description: "Taxe provinciale perçue sur ventes",
  },
] as const;

// POST /api/chart-accounts/init-defaults - Initialize default chart of accounts
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if accounts already exist
    const existingCount = await db.chartAccount.count({
      where: { organizationId },
    });

    if (existingCount > 0) {
      return NextResponse.json(
        {
          message: "Chart of accounts already exists",
          existingCount,
        },
        { status: 200 }
      );
    }

    // Create default accounts
    const createdAccounts = [];

    for (const accountData of DEFAULT_ACCOUNTS) {
      const account = await db.chartAccount.create({
        data: {
          organizationId,
          number: accountData.number,
          name: accountData.name,
          type: accountData.type,
          description: accountData.description,
          isActive: true,
          isSystem: true,
          allowManualEntries: true,
          requireProjectAllocation: accountData.type === "EXPENSE",
        },
      });
      createdAccounts.push(account);
    }

    return NextResponse.json(
      {
        message: "Default chart of accounts created successfully",
        accountsCreated: createdAccounts.length,
        accounts: createdAccounts,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating default chart of accounts:", error);
    return NextResponse.json(
      { error: "Failed to create default chart of accounts" },
      { status: 500 }
    );
  }
}
