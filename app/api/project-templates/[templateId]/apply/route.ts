import { NextRequest, NextResponse } from "next/server";
import { requireCreate } from "@/lib/rbac-middleware";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: {
    templateId: string;
  };
}

// Apply template schema
const applyTemplateSchema = z.object({
  projectCode: z
    .string()
    .min(3, "Project code must be at least 3 characters")
    .max(20, "Project code must be at most 20 characters")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Project code must contain only uppercase letters, numbers, underscore, and dash"
    ),
  projectName: z.string().min(2, "Project name is required").max(100),
  projectDescription: z.string().optional(),
  clientId: z.string().optional(),
  managerId: z.string().optional(),
  totalBudget: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),

  // Activity code customization
  activityCodePrefix: z
    .string()
    .length(2, "Activity code prefix must be exactly 2 digits")
    .regex(/^\d{2}$/, "Activity code prefix must contain only digits")
    .optional(),

  // GL account mappings override
  defaultAccounts: z
    .object({
      accountM: z.string().optional(),
      accountS: z.string().optional(),
      accountD: z.string().optional(),
      accountE: z.string().optional(),
      accountMOD: z.string().optional(),
    })
    .optional(),
});

// Predefined template data (same as in route.ts)
const CANADIAN_PROJECT_TEMPLATES = {
  construction_residential: {
    name: "Construction Résidentielle",
    description:
      "Template pour projets de construction résidentielle avec activités standard",
    kind: "BILLABLE" as const,
    activities: [
      {
        code: "010100",
        name: "Organisation et démarrage",
        description: "Mobilisation, préparation du chantier",
      },
      {
        code: "020100",
        name: "Excavation et terrassement",
        description: "Préparation du terrain",
      },
      {
        code: "030100",
        name: "Fondations",
        description: "Coulage des fondations et semelles",
      },
      {
        code: "040100",
        name: "Charpente",
        description: "Structure de bois ou acier",
      },
      {
        code: "050100",
        name: "Toiture",
        description: "Couverture et étanchéité",
      },
      {
        code: "060100",
        name: "Maçonnerie",
        description: "Travaux de briques et pierres",
      },
      {
        code: "070100",
        name: "Plomberie",
        description: "Installation sanitaire",
      },
      {
        code: "080100",
        name: "Électricité",
        description: "Installation électrique",
      },
      {
        code: "090100",
        name: "Isolation",
        description: "Isolation thermique et acoustique",
      },
      {
        code: "100100",
        name: "Cloisons sèches",
        description: "Gyproc et finition",
      },
      {
        code: "110100",
        name: "Revêtements de sol",
        description: "Planchers, carrelage, etc.",
      },
      {
        code: "120100",
        name: "Peinture",
        description: "Peinture intérieure et extérieure",
      },
      {
        code: "130100",
        name: "Finitions",
        description: "Finitions diverses et nettoyage",
      },
      {
        code: "900100",
        name: "Administration projet",
        description: "Gestion et administration",
      },
    ],
  },

  construction_commercial: {
    name: "Construction Commerciale",
    description:
      "Template pour projets de construction commerciale et industrielle",
    kind: "BILLABLE" as const,
    activities: [
      {
        code: "010200",
        name: "Études et conception",
        description: "Plans et études techniques",
      },
      {
        code: "020200",
        name: "Préparation terrain",
        description: "Démolition, excavation",
      },
      {
        code: "030200",
        name: "Gros œuvre",
        description: "Structure principale",
      },
      {
        code: "040200",
        name: "Enveloppe du bâtiment",
        description: "Murs extérieurs, toiture",
      },
      {
        code: "050200",
        name: "Systèmes mécaniques",
        description: "Chauffage, ventilation, climatisation",
      },
      {
        code: "060200",
        name: "Systèmes électriques",
        description: "Haute et basse tension",
      },
      {
        code: "070200",
        name: "Plomberie commerciale",
        description: "Systèmes sanitaires commerciaux",
      },
      {
        code: "080200",
        name: "Finitions intérieures",
        description: "Cloisons, plafonds, revêtements",
      },
      {
        code: "090200",
        name: "Finitions extérieures",
        description: "Façade, aménagement paysager",
      },
      {
        code: "100200",
        name: "Équipements spécialisés",
        description: "Ascenseurs, systèmes de sécurité",
      },
      {
        code: "900200",
        name: "Gestion de projet",
        description: "Direction et coordination",
      },
    ],
  },

  engineering_consulting: {
    name: "Ingénierie et Consultation",
    description: "Template pour projets d'ingénierie et services conseils",
    kind: "BILLABLE" as const,
    activities: [
      {
        code: "010300",
        name: "Analyse préliminaire",
        description: "Étude de faisabilité",
      },
      {
        code: "020300",
        name: "Conception détaillée",
        description: "Plans et spécifications",
      },
      {
        code: "030300",
        name: "Calculs d'ingénierie",
        description: "Calculs techniques et validations",
      },
      {
        code: "040300",
        name: "Modélisation",
        description: "Modèles 3D et simulations",
      },
      {
        code: "050300",
        name: "Dessins techniques",
        description: "Plans d'exécution",
      },
      {
        code: "060300",
        name: "Surveillance travaux",
        description: "Suivi de la construction",
      },
      {
        code: "070300",
        name: "Tests et commissioning",
        description: "Vérifications et mise en service",
      },
      {
        code: "080300",
        name: "Documentation",
        description: "Manuels et rapports",
      },
      {
        code: "900300",
        name: "Gestion projet",
        description: "Coordination et administration",
      },
    ],
  },

  administrative_project: {
    name: "Projet Administratif",
    description: "Template pour projets administratifs internes",
    kind: "ADMIN" as const,
    activities: [
      {
        code: "010900",
        name: "Planification",
        description: "Planification et définition",
      },
      {
        code: "020900",
        name: "Développement",
        description: "Développement et implémentation",
      },
      {
        code: "030900",
        name: "Formation",
        description: "Formation et transfert de connaissances",
      },
      { code: "040900", name: "Tests", description: "Tests et validation" },
      {
        code: "050900",
        name: "Déploiement",
        description: "Mise en production",
      },
      {
        code: "060900",
        name: "Support",
        description: "Support et maintenance",
      },
      {
        code: "900900",
        name: "Administration",
        description: "Gestion administrative",
      },
    ],
  },
};

/**
 * POST /api/project-templates/[templateId]/apply
 * Apply a template to create a new project with activities
 */
export const POST = requireCreate("PROJECTS")(
  async (request, context, authContext) => {
    try {
      const { templateId } = context.params;
      const body = await request.json();
      const validatedData = applyTemplateSchema.parse(body);

      let template;
      let templateActivities;

      // Check if it's a predefined template
      if (
        CANADIAN_PROJECT_TEMPLATES[
          templateId as keyof typeof CANADIAN_PROJECT_TEMPLATES
        ]
      ) {
        template =
          CANADIAN_PROJECT_TEMPLATES[
            templateId as keyof typeof CANADIAN_PROJECT_TEMPLATES
          ];
        templateActivities = template.activities;
      } else {
        // It's a custom template from database
        const customTemplate = await prisma.projectTemplate.findFirst({
          where: {
            id: templateId,
            organizationId: authContext.organizationId,
          },
          include: {
            activities: {
              orderBy: { code: "asc" },
            },
          },
        });

        if (!customTemplate) {
          return NextResponse.json(
            { error: "Template not found" },
            { status: 404 }
          );
        }

        template = customTemplate;
        templateActivities = customTemplate.activities;
      }

      // Check if project code already exists
      const existingProject = await prisma.project.findFirst({
        where: {
          organizationId: authContext.organizationId,
          code: validatedData.projectCode,
        },
      });

      if (existingProject) {
        return NextResponse.json(
          { error: "Project code already exists" },
          { status: 400 }
        );
      }

      // Validate client if specified
      if (validatedData.clientId) {
        const client = await prisma.customer.findFirst({
          where: {
            id: validatedData.clientId,
            organizationId: authContext.organizationId,
          },
        });

        if (!client) {
          return NextResponse.json(
            { error: "Client not found" },
            { status: 400 }
          );
        }
      }

      // Validate manager if specified
      if (validatedData.managerId) {
        const manager = await prisma.organizationMembership.findFirst({
          where: {
            userId: validatedData.managerId,
            organizationId: authContext.organizationId,
            isActive: true,
          },
        });

        if (!manager) {
          return NextResponse.json(
            { error: "Project manager not found in organization" },
            { status: 400 }
          );
        }
      }

      // Validate default GL accounts if specified
      if (validatedData.defaultAccounts) {
        const accountIds = Object.values(validatedData.defaultAccounts).filter(
          Boolean
        );
        if (accountIds.length > 0) {
          const validAccounts = await prisma.chartAccount.findMany({
            where: {
              id: { in: accountIds as string[] },
              organizationId: authContext.organizationId,
            },
            select: { id: true },
          });

          if (validAccounts.length !== accountIds.length) {
            return NextResponse.json(
              { error: "Some default GL accounts not found" },
              { status: 400 }
            );
          }
        }
      }

      // Create project in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the project
        const project = await tx.project.create({
          data: {
            code: validatedData.projectCode,
            name: validatedData.projectName,
            description: validatedData.projectDescription,
            clientId: validatedData.clientId,
            managerId: validatedData.managerId,
            kind: template.kind,
            totalBudget: validatedData.totalBudget,
            startDate: validatedData.startDate
              ? new Date(validatedData.startDate)
              : null,
            endDate: validatedData.endDate
              ? new Date(validatedData.endDate)
              : null,
            organizationId: authContext.organizationId,
          },
        });

        // Create activities from template
        const createdActivities = [];
        for (const templateActivity of templateActivities) {
          let activityCode = templateActivity.code;

          // Apply custom prefix if specified
          if (validatedData.activityCodePrefix) {
            // Replace first 2 digits with custom prefix
            activityCode =
              validatedData.activityCodePrefix +
              templateActivity.code.substring(2);
          }

          // Check for activity code conflicts
          const existingActivity = await tx.activity.findFirst({
            where: {
              projectId: project.id,
              code: activityCode,
            },
          });

          if (existingActivity) {
            throw new Error(`Activity code conflict: ${activityCode}`);
          }

          const activity = await tx.activity.create({
            data: {
              code: activityCode,
              name: templateActivity.name,
              description: templateActivity.description,
              projectId: project.id,
              organizationId: authContext.organizationId,
              // Use template GL accounts or default overrides
              accountM:
                templateActivity.accountM ||
                validatedData.defaultAccounts?.accountM,
              accountS:
                templateActivity.accountS ||
                validatedData.defaultAccounts?.accountS,
              accountD:
                templateActivity.accountD ||
                validatedData.defaultAccounts?.accountD,
              accountE:
                templateActivity.accountE ||
                validatedData.defaultAccounts?.accountE,
              accountMOD:
                templateActivity.accountMOD ||
                validatedData.defaultAccounts?.accountMOD,
            },
          });

          createdActivities.push(activity);
        }

        return { project, activities: createdActivities };
      });

      // Fetch the complete project with all relations
      const completeProject = await prisma.project.findUnique({
        where: { id: result.project.id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          activities: {
            orderBy: { code: "asc" },
          },
        },
      });

      return NextResponse.json({
        project: completeProject,
        activitiesCreated: result.activities.length,
        template: {
          id: templateId,
          name: template.name,
          description: template.description,
        },
        success: true,
        message: `Project created successfully from template with ${result.activities.length} activities`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }

      console.error("Error applying project template:", error);
      return NextResponse.json(
        { error: "Failed to apply project template" },
        { status: 500 }
      );
    }
  }
);
