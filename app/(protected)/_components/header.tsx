"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { OrganizationSwitchLoading } from "@/components/OrganizationSwitchLoading";

interface Organization {
  id: string;
  name: string;
  role: string;
  logo?: string;
}
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  Check,
  Building,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { SmartSearch } from "@/components/SmartSearch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const [switchingToOrg, setSwitchingToOrg] = useState<Organization | null>(null);

  // 🆕 Use organization context for real-time updates
  const {
    organizations,
    currentOrganization,
    isLoading: isLoadingOrgs,
    isSwitching,
    switchOrganization,
  } = useOrganizationContext();

  // Organization switching with persistence
  const handleOrganizationSwitch = async (org: Organization) => {
    try {
      setSwitchingToOrg(org);
      await switchOrganization(org);
    } catch (error) {
      console.error("Failed to switch organization:", error);
      setSwitchingToOrg(null);
      // You could show a toast error here
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Organization Switcher */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-left hover:bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-40">
                      {isLoadingOrgs
                        ? "Chargement..."
                        : currentOrganization?.name || "Aucune organisation"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {isLoadingOrgs ? "..." : currentOrganization?.role || ""}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-80 bg-white border border-gray-200 shadow-lg"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">
                    Changer d&apos;organisation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sélectionnez l&apos;organisation avec laquelle travailler
                  </p>
                </div>

                <div className="py-2">
                  {isLoadingOrgs ? (
                    <div className="flex items-center justify-center p-4">
                      <p className="text-sm text-gray-600">
                        Chargement des organisations...
                      </p>
                    </div>
                  ) : organizations.length === 0 ? (
                    <div className="flex items-center justify-center p-4">
                      <p className="text-sm text-gray-600">
                        Aucune organisation trouvée
                      </p>
                    </div>
                  ) : (
                    organizations.map((org) => (
                      <DropdownMenuItem
                        key={org.id}
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleOrganizationSwitch(org)}
                      >
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          {org.logo ? (
                            <img
                              src={org.logo}
                              alt={org.name}
                              className="h-6 w-6 rounded"
                            />
                          ) : (
                            <Building className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {org.name}
                          </p>
                          <p className="text-xs text-gray-600">{org.role}</p>
                        </div>
                        {currentOrganization?.id === org.id && (
                          <Check className="h-4 w-4 text-rose-500" />
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                  <Link href="/dashboard/organizations/new">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm hover:bg-gray-50"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Créer une organisation
                    </Button>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Smart Search */}
          <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-start">
            <div className="w-full max-w-lg lg:max-w-xs">
              <SmartSearch 
                className="w-full"
                placeholder="Rechercher pages, factures, projets..."
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard/invoices/new">
                <Button
                  size="sm"
                  className="bg-rose-500 hover:bg-rose-600 text-white border border-rose-500 text-xs"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Nouvelle Facture
                </Button>
              </Link>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-gray-600 hover:text-gray-900"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-xs p-0 flex items-center justify-center">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-white border border-gray-200 shadow-lg"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Vous avez 3 nouvelles notifications
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="flex items-start gap-3 p-4 hover:bg-gray-50">
                    <div className="h-2 w-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Rappel: Déclaration TVA
                      </p>
                      <p className="text-xs text-gray-600">
                        Échéance dans 3 jours pour ABC SARL
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 2h</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-start gap-3 p-4 hover:bg-gray-50">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Balance importée
                      </p>
                      <p className="text-xs text-gray-600">
                        Nouvelle balance pour exercice 2023
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Il y a 1 jour
                      </p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-start gap-3 p-4 hover:bg-gray-50">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        États financiers générés
                      </p>
                      <p className="text-xs text-gray-600">
                        SYSCOHADA complet pour XYZ SARL
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Il y a 2 jours
                      </p>
                    </div>
                  </DropdownMenuItem>
                </div>

                <div className="border-t border-gray-100 p-2">
                  <Link href="/dashboard/notifications">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-sm hover:bg-gray-50"
                    >
                      Voir toutes les notifications
                    </Button>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {session?.user?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white border border-gray-200 shadow-lg"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {session?.user?.email}
                  </p>
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mon Profil
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Organization Switch Loading Screen */}
      <OrganizationSwitchLoading
        fromOrgName={currentOrganization?.name || ""}
        toOrgName={switchingToOrg?.name || ""}
        isVisible={isSwitching}
      />
    </header>
  );
}
