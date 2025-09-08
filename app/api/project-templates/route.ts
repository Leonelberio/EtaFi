import { NextRequest, NextResponse } from "next/server";
import { requireRead, requireCreate } from "@/lib/rbac-middleware";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Activity template schema
const activityTemplateSchema = z.object({
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  accountM: z.string().optional(),
  accountS: z.string().optional(),
  accountD: z.string().optional(),
  accountE: z.string().optional(),
  accountMOD: z.string().optional(),
});

// Project template validation schema
const projectTemplateSchema = z.object({
  name: z.string().min(2, "Template name is required").max(100),
  description: z.string().optional(),
  kind: z.enum(["ADMIN", "BILLABLE"]).default("BILLABLE"),
  activities: z
    .array(activityTemplateSchema)
    .min(1, "At least one activity is required"),
});

// Predefined Canadian project templates
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
 * GET /api/project-templates
 * Get available project templates (both custom and predefined)
 */
export const GET = requireRead("PROJECTS")(
  async (request, context, authContext) => {
    try {
      // Get custom templates from database
      const customTemplates = await prisma.projectTemplate.findMany({
        where: {
          organizationId: authContext.organizationId,
        },
        include: {
          activities: {
            orderBy: { code: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      // Get predefined templates
      const predefinedTemplates = Object.entries(
        CANADIAN_PROJECT_TEMPLATES
      ).map(([key, template]) => ({
        id: key,
        name: template.name,
        description: template.description,
        kind: template.kind,
        activities: template.activities,
        isPredefined: true,
        activityCount: template.activities.length,
      }));

      return NextResponse.json({
        customTemplates,
        predefinedTemplates,
        totalCount: customTemplates.length + predefinedTemplates.length,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching project templates:", error);
      return NextResponse.json(
        { error: "Failed to fetch project templates" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/project-templates
 * Create a new custom project template
 */
export const POST = requireCreate("PROJECTS")(
  async (request, context, authContext) => {
    try {
      const body = await request.json();
      const validatedData = projectTemplateSchema.parse(body);

      // Check if template name already exists
      const existingTemplate = await prisma.projectTemplate.findFirst({
        where: {
          organizationId: authContext.organizationId,
          name: validatedData.name,
        },
      });

      if (existingTemplate) {
        return NextResponse.json(
          { error: "Template name already exists" },
          { status: 400 }
        );
      }

      // Check for duplicate activity codes within the template
      const activityCodes = validatedData.activities.map((a) => a.code);
      const uniqueCodes = new Set(activityCodes);
      if (activityCodes.length !== uniqueCodes.size) {
        return NextResponse.json(
          { error: "Duplicate activity codes within template" },
          { status: 400 }
        );
      }

      // Validate GL accounts if specified
      const allAccountIds = validatedData.activities
        .flatMap((activity) => [
          activity.accountM,
          activity.accountS,
          activity.accountD,
          activity.accountE,
          activity.accountMOD,
        ])
        .filter(Boolean);

      if (allAccountIds.length > 0) {
        const validAccounts = await prisma.chartAccount.findMany({
          where: {
            id: { in: allAccountIds as string[] },
            organizationId: authContext.organizationId,
          },
          select: { id: true },
        });

        const validAccountIds = new Set(validAccounts.map((a) => a.id));
        const invalidAccounts = allAccountIds.filter(
          (id) => !validAccountIds.has(id as string)
        );

        if (invalidAccounts.length > 0) {
          return NextResponse.json(
            { error: "Some GL accounts not found", invalidAccounts },
            { status: 400 }
          );
        }
      }

      // Create template with activities
      const template = await prisma.projectTemplate.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          kind: validatedData.kind,
          organizationId: authContext.organizationId,
          activities: {
            create: validatedData.activities.map((activity) => ({
              code: activity.code,
              name: activity.name,
              description: activity.description,
              accountM: activity.accountM,
              accountS: activity.accountS,
              accountD: activity.accountD,
              accountE: activity.accountE,
              accountMOD: activity.accountMOD,
            })),
          },
        },
        include: {
          activities: {
            orderBy: { code: "asc" },
          },
        },
      });

      return NextResponse.json({
        template,
        success: true,
        message: "Project template created successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }

      console.error("Error creating project template:", error);
      return NextResponse.json(
        { error: "Failed to create project template" },
        { status: 500 }
      );
    }
  }
);
