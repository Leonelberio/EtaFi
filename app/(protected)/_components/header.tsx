"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface Organization {
  id: string;
  name: string;
  role: string;
  logo?: string;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Fetch real organizations data
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setIsLoadingOrgs(true);
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          const orgs = data.organizations.map((org: any) => ({
            id: org.id,
            name: org.name,
            role:
              org.members?.find((m: any) => m.userId === session?.user?.id)
                ?.role || "MEMBER",
            logo: org.logo || "",
          }));
          setOrganizations(orgs);

          // Set the first organization as current if none is set
          if (orgs.length > 0 && !currentOrganization) {
            setCurrentOrganization(orgs[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        // Fallback to empty array
        setOrganizations([]);
      } finally {
        setIsLoadingOrgs(false);
      }
    }

    if (session?.user?.id) {
      fetchOrganizations();
    }
  }, [session?.user?.id, currentOrganization]);

  const handleOrganizationSwitch = (org: Organization) => {
    setCurrentOrganization(org);
    // Here you would typically update the global state and refetch data
    // You might also want to redirect to refresh the dashboard
    window.location.reload(); // Simple approach for now
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

          {/* Search */}
          <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-start">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Rechercher
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500 pl-10 pr-3 sm:text-sm"
                  placeholder="Rechercher entreprises, exercices..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard/companies/new">
                <Button
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs"
                >
                  <Building2 className="h-4 w-4 mr-1" />
                  Nouvelle Entreprise
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
    </header>
  );
}
