"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Building2,
  Calendar,
  Eye,
  Trash2,
  Search,
  Filter,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Company {
  id: string;
  name: string;
  address: string;
  nif: string;
  contact: string;
  logo?: string;
  createdAt: string;
  organizationId: string;
  _count?: {
    exercices: number;
  };
}

interface Organization {
  id: string;
  name: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetchCompaniesAndOrganization();
  }, []);

  useEffect(() => {
    if (Array.isArray(companies)) {
      const filtered = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.nif.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [companies, searchTerm]);

  const fetchCompaniesAndOrganization = async () => {
    try {
      setError(null);

      // Fetch both companies and organization info
      const [companiesResponse, profileResponse] = await Promise.all([
        fetch("/api/companies"),
        fetch("/api/user/profile"),
      ]);

      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        // Extract companies array from the response object
        if (companiesData && Array.isArray(companiesData.companies)) {
          setCompanies(companiesData.companies);
        } else if (Array.isArray(companiesData)) {
          // Fallback for direct array response
          setCompanies(companiesData);
        } else {
          console.error(
            "Companies data is not in expected format:",
            companiesData
          );
          setCompanies([]);
          setError("Format de données invalide");
        }
      } else {
        const errorText = await companiesResponse.text();
        throw new Error(`Erreur ${companiesResponse.status}: ${errorText}`);
      }

      // Get organization info (mock for now)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setOrganization(
          profileData.organization || {
            id: "1",
            name: "Cabinet Comptable EtaFi",
          }
        );
      } else {
        // Fallback organization - should match the current org from header
        setOrganization({
          id: "1",
          name: "Cabinet Comptable EtaFi",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setCompanies([]);
      setError("Erreur lors du chargement des données");
      // Set fallback organization even on error
      setOrganization({
        id: "1",
        name: "Votre Organisation",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (
      !confirm("Êtes-vous sûr de vouloir supprimer cette entreprise cliente ?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCompanies(companies.filter((company) => company.id !== companyId));
      } else {
        alert("Erreur lors de la suppression de l'entreprise");
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Erreur lors de la suppression de l'entreprise");
    }
  };

  // Safe calculation functions
  const getTotalExercices = () => {
    if (!Array.isArray(companies)) return 0;
    return companies.reduce(
      (sum, company) => sum + (company._count?.exercices || 0),
      0
    );
  };

  const getNewThisMonth = () => {
    if (!Array.isArray(companies)) return 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return companies.filter((company) => {
      const createdDate = new Date(company.createdAt);
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;
  };

  const getActiveExercices = () => {
    if (!Array.isArray(companies)) return 0;
    // For now, assume each company has at least one active exercice
    return companies.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Chargement des entreprises clientes...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-900 font-medium mb-2">Erreur de chargement</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={fetchCompaniesAndOrganization}
            className="etafi-button-primary"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-medium text-gray-600">
                  {organization?.name}
                </span>
              </div>
              <h1 className="etafi-section-header">Entreprises Clientes</h1>
              <p className="etafi-section-subtitle">
                Gérez les entreprises de vos clients et leurs exercices
                comptables
              </p>
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <Link href="/dashboard/companies/new">
                <Button className="etafi-button-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Nouvelle Entreprise Cliente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div
          className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une entreprise cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="etafi-input pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="etafi-button-secondary">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Toutes les entreprises</DropdownMenuItem>
              <DropdownMenuItem>Avec exercices actifs</DropdownMenuItem>
              <DropdownMenuItem>Nouvelles ce mois</DropdownMenuItem>
              <DropdownMenuItem>En attente de clôture</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">Entreprises Clientes</p>
                <p className="dashboard-metric-value">{companies.length}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">Exercices Actifs</p>
                <p className="dashboard-metric-value">{getActiveExercices()}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">États Financiers</p>
                <p className="dashboard-metric-value">{getTotalExercices()}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div
            className="dashboard-stats-card animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label">Nouvelles ce Mois</p>
                <p className="dashboard-metric-value">{getNewThisMonth()}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm
                ? "Aucune entreprise trouvée"
                : "Aucune entreprise cliente"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre première entreprise cliente"}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/companies/new">
                <Button className="etafi-button-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter une Entreprise Cliente
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <div
                key={company.id}
                className="etafi-card animate-fade-in-up hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={`Logo ${company.name}`}
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        NIF: {company.nif}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <span className="sr-only">Actions</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/companies/${company.id}`}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir Détails
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/companies/${company.id}/exercices`}
                          className="flex items-center"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Gérer Exercices
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteCompany(company.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="font-medium mr-2">Adresse:</span>
                    {company.address}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="font-medium mr-2">Contact:</span>
                    {company.contact}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700"
                  >
                    {company._count?.exercices || 0} exercice(s)
                  </Badge>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/companies/${company.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="etafi-button-secondary"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
