import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding project templates...");

  // Get the first organization
  const organization = await prisma.organization.findFirst();
  if (!organization) {
    console.error(
      "❌ No organization found. Please run the main seed script first."
    );
    return;
  }

  // Get the first user for createdBy
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("❌ No user found. Please create a user first.");
    return;
  }

  // Sample project templates
  const templates = [
    {
      name: "Résidence Unifamiliale - Standard",
      description:
        "Template pour construction de résidence unifamiliale de 2 étages avec garage",
      category: "Construction",
      industry: "Residential",
      totalBudget: 450000.0,
      currency: "CAD",
      isPublic: true,
      isActive: true,
      activities: [
        {
          code: "01010",
          name: "Excavation et Fondations",
          description: "Excavation, coffrage et coulage des fondations",
          budgetAmount: 45000.0,
          budgetM: 15000.0,
          budgetS: 20000.0,
          budgetD: 5000.0,
          budgetE: 3000.0,
          budgetMOD: 2000.0,
          isActive: true,
          sortOrder: 1,
          subActivities: [
            {
              code: "01010-01",
              name: "Planification et Permis",
              description: "Obtention des permis et planification des travaux",
              budgetAmount: 5000.0,
              budgetM: 1000.0,
              budgetS: 2000.0,
              budgetD: 1000.0,
              budgetE: 500.0,
              budgetMOD: 500.0,
              isActive: true,
              sortOrder: 1,
            },
            {
              code: "01010-02",
              name: "Excavation",
              description: "Excavation du terrain et préparation",
              budgetAmount: 25000.0,
              budgetM: 5000.0,
              budgetS: 15000.0,
              budgetD: 2000.0,
              budgetE: 2000.0,
              budgetMOD: 1000.0,
              isActive: true,
              sortOrder: 2,
            },
            {
              code: "01010-03",
              name: "Coffrage et Béton",
              description: "Coffrage et coulage des fondations",
              budgetAmount: 15000.0,
              budgetM: 9000.0,
              budgetS: 3000.0,
              budgetD: 2000.0,
              budgetE: 500.0,
              budgetMOD: 500.0,
              isActive: true,
              sortOrder: 3,
            },
          ],
        },
        {
          code: "01135",
          name: "Structure en Bois",
          description: "Construction de la charpente et structure en bois",
          budgetAmount: 85000.0,
          budgetM: 50000.0,
          budgetS: 25000.0,
          budgetD: 5000.0,
          budgetE: 2000.0,
          budgetMOD: 3000.0,
          isActive: true,
          sortOrder: 2,
          subActivities: [
            {
              code: "01135-01",
              name: "Charpente Principale",
              description: "Construction de la charpente principale",
              budgetAmount: 60000.0,
              budgetM: 35000.0,
              budgetS: 15000.0,
              budgetD: 5000.0,
              budgetE: 2000.0,
              budgetMOD: 3000.0,
              isActive: true,
              sortOrder: 1,
            },
            {
              code: "01135-02",
              name: "Toiture Structurelle",
              description: "Structure de la toiture",
              budgetAmount: 25000.0,
              budgetM: 15000.0,
              budgetS: 10000.0,
              budgetD: 0.0,
              budgetE: 0.0,
              budgetMOD: 0.0,
              isActive: true,
              sortOrder: 2,
            },
          ],
        },
        {
          code: "01220",
          name: "Toiture et Revêtement",
          description: "Installation de la toiture et revêtement extérieur",
          budgetAmount: 65000.0,
          budgetM: 40000.0,
          budgetS: 20000.0,
          budgetD: 3000.0,
          budgetE: 1000.0,
          budgetMOD: 1000.0,
          isActive: true,
          sortOrder: 3,
        },
        {
          code: "01300",
          name: "Plomberie et Électricité",
          description: "Installation des systèmes de plomberie et électriques",
          budgetAmount: 55000.0,
          budgetM: 30000.0,
          budgetS: 20000.0,
          budgetD: 3000.0,
          budgetE: 1000.0,
          budgetMOD: 1000.0,
          isActive: true,
          sortOrder: 4,
        },
        {
          code: "01400",
          name: "Finition Intérieure",
          description: "Plâtrage, peinture, planchers et finitions",
          budgetAmount: 75000.0,
          budgetM: 40000.0,
          budgetS: 25000.0,
          budgetD: 5000.0,
          budgetE: 2000.0,
          budgetMOD: 3000.0,
          isActive: true,
          sortOrder: 5,
        },
      ],
    },
    {
      name: "Rénovation Commerciale - Bureau",
      description: "Template pour rénovation complète de bureau commercial",
      category: "Renovation",
      industry: "Commercial",
      totalBudget: 125000.0,
      currency: "CAD",
      isPublic: true,
      isActive: true,
      activities: [
        {
          code: "02010",
          name: "Démolition et Préparation",
          description:
            "Démolition des éléments existants et préparation des lieux",
          budgetAmount: 15000.0,
          budgetM: 5000.0,
          budgetS: 8000.0,
          budgetD: 1500.0,
          budgetE: 500.0,
          budgetMOD: 1000.0,
          isActive: true,
          sortOrder: 1,
        },
        {
          code: "02100",
          name: "Cloisons et Plafonds",
          description:
            "Installation de nouvelles cloisons et plafonds suspendus",
          budgetAmount: 25000.0,
          budgetM: 15000.0,
          budgetS: 8000.0,
          budgetD: 1000.0,
          budgetE: 500.0,
          budgetMOD: 500.0,
          isActive: true,
          sortOrder: 2,
        },
        {
          code: "02200",
          name: "Électricité et Télécommunications",
          description:
            "Installation des systèmes électriques et de télécommunications",
          budgetAmount: 20000.0,
          budgetM: 12000.0,
          budgetS: 6000.0,
          budgetD: 1000.0,
          budgetE: 500.0,
          budgetMOD: 500.0,
          isActive: true,
          sortOrder: 3,
        },
        {
          code: "02300",
          name: "Plomberie et HVAC",
          description:
            "Installation des systèmes de plomberie et de climatisation",
          budgetAmount: 18000.0,
          budgetM: 10000.0,
          budgetS: 6000.0,
          budgetD: 1000.0,
          budgetE: 500.0,
          budgetMOD: 500.0,
          isActive: true,
          sortOrder: 4,
        },
        {
          code: "02400",
          name: "Finition et Aménagement",
          description: "Peinture, planchers, mobilier et finitions finales",
          budgetAmount: 32000.0,
          budgetM: 20000.0,
          budgetS: 8000.0,
          budgetD: 2000.0,
          budgetE: 1000.0,
          budgetMOD: 1000.0,
          isActive: true,
          sortOrder: 5,
        },
      ],
    },
    {
      name: "Maintenance Industrielle - Standard",
      description:
        "Template pour maintenance préventive et corrective d'équipements industriels",
      category: "Maintenance",
      industry: "Industrial",
      totalBudget: 75000.0,
      currency: "CAD",
      isPublic: true,
      isActive: true,
      activities: [
        {
          code: "03010",
          name: "Inspection et Diagnostic",
          description: "Inspection complète et diagnostic des équipements",
          budgetAmount: 15000.0,
          budgetM: 2000.0,
          budgetS: 8000.0,
          budgetD: 2000.0,
          budgetE: 1000.0,
          budgetMOD: 2000.0,
          isActive: true,
          sortOrder: 1,
        },
        {
          code: "03020",
          name: "Réparation et Remplacement",
          description: "Réparation et remplacement des pièces défectueuses",
          budgetAmount: 35000.0,
          budgetM: 20000.0,
          budgetS: 10000.0,
          budgetD: 3000.0,
          budgetE: 1000.0,
          budgetMOD: 1000.0,
          isActive: true,
          sortOrder: 2,
        },
        {
          code: "03030",
          name: "Calibrage et Tests",
          description: "Calibrage des équipements et tests de fonctionnement",
          budgetAmount: 15000.0,
          budgetM: 5000.0,
          budgetS: 5000.0,
          budgetD: 2000.0,
          budgetE: 2000.0,
          budgetMOD: 1000.0,
          isActive: true,
          sortOrder: 3,
        },
        {
          code: "03040",
          name: "Documentation et Formation",
          description: "Documentation des travaux et formation du personnel",
          budgetAmount: 10000.0,
          budgetM: 1000.0,
          budgetS: 5000.0,
          budgetD: 2000.0,
          budgetE: 1000.0,
          budgetMOD: 1000.0,
          isActive: true,
          sortOrder: 4,
        },
      ],
    },
  ];

  // Create templates
  for (const templateData of templates) {
    try {
      const template = await prisma.projectTemplate.create({
        data: {
          organizationId: organization.id,
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          industry: templateData.industry,
          totalBudget: templateData.totalBudget,
          currency: templateData.currency,
          isPublic: templateData.isPublic,
          isActive: templateData.isActive,
          createdById: user.id,
        },
      });

      console.log(`✅ Created template: ${template.name}`);

      // Create template activities
      for (const activityData of templateData.activities) {
        const templateActivity = await prisma.templateActivity.create({
          data: {
            templateId: template.id,
            code: activityData.code,
            name: activityData.name,
            description: activityData.description,
            budgetAmount: activityData.budgetAmount,
            budgetM: activityData.budgetM,
            budgetS: activityData.budgetS,
            budgetD: activityData.budgetD,
            budgetE: activityData.budgetE,
            budgetMOD: activityData.budgetMOD,
            isActive: activityData.isActive,
            sortOrder: activityData.sortOrder,
          },
        });

        console.log(
          `  ✅ Created activity: ${templateActivity.code} - ${templateActivity.name}`
        );

        // Create template sub-activities
        if (activityData.subActivities) {
          for (const subActivityData of activityData.subActivities) {
            const templateSubActivity = await prisma.templateSubActivity.create(
              {
                data: {
                  templateId: template.id,
                  activityId: templateActivity.id,
                  code: subActivityData.code,
                  name: subActivityData.name,
                  description: subActivityData.description,
                  budgetAmount: subActivityData.budgetAmount,
                  budgetM: subActivityData.budgetM,
                  budgetS: subActivityData.budgetS,
                  budgetD: subActivityData.budgetD,
                  budgetE: subActivityData.budgetE,
                  budgetMOD: subActivityData.budgetMOD,
                  isActive: subActivityData.isActive,
                  sortOrder: subActivityData.sortOrder,
                },
              }
            );

            console.log(
              `    ✅ Created sub-activity: ${templateSubActivity.code} - ${templateSubActivity.name}`
            );
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error creating template ${templateData.name}:`, error);
    }
  }

  console.log("\n🎉 Successfully seeded project templates!");
  console.log(`📊 Summary:`);
  console.log(`  - ${templates.length} Templates created`);
  console.log(
    `  - ${templates.reduce((sum, t) => sum + t.activities.length, 0)} Activities created`
  );
  console.log(
    `  - ${templates.reduce((sum, t) => sum + t.activities.reduce((subSum, a) => subSum + (a.subActivities?.length || 0), 0), 0)} Sub-activities created`
  );
  console.log(
    `  - Total budget: $${templates.reduce((sum, t) => sum + t.totalBudget, 0).toLocaleString("en-CA")} CAD`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
