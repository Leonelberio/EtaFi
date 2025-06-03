"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Download,
  Upload,
  BookOpen,
  Hash,
  Settings,
  Filter,
  SortAsc,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Account {
  id: string;
  numero_compte: string;
  libelle_compte: string;
  createdAt: string;
  updatedAt: string;
}

const classNames = {
  1: "Financement permanent",
  2: "Actif immobilisé",
  3: "Stocks",
  4: "Tiers",
  5: "Trésorerie",
  6: "Charges",
  7: "Produits",
  8: "Comptes spéciaux",
  9: "Analytique et budgétaire",
};

// Helper function to get account class from numero_compte
const getAccountClass = (numeroCompte: string): number => {
  const firstDigit = parseInt(numeroCompte.charAt(0));
  return isNaN(firstDigit) ? 0 : firstDigit;
};

// Helper function to determine account nature
const getAccountNature = (numeroCompte: string): "Débit" | "Crédit" => {
  const classe = getAccountClass(numeroCompte);
  // Classes 1, 4, 7 sont généralement créditrices
  // Classes 2, 3, 5, 6, 8, 9 sont généralement débitrices
  return [1, 4, 7].includes(classe) ? "Crédit" : "Débit";
};

// LocalStorage key for caching
const STORAGE_KEY = "etafi_plan_comptable_cache";
const STORAGE_VERSION = "1.0"; // Increment to force cache refresh

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedNature, setSelectedNature] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("numero_compte");
  const [isUploading, setIsUploading] = useState(false);
  const [dataSource, setDataSource] = useState<"cache" | "api">("cache");

  // Load from localStorage first, then API if needed
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);

        // Try to load from localStorage first
        const cachedData = localStorage.getItem(STORAGE_KEY);
        if (cachedData) {
          try {
            const { data, version, timestamp } = JSON.parse(cachedData);

            // Check if cache is valid (version matches and data exists)
            if (
              version === STORAGE_VERSION &&
              data &&
              Array.isArray(data) &&
              data.length > 0
            ) {
              console.log(
                "📁 Loading chart of accounts from localStorage cache"
              );
              setAccounts(data);
              setDataSource("cache");
              setLoading(false);
              return; // Exit early if cache is valid
            }
          } catch (e) {
            console.warn("⚠️ Invalid localStorage cache, fetching from API");
          }
        }

        // If no valid cache, fetch from API
        console.log("🌐 Fetching chart of accounts from API");
        const response = await fetch("/api/plan-comptable/all");
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }

        const data = await response.json();
        setAccounts(data);
        setDataSource("api");

        // Save to localStorage for next time
        if (data && Array.isArray(data) && data.length > 0) {
          const cacheData = {
            data,
            version: STORAGE_VERSION,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
          console.log("💾 Saved chart of accounts to localStorage cache");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  // Handle CSV upload
  const handleUploadCSV = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/plan-comptable/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      alert("✅ " + result.message);

      // Refresh the accounts list from API and update cache
      const refreshResponse = await fetch("/api/plan-comptable/all");
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setAccounts(refreshedData);
        setDataSource("api");

        // Update localStorage cache
        const cacheData = {
          data: refreshedData,
          version: STORAGE_VERSION,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        console.log("💾 Updated chart of accounts cache after upload");
      }
    } catch (err) {
      alert(
        "❌ Erreur lors de l'upload: " +
          (err instanceof Error ? err.message : "Erreur inconnue")
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  // Force refresh from API
  const handleRefreshFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/plan-comptable/all");
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await response.json();
      setAccounts(data);
      setDataSource("api");

      // Update cache
      const cacheData = {
        data,
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
      console.log("🔄 Refreshed from API and updated cache");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort accounts
  const filteredAccounts = accounts
    .filter((account) => {
      const matchesSearch =
        account.numero_compte
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        account.libelle_compte.toLowerCase().includes(searchTerm.toLowerCase());

      const accountClass = getAccountClass(account.numero_compte);
      const matchesClass =
        selectedClass === "all" || accountClass === parseInt(selectedClass);

      const accountNature = getAccountNature(account.numero_compte);
      const matchesNature =
        selectedNature === "all" || accountNature === selectedNature;

      return matchesSearch && matchesClass && matchesNature;
    })
    .sort((a, b) => {
      if (sortBy === "numero_compte")
        return a.numero_compte.localeCompare(b.numero_compte);
      if (sortBy === "libelle_compte")
        return a.libelle_compte.localeCompare(b.libelle_compte);
      if (sortBy === "classe")
        return (
          getAccountClass(a.numero_compte) - getAccountClass(b.numero_compte)
        );
      return 0;
    });

  // Get statistics
  const stats = {
    total: accounts.length,
    active: accounts.length, // All accounts are considered active from DB
    byClass: Object.keys(classNames).map((classe) => ({
      classe: parseInt(classe),
      name: classNames[parseInt(classe) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9],
      count: accounts.filter(
        (acc) => getAccountClass(acc.numero_compte) === parseInt(classe)
      ).length,
    })),
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const csvContent = `numero_compte,libelle_compte
101,Capital
106,Réserves
221,Terrains
411,Clients
512,Banques
601,Achats de marchandises
701,Ventes de marchandises`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modele_plan_comptable.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du plan comptable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl flex items-center justify-center border border-rose-200">
                  <BookOpen className="h-6 w-6 text-rose-600" />
                </div>
                Plan Comptable SYSCOHADA
              </h1>
              <p className="text-gray-600 mt-1">
                Référentiel comptable pour l&apos;Afrique de l&apos;Ouest et du
                Centre
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadCSVTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Modèle CSV
              </Button>
              <input
                type="file"
                accept=".csv"
                onChange={handleUploadCSV}
                style={{ display: "none" }}
                id="csv-upload-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("csv-upload-input")?.click()
                }
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Upload..." : "Importer CSV"}
              </Button>
              {dataSource === "cache" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshFromAPI}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              )}
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau compte
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Total Comptes
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.total}
                    </p>
                  </div>
                  <Hash className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Comptes Actifs
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.active}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      Classes
                    </p>
                    <p className="text-2xl font-bold text-purple-900">9</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      {dataSource === "cache"
                        ? "Cache Local"
                        : "Base de Données"}
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {dataSource === "cache" ? "📁" : "🌐"}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition par classe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-9 gap-4">
            {stats.byClass.map((classe) => (
              <Card
                key={classe.classe}
                className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedClass(classe.classe.toString())}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-rose-600 mb-1">
                    {classe.classe}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {classe.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {classe.count} comptes
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-sm border border-gray-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-rose-500" />
              Recherche et Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un compte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {Object.entries(classNames).map(([num, name]) => (
                    <SelectItem key={num} value={num}>
                      Classe {num} - {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedNature} onValueChange={setSelectedNature}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les natures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les natures</SelectItem>
                  <SelectItem value="Débit">Débit</SelectItem>
                  <SelectItem value="Crédit">Crédit</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numero_compte">Numéro</SelectItem>
                  <SelectItem value="libelle_compte">Libellé</SelectItem>
                  <SelectItem value="classe">Classe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-rose-500" />
                Comptes ({filteredAccounts.length})
              </CardTitle>
              <div className="text-sm text-gray-500">
                {selectedClass !== "all" && `Classe ${selectedClass} • `}
                {selectedNature !== "all" && `${selectedNature} • `}
                {dataSource === "cache" ? (
                  <span className="text-blue-600 flex items-center gap-1">
                    📁 Cache local
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1">
                    🌐 Base de données
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Numéro Compte</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="w-24">Classe</TableHead>
                    <TableHead className="w-20">Nature</TableHead>
                    <TableHead className="w-40">Créé le</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const accountClass = getAccountClass(account.numero_compte);
                    const accountNature = getAccountNature(
                      account.numero_compte
                    );

                    return (
                      <TableRow key={account.id} className="hover:bg-gray-50">
                        <TableCell>
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {account.numero_compte}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          {account.libelle_compte}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {accountClass}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              accountNature === "Débit"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {accountNature}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(account.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun compte trouvé
                </h3>
                <p className="text-gray-500 mb-4">
                  {accounts.length === 0
                    ? "Aucun compte dans la base de données. Importez un fichier CSV pour commencer."
                    : "Essayez de modifier vos critères de recherche"}
                </p>
                {accounts.length === 0 && (
                  <Button
                    onClick={() =>
                      document.getElementById("csv-upload-input")?.click()
                    }
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importer des comptes
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
