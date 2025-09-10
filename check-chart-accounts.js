const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkChartAccounts() {
  try {
    // Get the organization ID for "New Test User's Organization"
    const org = await prisma.organization.findFirst({
      where: {
        name: "New Test User's Organization"
      }
    });

    if (!org) {
      console.log("Organization not found");
      return;
    }

    console.log("Organization ID:", org.id);

    // Check existing chart accounts
    const accounts = await prisma.chartAccount.findMany({
      where: {
        organizationId: org.id
      }
    });

    console.log("Existing chart accounts:", accounts.length);
    
    if (accounts.length > 0) {
      console.log("First few accounts:");
      accounts.slice(0, 5).forEach(acc => {
        console.log(`- ${acc.number}: ${acc.name} (${acc.type})`);
      });
    } else {
      console.log("No chart accounts found. Initializing...");
      
      // Initialize default accounts
      const DEFAULT_ACCOUNTS = [
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
          number: "5000",
          name: "Matières premières",
          type: "EXPENSE",
          description: "Coût matières premières - Groupe M",
        },
        {
          number: "5100",
          name: "Sous-traitance",
          type: "EXPENSE",
          description: "Services sous-traitants - Groupe S",
        },
        {
          number: "5400",
          name: "Salaires directs",
          type: "EXPENSE",
          description: "Salaires production - Groupe MOD",
        }
      ];

      for (const accountData of DEFAULT_ACCOUNTS) {
        await prisma.chartAccount.create({
          data: {
            organizationId: org.id,
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
      }

      console.log("Default chart accounts created successfully!");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChartAccounts();
