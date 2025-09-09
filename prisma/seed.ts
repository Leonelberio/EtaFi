import { PrismaClient } from "@prisma/client";
import { createActivity } from "../lib/activities";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Vérifier si l'organisation existe déjà
  let organization = await prisma.organization.findFirst({
    where: {
      name: "Organisation Test",
    },
  });

  if (!organization) {
    // Créer une organisation de test
    organization = await prisma.organization.create({
      data: {
        name: "Organisation Test",
        description: "Organisation de test pour le système de comptabilité",
        ownerId: "test-user-id", // À remplacer par un vrai user ID
      },
    });
    console.log("✅ Organisation créée:", organization.name);
  } else {
    console.log("✅ Organisation existante trouvée:", organization.name);
  }

  // Créer les comptes comptables de base
  const baseAccounts = [
    // Comptes de tiers
    { number: "401000", name: "Fournisseurs", type: "LIABILITY" },
    { number: "411000", name: "Clients", type: "ASSET" },

    // Comptes de TVA
    { number: "44566", name: "TVA déductible", type: "TAX" },
    { number: "44571", name: "TVA collectée", type: "TAX" },

    // Comptes de charges
    { number: "601000", name: "Achats de matières premières", type: "EXPENSE" },
    {
      number: "602000",
      name: "Achats d'autres approvisionnements",
      type: "EXPENSE",
    },
    {
      number: "603000",
      name: "Achats de fournitures d'entretien",
      type: "EXPENSE",
    },
    {
      number: "604000",
      name: "Achats de fournitures d'emballage",
      type: "EXPENSE",
    },
    {
      number: "605000",
      name: "Achats d'études et prestations de services",
      type: "EXPENSE",
    },
    {
      number: "606000",
      name: "Achats non stockés de matières et fournitures",
      type: "EXPENSE",
    },
    { number: "607000", name: "Achats de marchandises", type: "EXPENSE" },
    { number: "608000", name: "Frais accessoires d'achat", type: "EXPENSE" },
    {
      number: "609000",
      name: "Rabais, remises et ristournes obtenus sur achats",
      type: "EXPENSE",
    },

    // Comptes de produits
    { number: "701000", name: "Ventes de produits finis", type: "REVENUE" },
    { number: "702000", name: "Ventes de produits résiduels", type: "REVENUE" },
    { number: "703000", name: "Ventes de marchandises", type: "REVENUE" },
    { number: "704000", name: "Prestations de services", type: "REVENUE" },
    {
      number: "705000",
      name: "Produits des activités annexes",
      type: "REVENUE",
    },
    { number: "706000", name: "Produits financiers", type: "REVENUE" },
    { number: "707000", name: "Produits exceptionnels", type: "REVENUE" },

    // Comptes de trésorerie
    { number: "512000", name: "Banque", type: "ASSET" },
    { number: "530000", name: "Caisse", type: "ASSET" },
  ];

  for (const account of baseAccounts) {
    const existingAccount = await prisma.chartAccount.findFirst({
      where: {
        organizationId: organization.id,
        number: account.number,
      },
    });

    if (!existingAccount) {
      await prisma.chartAccount.create({
        data: {
          ...account,
          organizationId: organization.id,
        },
      });
    }
  }

  console.log("✅ Comptes comptables de base créés");

  // Créer des codes de taxe de base
  const baseTaxCodes = [
    {
      code: "TVA18",
      label: "TVA 18%",
      rate: 0.18,
      accountCollectedNumber: "44571",
      accountDeductibleNumber: "44566",
    },
    {
      code: "TVA20",
      label: "TVA 20%",
      rate: 0.2,
      accountCollectedNumber: "44571",
      accountDeductibleNumber: "44566",
    },
  ];

  for (const taxCode of baseTaxCodes) {
    const existingTaxCode = await prisma.taxCode.findFirst({
      where: {
        organizationId: organization.id,
        code: taxCode.code,
      },
    });

    if (!existingTaxCode) {
      const collected = await prisma.chartAccount.findFirst({
        where: {
          organizationId: organization.id,
          number: taxCode.accountCollectedNumber!,
        },
      });
      const deductible = await prisma.chartAccount.findFirst({
        where: {
          organizationId: organization.id,
          number: taxCode.accountDeductibleNumber!,
        },
      });

      await prisma.taxCode.create({
        data: {
          code: taxCode.code,
          name: taxCode.label,
          rate: taxCode.rate,
          organizationId: organization.id,
          // Note: TaxCode no longer stores collected/deductible account relations directly
          // Link via ChartAccount.defaultTaxCodeId if needed elsewhere
        },
      });
    }
  }

  console.log("✅ Codes de taxe de base créés");

  // S'assurer d'avoir un projet par défaut pour y rattacher les activités
  let defaultProject = await prisma.project.findFirst({
    where: { organizationId: organization.id, name: "Projet Administratif" },
  });

  if (!defaultProject) {
    defaultProject = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: "Projet Administratif",
        code: "PRJ-ADMIN",
        kind: "ADMIN",
      },
    });
  }

  // Créer des activités de base
  const baseActivities = [
    "Administration générale",
    "Commercial",
    "Production",
    "Maintenance",
    "Formation",
    "Consulting",
  ];

  for (const activityName of baseActivities) {
    const existingActivity = await prisma.activity.findFirst({
      where: {
        organizationId: organization.id,
        name: activityName,
      },
    });

    if (!existingActivity) {
      await createActivity({
        name: activityName,
        organizationId: organization.id,
        projectId: defaultProject.id,
      });
    }
  }

  console.log("✅ Activités de base créées");

  // Créer des projets de base
  const baseProjects = [
    { name: "Projet Administratif", kind: "ADMIN", code: "PRJ-ADMIN" },
    { name: "Projet Commercial", kind: "BILLABLE", code: "PRJ-COMM" },
  ];

  for (const project of baseProjects) {
    const existingProject = await prisma.project.findFirst({
      where: {
        organizationId: organization.id,
        name: project.name,
      },
    });

    if (!existingProject) {
      await prisma.project.create({
        data: {
          ...project,
          organizationId: organization.id,
        },
      });
    }
  }

  console.log("✅ Projets de base créés");

  // Créer des fournisseurs de base
  const baseVendors = [
    { name: "Fournisseur Général", accountNumber: "401000" },
    { name: "Fournisseur Services", accountNumber: "401000" },
  ];

  for (const vendor of baseVendors) {
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        organizationId: organization.id,
        name: vendor.name,
      },
    });

    if (!existingVendor) {
      const account = await prisma.chartAccount.findFirst({
        where: {
          organizationId: organization.id,
          number: vendor.accountNumber,
        },
      });

      if (account) {
        await prisma.vendor.create({
          data: {
            name: vendor.name,
            organizationId: organization.id,
            payableAccountId: account.id,
          },
        });
      }
    }
  }

  console.log("✅ Fournisseurs de base créés");

  // Créer des clients de base
  const baseCustomers = [
    { name: "Client Général", accountNumber: "411000" },
    { name: "Client Services", accountNumber: "411000" },
  ];

  for (const customer of baseCustomers) {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        organizationId: organization.id,
        name: customer.name,
      },
    });

    if (!existingCustomer) {
      const account = await prisma.chartAccount.findFirst({
        where: {
          organizationId: organization.id,
          number: customer.accountNumber,
        },
      });

      if (account) {
        await prisma.customer.create({
          data: {
            name: customer.name,
            organizationId: organization.id,
            receivableAccountId: account.id,
          },
        });
      }
    }
  }

  console.log("✅ Clients de base créés");

  // Le mapping des comptes par groupe est géré en mémoire dans lib/posting.ts
  console.log(
    "ℹ️  Mapping des comptes par groupe géré côté code (pas en base)"
  );

  console.log("🎉 Seed terminé avec succès!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
