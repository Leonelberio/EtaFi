import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding projects, activities, and sub-activities...");

  // Get the first organization
  const organization = await prisma.organization.findFirst();
  if (!organization) {
    console.error(
      "❌ No organization found. Please run the main seed script first."
    );
    return;
  }

  console.log(`📋 Using organization: ${organization.name}`);

  // Get the first customer for projects
  const customer = await prisma.customer.findFirst({
    where: { organizationId: organization.id },
  });

  if (!customer) {
    console.error("❌ No customer found. Please create a customer first.");
    return;
  }

  // Get the first user for project manager
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("❌ No user found. Please create a user first.");
    return;
  }

  // Create Project 1: Construction Project
  const project1 = await prisma.project.create({
    data: {
      organizationId: organization.id,
      code: "CONST-2024-001",
      name: "Résidence Unifamiliale - 123 Rue Principale",
      description:
        "Construction d'une résidence unifamiliale de 2 étages avec garage",
      clientId: customer.id,
      managerId: user.id,
      kind: "BILLABLE",
      status: "ACTIVE",
      totalBudget: 450000.0,
      currency: "CAD",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-12-31"),
    },
  });

  console.log(`✅ Created project: ${project1.name}`);

  // Create Project 2: Renovation Project
  const project2 = await prisma.project.create({
    data: {
      organizationId: organization.id,
      code: "RENO-2024-002",
      name: "Rénovation Commerciale - Bureau Avocats",
      description: "Rénovation complète d'un bureau d'avocats de 500m²",
      clientId: customer.id,
      managerId: user.id,
      kind: "BILLABLE",
      status: "ACTIVE",
      totalBudget: 125000.0,
      currency: "CAD",
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-08-31"),
    },
  });

  console.log(`✅ Created project: ${project2.name}`);

  // Project 1 Activities
  const activities1 = [
    {
      code: "01010",
      name: "Excavation et Fondations",
      description: "Excavation, coffrage et coulage des fondations",
      budgetAmount: 45000.0,
      budgetM: 15000.0, // Matériel
      budgetS: 20000.0, // Sous-traitance
      budgetD: 5000.0, // Divers
      budgetE: 3000.0, // Équipement
      budgetMOD: 2000.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 1,
    },
    {
      code: "01135",
      name: "Structure en Bois",
      description: "Construction de la charpente et structure en bois",
      budgetAmount: 85000.0,
      budgetM: 50000.0, // Matériel
      budgetS: 25000.0, // Sous-traitance
      budgetD: 5000.0, // Divers
      budgetE: 2000.0, // Équipement
      budgetMOD: 3000.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 2,
    },
    {
      code: "01220",
      name: "Toiture et Revêtement",
      description: "Installation de la toiture et revêtement extérieur",
      budgetAmount: 65000.0,
      budgetM: 40000.0, // Matériel
      budgetS: 20000.0, // Sous-traitance
      budgetD: 3000.0, // Divers
      budgetE: 1000.0, // Équipement
      budgetMOD: 1000.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 3,
    },
    {
      code: "01300",
      name: "Plomberie et Électricité",
      description: "Installation des systèmes de plomberie et électriques",
      budgetAmount: 55000.0,
      budgetM: 30000.0, // Matériel
      budgetS: 20000.0, // Sous-traitance
      budgetD: 3000.0, // Divers
      budgetE: 1000.0, // Équipement
      budgetMOD: 1000.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 4,
    },
    {
      code: "01400",
      name: "Finition Intérieure",
      description: "Plâtrage, peinture, planchers et finitions",
      budgetAmount: 75000.0,
      budgetM: 40000.0, // Matériel
      budgetS: 25000.0, // Sous-traitance
      budgetD: 5000.0, // Divers
      budgetE: 2000.0, // Équipement
      budgetMOD: 3000.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const activityData of activities1) {
    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        organizationId: organization.id,
        projectId: project1.id,
      },
    });
    console.log(`  ✅ Created activity: ${activity.code} - ${activity.name}`);

    // Create sub-activities for each main activity
    const subActivitiesData = [
      {
        code: `${activityData.code}-01`,
        name: `Planification - ${activityData.name}`,
        description: `Phase de planification et préparation pour ${activityData.name}`,
        budgetAmount: activityData.budgetAmount * 0.1, // 10% of main activity
        budgetM: activityData.budgetM * 0.1,
        budgetS: activityData.budgetS * 0.1,
        budgetD: activityData.budgetD * 0.1,
        budgetE: activityData.budgetE * 0.1,
        budgetMOD: activityData.budgetMOD * 0.1,
        isActive: true,
        sortOrder: 1,
      },
      {
        code: `${activityData.code}-02`,
        name: `Exécution - ${activityData.name}`,
        description: `Phase d'exécution principale pour ${activityData.name}`,
        budgetAmount: activityData.budgetAmount * 0.8, // 80% of main activity
        budgetM: activityData.budgetM * 0.8,
        budgetS: activityData.budgetS * 0.8,
        budgetD: activityData.budgetD * 0.8,
        budgetE: activityData.budgetE * 0.8,
        budgetMOD: activityData.budgetMOD * 0.8,
        isActive: true,
        sortOrder: 2,
      },
      {
        code: `${activityData.code}-03`,
        name: `Contrôle Qualité - ${activityData.name}`,
        description: `Phase de contrôle qualité et finalisation pour ${activityData.name}`,
        budgetAmount: activityData.budgetAmount * 0.1, // 10% of main activity
        budgetM: activityData.budgetM * 0.1,
        budgetS: activityData.budgetS * 0.1,
        budgetD: activityData.budgetD * 0.1,
        budgetE: activityData.budgetE * 0.1,
        budgetMOD: activityData.budgetMOD * 0.1,
        isActive: true,
        sortOrder: 3,
      },
    ];

    for (const subActivityData of subActivitiesData) {
      const subActivity = await prisma.subActivity.create({
        data: {
          ...subActivityData,
          organizationId: organization.id,
          projectId: project1.id,
          activityId: activity.id,
        },
      });
      console.log(
        `    ✅ Created sub-activity: ${subActivity.code} - ${subActivity.name}`
      );
    }
  }

  // Project 2 Activities
  const activities2 = [
    {
      code: "02010",
      name: "Démolition et Préparation",
      description: "Démolition des éléments existants et préparation des lieux",
      budgetAmount: 15000.0,
      budgetM: 5000.0, // Matériel
      budgetS: 8000.0, // Sous-traitance
      budgetD: 1500.0, // Divers
      budgetE: 500.0, // Équipement
      budgetMOD: 1000.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 1,
    },
    {
      code: "02100",
      name: "Cloisons et Plafonds",
      description: "Installation de nouvelles cloisons et plafonds suspendus",
      budgetAmount: 25000.0,
      budgetM: 15000.0, // Matériel
      budgetS: 8000.0, // Sous-traitance
      budgetD: 1000.0, // Divers
      budgetE: 500.0, // Équipement
      budgetMOD: 500.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 2,
    },
    {
      code: "02200",
      name: "Électricité et Télécommunications",
      description:
        "Installation des systèmes électriques et de télécommunications",
      budgetAmount: 20000.0,
      budgetM: 12000.0, // Matériel
      budgetS: 6000.0, // Sous-traitance
      budgetD: 1000.0, // Divers
      budgetE: 500.0, // Équipement
      budgetMOD: 500.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 3,
    },
    {
      code: "02300",
      name: "Plomberie et HVAC",
      description: "Installation des systèmes de plomberie et de climatisation",
      budgetAmount: 18000.0,
      budgetM: 10000.0, // Matériel
      budgetS: 6000.0, // Sous-traitance
      budgetD: 1000.0, // Divers
      budgetE: 500.0, // Équipement
      budgetMOD: 500.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 4,
    },
    {
      code: "02400",
      name: "Finition et Aménagement",
      description: "Peinture, planchers, mobilier et finitions finales",
      budgetAmount: 32000.0,
      budgetM: 20000.0, // Matériel
      budgetS: 8000.0, // Sous-traitance
      budgetD: 2000.0, // Divers
      budgetE: 1000.0, // Équipement
      budgetMOD: 1000.0, // Main-d'œuvre
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const activityData of activities2) {
    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        organizationId: organization.id,
        projectId: project2.id,
      },
    });
    console.log(`  ✅ Created activity: ${activity.code} - ${activity.name}`);

    // Create sub-activities for each main activity
    const subActivitiesData = [
      {
        code: `${activityData.code}-01`,
        name: `Planification - ${activityData.name}`,
        description: `Phase de planification et préparation pour ${activityData.name}`,
        budgetAmount: activityData.budgetAmount * 0.1,
        budgetM: activityData.budgetM * 0.1,
        budgetS: activityData.budgetS * 0.1,
        budgetD: activityData.budgetD * 0.1,
        budgetE: activityData.budgetE * 0.1,
        budgetMOD: activityData.budgetMOD * 0.1,
        isActive: true,
        sortOrder: 1,
      },
      {
        code: `${activityData.code}-02`,
        name: `Exécution - ${activityData.name}`,
        description: `Phase d'exécution principale pour ${activityData.name}`,
        budgetAmount: activityData.budgetAmount * 0.8,
        budgetM: activityData.budgetM * 0.8,
        budgetS: activityData.budgetS * 0.8,
        budgetD: activityData.budgetD * 0.8,
        budgetE: activityData.budgetE * 0.8,
        budgetMOD: activityData.budgetMOD * 0.8,
        isActive: true,
        sortOrder: 2,
      },
      {
        code: `${activityData.code}-03`,
        name: `Contrôle Qualité - ${activityData.name}`,
        description: `Phase de contrôle qualité et finalisation pour ${activityData.name}`,
        budgetAmount: activityData.budgetAmount * 0.1,
        budgetM: activityData.budgetM * 0.1,
        budgetS: activityData.budgetS * 0.1,
        budgetD: activityData.budgetD * 0.1,
        budgetE: activityData.budgetE * 0.1,
        budgetMOD: activityData.budgetMOD * 0.1,
        isActive: true,
        sortOrder: 3,
      },
    ];

    for (const subActivityData of subActivitiesData) {
      const subActivity = await prisma.subActivity.create({
        data: {
          ...subActivityData,
          organizationId: organization.id,
          projectId: project2.id,
          activityId: activity.id,
        },
      });
      console.log(
        `    ✅ Created sub-activity: ${subActivity.code} - ${subActivity.name}`
      );
    }
  }

  console.log(
    "🎉 Successfully seeded projects, activities, and sub-activities!"
  );
  console.log(`📊 Summary:`);
  console.log(`  - 2 Projects created`);
  console.log(`  - 10 Activities created (5 per project)`);
  console.log(`  - 30 Sub-activities created (3 per activity)`);
  console.log(
    `  - Total budget: $${(450000 + 125000).toLocaleString("en-CA")} CAD`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
