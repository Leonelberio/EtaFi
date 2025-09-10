import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Get current organization ID
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { currentOrganizationId: true },
    });

    if (!user?.currentOrganizationId) {
      return NextResponse.json(
        { error: "No current organization" },
        { status: 400 }
      );
    }

    const orgId = user.currentOrganizationId;

    // Fetch organization-specific data
    const [
      projects,
      activities,
      journalLines,
      invoices,
      recentActivities,
    ] = await Promise.all([
      // Projects data
      db.project.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          name: true,
          status: true,
          kind: true,
          totalBudget: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              activities: true,
              invoices: true,
              journalLines: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),

      // Activities data
      db.activity.findMany({
        where: { 
          project: { organizationId: orgId } 
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          projectId: true,
          project: {
            select: { name: true },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),

      // Journal lines for financial data
      db.journalLine.findMany({
        where: { 
          organizationId: orgId 
        },
        select: {
          id: true,
          debitAmount: true,
          creditAmount: true,
          createdAt: true,
          projectId: true,
          activityId: true,
          costGroup: true,
        },
      }),

      // Invoices data
      db.invoice.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          total: true,
          status: true,
          dueDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Recent activities (from journal lines and project updates)
      db.journalLine.findMany({
        where: { 
          organizationId: orgId 
        },
        select: {
          id: true,
          description: true,
          debitAmount: true,
          creditAmount: true,
          createdAt: true,
          project: {
            select: { name: true },
          },
          activity: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Calculate KPIs
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "ACTIVE").length;
    const completedProjects = projects.filter(p => p.status === "COMPLETED").length;
    
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.totalBudget || 0), 0);
    const totalActualCosts = journalLines.reduce((sum, jl) => sum + Number(jl.debitAmount || 0), 0);
    const budgetVariance = totalBudget - totalActualCosts;
    const completionRate = totalBudget > 0 ? Math.round((totalActualCosts / totalBudget) * 100) : 0;

    // Calculate cost distribution by cost groups
    const costGroupTotals = journalLines.reduce((acc, jl) => {
      const group = jl.costGroup || "OTHER";
      acc[group] = (acc[group] || 0) + Number(jl.debitAmount || 0);
      return acc;
    }, {} as Record<string, number>);

    const totalCosts = Object.values(costGroupTotals).reduce((sum, val) => sum + val, 0);
    const costCategoryData = Object.entries(costGroupTotals).map(([group, amount]) => ({
      name: group,
      value: totalCosts > 0 ? Math.round((amount / totalCosts) * 100) : 0,
      amount: amount,
      color: getCostGroupColor(group),
    }));

    // Project status distribution
    const projectStatusData = [
      { status: "Actif", count: activeProjects, percentage: totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0 },
      { status: "En Attente", count: projects.filter(p => p.status === "ON_HOLD").length, percentage: totalProjects > 0 ? Math.round((projects.filter(p => p.status === "ON_HOLD").length / totalProjects) * 100) : 0 },
      { status: "Terminé", count: completedProjects, percentage: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0 },
      { status: "Annulé", count: projects.filter(p => p.status === "CANCELLED").length, percentage: totalProjects > 0 ? Math.round((projects.filter(p => p.status === "CANCELLED").length / totalProjects) * 100) : 0 },
    ];

    // Monthly performance data (last 6 months)
    const monthlyData = generateMonthlyPerformanceData(journalLines, projects);

    // Recent activity feed
    const recentActivityFeed = recentActivities.map(activity => ({
      id: activity.id,
      type: "transaction",
      title: activity.description || "Transaction comptable",
      description: `Projet: ${activity.project?.name || "N/A"}${activity.activity?.name ? ` - Activité: ${activity.activity.name}` : ""}`,
      amount: Number(activity.debitAmount || activity.creditAmount || 0),
      date: activity.createdAt,
      status: "completed",
    }));

    // Add project updates to recent activity
    const projectUpdates = projects.slice(0, 3).map(project => ({
      id: `project-${project.id}`,
      type: "project",
      title: `Projet "${project.name}"`,
      description: `Statut: ${getStatusLabel(project.status)}`,
      amount: Number(project.totalBudget || 0),
      date: project.updatedAt,
      status: project.status.toLowerCase(),
    }));

    const allRecentActivities = [...recentActivityFeed, ...projectUpdates]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      kpis: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        totalActualCosts,
        budgetVariance,
        completionRate,
      },
      charts: {
        monthlyPerformance: monthlyData,
        costDistribution: costCategoryData,
        projectStatus: projectStatusData,
      },
      recentActivities: allRecentActivities,
      projects: projects.slice(0, 5), // Recent projects
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

function getCostGroupColor(group: string): string {
  const colors: Record<string, string> = {
    "M": "#3B82F6", // Matériel - Blue
    "S": "#10B981", // Sous-traitance - Green
    "D": "#F59E0B", // Main-d'œuvre - Yellow
    "E": "#8B5CF6", // Équipement - Purple
    "MOD": "#EF4444", // Divers - Red
    "OTHER": "#6B7280", // Other - Gray
  };
  return colors[group] || colors["OTHER"];
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    "ACTIVE": "Actif",
    "ON_HOLD": "En Attente",
    "COMPLETED": "Terminé",
    "CANCELLED": "Annulé",
  };
  return labels[status] || status;
}

function generateMonthlyPerformanceData(journalLines: any[], projects: any[]) {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("fr-FR", { month: "short" });
    
    // Calculate budget for this month (simplified - using total budget / 6)
    const monthlyBudget = projects.reduce((sum, p) => sum + Number(p.totalBudget || 0), 0) / 6;
    
    // Calculate actual costs for this month
    const monthlyActual = journalLines
      .filter(jl => {
        const jlDate = new Date(jl.createdAt);
        return jlDate.getMonth() === date.getMonth() && jlDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, jl) => sum + Number(jl.debitAmount || 0), 0);
    
    months.push({
      month: monthName,
      budget: Math.round(monthlyBudget),
      actual: Math.round(monthlyActual),
      variance: Math.round(monthlyBudget - monthlyActual),
    });
  }
  
  return months;
}
