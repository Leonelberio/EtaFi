"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  FileText,
  Bell,
  Settings,
  Users,
  LogOut,
  BarChart3,
  Calculator,
  HelpCircle,
  Receipt,
  CreditCard,
  BookOpen,
  TrendingUp,
  Shield,
  Truck,
  DollarSign,
  PieChart,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

// Module-based navigation structure
const navigationModules = [
  {
    name: "Tableau de Bord",
    items: [
      {
        name: "Accueil",
        href: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    name: "Organisation",
    items: [
      {
        name: "Organisations",
        href: "/dashboard/organizations",
        icon: Building2,
      },
    ],
  },
  {
    name: "Gestion des Projets",
    items: [
      {
        name: "Projets",
        href: "/dashboard/projects",
        icon: Shield,
      },
      {
        name: "Activités",
        href: "/dashboard/activities",
        icon: TrendingUp,
      },
      {
        name: "Modèles de Projets",
        href: "/dashboard/project-templates",
        icon: FileText,
      },
    ],
  },
  {
    name: "Budgétisation",
    items: [
      {
        name: "Budgets",
        href: "/dashboard/budgets",
        icon: DollarSign,
      },
      {
        name: "Rapports Budget",
        href: "/dashboard/budget-reports",
        icon: PieChart,
      },
      {
        name: "Alertes Budget",
        href: "/dashboard/budget-alerts",
        icon: AlertTriangle,
      },
    ],
  },
  {
    name: "Comptabilité",
    items: [
      {
        name: "Plan Comptable",
        href: "/dashboard/chart-of-accounts",
        icon: Calculator,
      },
      {
        name: "Codes de Taxe",
        href: "/dashboard/tax-codes",
        icon: Receipt,
      },
      {
        name: "Catégories de Coûts",
        href: "/dashboard/cost-categories",
        icon: BarChart3,
      },
      {
        name: "Grand Livre",
        href: "/dashboard/ledger",
        icon: BookOpen,
      },
    ],
  },
  {
    name: "Clients & Fournisseurs",
    items: [
      {
        name: "Clients",
        href: "/dashboard/customers",
        icon: Users,
      },
      {
        name: "Fournisseurs",
        href: "/dashboard/vendors",
        icon: Truck,
      },
    ],
  },
  {
    name: "Facturation",
    items: [
      {
        name: "Factures",
        href: "/dashboard/invoices",
        icon: FileText,
      },
    ],
  },
  {
    name: "Système",
    items: [
      {
        name: "Paramètres",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Helper function to determine if a navigation item is active
  const isNavigationActive = (href: string) => {
    // Exact match
    if (pathname === href) return true;

    // For dashboard root, only match exactly to avoid conflicts
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    // For other routes, check if pathname starts with href followed by a slash
    // This prevents /dashboard from matching /dashboard/companies
    return pathname.startsWith(href + "/");
  };

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-white border-r border-gray-200",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EtaFi</h1>
            <p className="text-xs text-gray-500 font-medium">Comptabilité</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {navigationModules.map((module) => (
          <div key={module.name}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              {module.name}
            </h2>
            <nav className="space-y-1">
              {module.items.map((item) => {
                const isActive = isNavigationActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary-50 text-primary-700 border border-primary-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 transition-colors duration-200",
                        isActive
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto h-2 w-2 bg-primary-500 rounded-full animate-pulse-soft" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4">
        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Organisations</p>
              <p className="text-lg font-bold text-gray-900">8</p>
            </div>
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Building2 className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Link
          href="/api/auth/signout"
          className="group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
          Déconnexion
        </Link>
      </div>
    </div>
  );
}
