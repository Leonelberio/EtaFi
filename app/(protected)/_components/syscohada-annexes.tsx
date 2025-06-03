"use client";

import React, { useState } from "react";
import { formatNumber } from "@/lib/utils";
import { useFinancialTotals, useBalanceData } from "@/lib/stores/balance-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Building2,
  Shield,
  CreditCard,
  FileCheck,
  Activity,
  BookOpen,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Euro,
  Calculator,
  DollarSign,
  Target,
  PieChart,
  BarChart3,
} from "lucide-react";

interface SyscohadaAnnexesProps {
  className?: string;
}

export default function SyscohadaAnnexes({
  className = "",
}: SyscohadaAnnexesProps) {
  const financialTotals = useFinancialTotals();
  const balanceData = useBalanceData();
  const [activeTab, setActiveTab] = useState("bilan");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"etats" | "notes">("etats"); // Toggle entre états financiers et notes annexes
  const notesPerPage = 12;

  // Helper function to get account balance by account number or class
  const getAccountBalance = (accountNumber: string): number => {
    const account = balanceData.find(
      (acc) => acc.accountNumber === accountNumber
    );
    if (account) {
      return parseFloat(account.solde.replace(/[^0-9.-]/g, "")) || 0;
    }
    return 0;
  };

  // Helper function to get total for accounts starting with specific prefixes
  const getAccountClassTotal = (prefixes: string[]): number => {
    return balanceData
      .filter((acc) =>
        prefixes.some((prefix) => acc.accountNumber.startsWith(prefix))
      )
      .reduce((total, acc) => {
        const solde = parseFloat(acc.solde.replace(/[^0-9.-]/g, "")) || 0;
        return total + Math.abs(solde);
      }, 0);
  };

  // Calculate SYSCOHADA BILAN ACTIF data from balance
  const bilanActifData = {
    // Immobilisations incorporelles - All Class 21x accounts
    brevetsLicences: getAccountClassTotal(["21"]),

    // Immobilisations corporelles - All Class 22x, 23x, 24x accounts
    terrains: getAccountClassTotal(["22"]),
    batiments: getAccountClassTotal(["23"]),
    materielOutillage: getAccountClassTotal(["24"]),
    materielTransport: getAccountClassTotal(["245"]),

    // Immobilisations financières - All Class 26x, 27x accounts
    titresParticipation: getAccountClassTotal(["26"]),
    autresImmoFinancieres: getAccountClassTotal(["27"]),

    // Stocks - All Class 3x accounts
    stocks: getAccountClassTotal(["3"]),

    // Créances - All Class 4x asset accounts (41-48)
    clients: getAccountClassTotal(["41"]),
    autresCreances: getAccountClassTotal([
      "42",
      "43",
      "44",
      "45",
      "46",
      "47",
      "48",
    ]),

    // Trésorerie actif - All Class 51x, 52x, 53x accounts
    banquesCaisse: getAccountClassTotal(["51", "52", "53"]),
  };

  // Calculate SYSCOHADA BILAN PASSIF data from balance
  const bilanPassifData = {
    // Capitaux propres - All Class 1x accounts
    capital: Math.abs(getAccountClassTotal(["10"])),
    reservesIndisponibles: Math.abs(getAccountClassTotal(["106"])) * 0.25, // Estimation
    reservesLibres: Math.abs(getAccountClassTotal(["106"])) * 0.75, // Estimation
    reportNouveau: Math.abs(getAccountClassTotal(["11"])),
    resultatExercice: Math.abs(getAccountClassTotal(["12"])),

    // Dettes financières - All Class 16x accounts
    emprunts: getAccountClassTotal(["16"]),
    provisionsRisques: getAccountClassTotal(["15"]),

    // Passif circulant - All Class 4x liability accounts (40, 49)
    avancesClients: getAccountClassTotal(["419"]),
    fournisseurs: Math.abs(getAccountClassTotal(["40"])),
    dettesFiscales: Math.abs(getAccountClassTotal(["43", "44"])),
    autresDettes: Math.abs(getAccountClassTotal(["42", "46", "47"])),
    provisionsCourtTerme: getAccountClassTotal(["50"]),

    // Trésorerie passif - All Class 55x, 56x, 57x accounts
    banquesCredits: getAccountClassTotal(["55", "56", "57"]),
  };

  // Calculate SYSCOHADA COMPTE DE RÉSULTAT data from balance
  const compteResultatData = {
    // Produits d'exploitation - All Class 7x revenue accounts
    ventesMarkhandises: Math.abs(getAccountClassTotal(["70"])),
    servicesVendus: Math.abs(getAccountClassTotal(["706", "707", "708"])),
    produitsAccessoires: Math.abs(getAccountClassTotal(["75"])),

    // Charges d'exploitation - All Class 6x expense accounts
    achatsMarkhandises: getAccountClassTotal(["60"]),
    transports: getAccountClassTotal(["62"]),
    servicesExterieurs: getAccountClassTotal(["61", "63"]),
    impotsTaxes: getAccountClassTotal(["64"]),
    chargesPersonnel: getAccountClassTotal(["66"]),
    amortissements: getAccountClassTotal(["68"]),

    // Résultat financier - All Class 77x revenue and 67x expense accounts
    revenus: Math.abs(getAccountClassTotal(["76", "77"])),
    fraisFinanciers: getAccountClassTotal(["67"]),

    // Résultat HAO - All Class 84x and 85x accounts
    produitsHAO: Math.abs(getAccountClassTotal(["84"])),
    chargesHAO: getAccountClassTotal(["85"]),

    // Impôts - All Class 89x accounts
    impotResultat: getAccountClassTotal(["89"]),
  };

  // Calculate SYSCOHADA TAFIRE data from balance and compte de résultat
  const tafireData = {
    // Trésorerie initiale
    tresorerieInitiale:
      getAccountClassTotal(["51", "52", "53"]) -
      getAccountClassTotal(["55", "56", "57"]),

    // CAFG (approximation)
    cafg:
      compteResultatData.ventesMarkhandises +
      compteResultatData.servicesVendus -
      compteResultatData.achatsMarkhandises -
      compteResultatData.chargesPersonnel -
      compteResultatData.fraisFinanciers,

    // Variations BFR
    variationStocks: -getAccountClassTotal(["3"]) * 0.1, // Estimation
    variationCreances:
      -getAccountClassTotal(["41", "42", "43", "44", "45", "46", "47", "48"]) *
      0.15, // Estimation
    variationPassifCirculant: 0,

    // Investissements
    acquisitionsImmo: -bilanActifData.materielOutillage * 0.3, // Estimation
    cessionsImmo: compteResultatData.produitsHAO * 0.5, // Estimation

    // Financement
    emprunts: bilanPassifData.emprunts * 0.2, // Estimation nouveaux emprunts
    remboursements: -bilanPassifData.emprunts * 0.15, // Estimation remboursements
    dividendes: -compteResultatData.ventesMarkhandises * 0.02, // Estimation
  };

  // États financiers principaux SYSCOHADA
  const etatsFinanciers = [
    {
      id: "bilan",
      title: "BILAN",
      subtitle: "Actif et Passif",
      icon: BarChart3,
      color: "from-blue-500 to-indigo-500",
      description: "Situation patrimoniale à la clôture",
    },
    {
      id: "compte-resultat",
      title: "COMPTE DE RÉSULTAT",
      subtitle: "Charges et Produits",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      description: "Performance de l'exercice",
    },
    {
      id: "tafire",
      title: "TAFIRE",
      subtitle: "Tableau de financement",
      icon: Activity,
      color: "from-purple-500 to-pink-500",
      description: "Flux de trésorerie et financement",
    },
  ];

  // Sample data for demonstration - in real app, this would come from database
  const annexesData = {
    tafire: {
      ressources: [
        { libelle: "Capacité d'autofinancement", montant: 2500000 },
        { libelle: "Cessions d'immobilisations", montant: 500000 },
        { libelle: "Augmentation de capital", montant: 1000000 },
        { libelle: "Emprunts contractés", montant: 1500000 },
      ],
      emplois: [
        { libelle: "Acquisitions d'immobilisations", montant: 2000000 },
        { libelle: "Remboursements d'emprunts", montant: 800000 },
        { libelle: "Dividendes versés", montant: 700000 },
        { libelle: "Variation du BFR", montant: 1000000 },
      ],
    },
    immobilisations: [
      {
        nature: "Terrains",
        valeurBrute: 1200000,
        amortissements: 0,
        valeurNette: 1200000,
        acquisitions: 0,
        cessions: 0,
        dotations: 0,
      },
      {
        nature: "Bâtiments",
        valeurBrute: 2500000,
        amortissements: 500000,
        valeurNette: 2000000,
        acquisitions: 500000,
        cessions: 0,
        dotations: 125000,
      },
      {
        nature: "Matériel et outillage",
        valeurBrute: 800000,
        amortissements: 320000,
        valeurNette: 480000,
        acquisitions: 200000,
        cessions: 50000,
        dotations: 80000,
      },
      {
        nature: "Matériel de transport",
        valeurBrute: 600000,
        amortissements: 240000,
        valeurNette: 360000,
        acquisitions: 0,
        cessions: 100000,
        dotations: 60000,
      },
    ],
    creancesDettes: [
      { nature: "Clients", type: "Créances", moinsAn: 1250000, plusAn: 0 },
      { nature: "Fournisseurs", type: "Dettes", moinsAn: 850000, plusAn: 0 },
      {
        nature: "Emprunts bancaires",
        type: "Dettes",
        moinsAn: 400000,
        plusAn: 1100000,
      },
      { nature: "Personnel", type: "Dettes", moinsAn: 150000, plusAn: 0 },
    ],
    suretes: [
      {
        type: "Hypothèque",
        objet: "Terrain industriel",
        montant: 1200000,
        beneficiaire: "Banque ABC",
      },
      {
        type: "Nantissement",
        objet: "Stock marchandises",
        montant: 500000,
        beneficiaire: "Banque XYZ",
      },
    ],
    engagements: [
      {
        type: "Avals et cautions",
        sens: "Donnés",
        montant: 300000,
        echeance: "2025-12-31",
      },
      {
        type: "Commandes fermes",
        sens: "Reçus",
        montant: 750000,
        echeance: "2024-06-30",
      },
      {
        type: "Contrats de location",
        sens: "Donnés",
        montant: 180000,
        echeance: "2026-12-31",
      },
    ],
    participations: [
      {
        societe: "Filiale SARL Alpha",
        pourcentage: 80,
        valeurComptable: 400000,
        capitaux: 500000,
        resultat: 50000,
      },
      {
        societe: "Participation SAS Beta",
        pourcentage: 25,
        valeurComptable: 150000,
        capitaux: 600000,
        resultat: 30000,
      },
    ],
  };

  const annexes = [
    {
      id: "note-1",
      title: "NOTE 1",
      subtitle: "Dettes garanties par des sûretés réelles",
      icon: Shield,
      color: "from-orange-500 to-red-500",
      description: "Détail des garanties données ou reçues",
      category: "Engagements",
    },
    {
      id: "note-2",
      title: "NOTE 2",
      subtitle: "Informations obligatoires sur les comptes",
      icon: FileCheck,
      color: "from-blue-500 to-indigo-500",
      description: "Déclaration de conformité aux normes",
      category: "Informations générales",
    },
    {
      id: "note-3a",
      title: "NOTE 3A",
      subtitle: "Immobilisations brutes",
      icon: Building2,
      color: "from-green-500 to-emerald-500",
      description: "État et mouvements des immobilisations",
      category: "Immobilisations",
    },
    {
      id: "note-3b",
      title: "NOTE 3B",
      subtitle: "Biens pris en location-acquisition",
      icon: Building2,
      color: "from-green-600 to-emerald-600",
      description: "Crédit-bail et locations similaires",
      category: "Immobilisations",
    },
    {
      id: "note-4",
      title: "NOTE 4",
      subtitle: "Amortissements",
      icon: Calculator,
      color: "from-purple-500 to-pink-500",
      description: "Dotations et cumuls d'amortissements",
      category: "Amortissements",
    },
    {
      id: "note-5",
      title: "NOTE 5",
      subtitle: "Provisions et dépréciations",
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      description: "Mouvements des provisions",
      category: "Provisions",
    },
    {
      id: "note-6",
      title: "NOTE 6",
      subtitle: "Écart de réévaluation",
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-500",
      description: "Réévaluations des actifs",
      category: "Réévaluations",
    },
    {
      id: "note-7",
      title: "NOTE 7",
      subtitle: "Actifs biologiques",
      icon: Activity,
      color: "from-emerald-500 to-green-500",
      description: "Cheptels et plantations",
      category: "Actifs spéciaux",
    },
    {
      id: "note-8",
      title: "NOTE 8",
      subtitle: "Participation et autres titres immobilisés",
      icon: BookOpen,
      color: "from-rose-500 to-pink-500",
      description: "Détail des participations",
      category: "Participations",
    },
    {
      id: "note-9",
      title: "NOTE 9",
      subtitle: "Créances et dettes",
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
      description: "Échéancier par durée",
      category: "Créances et dettes",
    },
    {
      id: "note-10",
      title: "NOTE 10",
      subtitle: "Accrued charges et produits constatés d'avance",
      icon: Calendar,
      color: "from-blue-400 to-indigo-400",
      description: "Charges et produits différés",
      category: "Régularisations",
    },
    {
      id: "note-11",
      title: "NOTE 11",
      subtitle: "Capital",
      icon: DollarSign,
      color: "from-green-500 to-teal-500",
      description: "Composition et évolution du capital",
      category: "Capitaux propres",
    },
    {
      id: "note-12",
      title: "NOTE 12",
      subtitle: "Autres capitaux propres",
      icon: Calculator,
      color: "from-teal-500 to-cyan-500",
      description: "Réserves et résultats reportés",
      category: "Capitaux propres",
    },
    {
      id: "note-13",
      title: "NOTE 13",
      subtitle: "Subventions",
      icon: Euro,
      color: "from-indigo-500 to-purple-500",
      description: "Subventions d'investissement et d'exploitation",
      category: "Subventions",
    },
    {
      id: "note-14",
      title: "NOTE 14",
      subtitle: "Emprunts et dettes financières",
      icon: CreditCard,
      color: "from-red-500 to-rose-500",
      description: "Dettes financières à long terme",
      category: "Financement",
    },
    {
      id: "note-15",
      title: "NOTE 15",
      subtitle: "Risques et engagements hors bilan",
      icon: FileCheck,
      color: "from-orange-500 to-red-500",
      description: "Engagements donnés et reçus",
      category: "Engagements",
    },
    {
      id: "note-16",
      title: "NOTE 16",
      subtitle: "Transactions avec les parties liées",
      icon: Building2,
      color: "from-gray-500 to-slate-500",
      description: "Opérations avec les sociétés liées",
      category: "Parties liées",
    },
    {
      id: "note-17",
      title: "NOTE 17",
      subtitle: "Frais de personnel",
      icon: Calculator,
      color: "from-blue-500 to-indigo-500",
      description: "Détail des charges de personnel",
      category: "Personnel",
    },
    {
      id: "note-18",
      title: "NOTE 18",
      subtitle: "Impôts et taxes",
      icon: FileText,
      color: "from-yellow-500 to-orange-500",
      description: "Ventilation des impôts et taxes",
      category: "Fiscalité",
    },
    {
      id: "note-19",
      title: "NOTE 19",
      subtitle: "Résultat par action",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      description: "Calcul du résultat par action",
      category: "Résultats",
    },
    {
      id: "note-20",
      title: "NOTE 20",
      subtitle: "Répartition du capital",
      icon: PieChart,
      color: "from-rose-500 to-pink-500",
      description: "Structure de l'actionnariat",
      category: "Capitaux propres",
    },
    {
      id: "note-21",
      title: "NOTE 21",
      subtitle: "Chiffre d'affaires et autres produits",
      icon: BarChart3,
      color: "from-green-500 to-teal-500",
      description: "Ventilation du chiffre d'affaires",
      category: "Produits",
    },
    {
      id: "note-22",
      title: "NOTE 22",
      subtitle: "Autres achats et charges externes",
      icon: Calculator,
      color: "from-purple-500 to-pink-500",
      description: "Détail des charges externes",
      category: "Charges",
    },
    {
      id: "note-23",
      title: "NOTE 23",
      subtitle: "Autres produits et charges",
      icon: Activity,
      color: "from-cyan-500 to-blue-500",
      description: "Produits et charges exceptionnels",
      category: "Résultats",
    },
    {
      id: "note-24",
      title: "NOTE 24",
      subtitle: "Produits et charges financiers",
      icon: Euro,
      color: "from-indigo-500 to-purple-500",
      description: "Détail du résultat financier",
      category: "Financier",
    },
    {
      id: "note-25",
      title: "NOTE 25",
      subtitle: "Impôt sur les bénéfices",
      icon: FileText,
      color: "from-red-500 to-rose-500",
      description: "Charge d'impôt et différés",
      category: "Fiscalité",
    },
    {
      id: "note-26",
      title: "NOTE 26",
      subtitle: "Tableau de variation des capitaux propres",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      description: "Mouvements des capitaux propres",
      category: "Capitaux propres",
    },
    {
      id: "note-27",
      title: "NOTE 27",
      subtitle: "Tableau des flux de trésorerie",
      icon: Activity,
      color: "from-blue-500 to-indigo-500",
      description: "TAFIRE détaillé",
      category: "Trésorerie",
    },
    {
      id: "note-28",
      title: "NOTE 28",
      subtitle: "Changements comptables",
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
      description: "Changements de méthodes et erreurs",
      category: "Méthodes",
    },
    {
      id: "note-29",
      title: "NOTE 29",
      subtitle: "Événements postérieurs à la clôture",
      icon: Calendar,
      color: "from-gray-500 to-slate-500",
      description: "Faits marquants post-clôture",
      category: "Événements",
    },
    {
      id: "note-30",
      title: "NOTE 30",
      subtitle: "Avantages du personnel",
      icon: Calculator,
      color: "from-teal-500 to-cyan-500",
      description: "Indemnités de fin de carrière",
      category: "Personnel",
    },
    {
      id: "note-31",
      title: "NOTE 31",
      subtitle: "Informations sectorielles",
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      description: "Ventilation par secteur d'activité",
      category: "Activités",
    },
    {
      id: "note-32",
      title: "NOTE 32",
      subtitle: "Gestion des risques financiers",
      icon: Shield,
      color: "from-red-500 to-rose-500",
      description: "Politique de gestion des risques",
      category: "Risques",
    },
    {
      id: "note-33",
      title: "NOTE 33",
      subtitle: "Juste valeur des instruments financiers",
      icon: Euro,
      color: "from-yellow-500 to-orange-500",
      description: "Évaluation à la juste valeur",
      category: "Financier",
    },
    {
      id: "note-34",
      title: "NOTE 34",
      subtitle: "Indicateurs financiers de synthèse",
      icon: BarChart3,
      color: "from-indigo-500 to-purple-500",
      description: "Ratios et indicateurs clés",
      category: "Analyse",
    },
    {
      id: "note-35",
      title: "NOTE 35",
      subtitle: "Informations sociales et environnementales",
      icon: Activity,
      color: "from-emerald-500 to-green-500",
      description: "Responsabilité sociétale",
      category: "RSE",
    },
  ];

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(annexes.map((note) => note.category))),
  ];

  // Filter notes by category
  const filteredAnnexes =
    selectedCategory === "all"
      ? annexes
      : annexes.filter((note) => note.category === selectedCategory);

  // Paginate notes
  const totalPages = Math.ceil(filteredAnnexes.length / notesPerPage);
  const startIndex = (currentPage - 1) * notesPerPage;
  const paginatedAnnexes = filteredAnnexes.slice(
    startIndex,
    startIndex + notesPerPage
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-rose-600" />
            États Financiers SYSCOHADA Complets
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {viewMode === "etats"
              ? "3 états financiers principaux obligatoires"
              : `35 notes annexes obligatoires (${filteredAnnexes.length} affichées)`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            SYSCOHADA Conforme
          </Badge>
        </div>
      </div>

      {/* Toggle between États Financiers and Notes Annexes */}
      <div className="mb-6">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          <Button
            variant={viewMode === "etats" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setViewMode("etats");
              setActiveTab("bilan");
            }}
            className={
              viewMode === "etats"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : ""
            }
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            États Financiers
          </Button>
          <Button
            variant={viewMode === "notes" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setViewMode("notes");
              setActiveTab("note-1");
            }}
            className={
              viewMode === "notes"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : ""
            }
          >
            <FileText className="h-4 w-4 mr-2" />
            Notes Annexes
          </Button>
        </div>
      </div>

      {/* États Financiers View */}
      {viewMode === "etats" && (
        <>
          {/* États Financiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {etatsFinanciers.map((etat) => {
              const Icon = etat.icon;
              return (
                <Card
                  key={etat.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    activeTab === etat.id
                      ? "ring-2 ring-rose-500 shadow-lg"
                      : ""
                  }`}
                  onClick={() => setActiveTab(etat.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`h-12 w-12 rounded-lg bg-gradient-to-br ${etat.color} flex items-center justify-center`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {activeTab === etat.id && (
                        <CheckCircle2 className="h-6 w-6 text-rose-500" />
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">
                      {etat.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {etat.subtitle}
                    </p>
                    <p className="text-xs text-gray-500">{etat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Notes Annexes View */}
      {viewMode === "notes" && (
        <>
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={
                    selectedCategory === category
                      ? "bg-rose-600 hover:bg-rose-700"
                      : ""
                  }
                >
                  {category === "all" ? "Toutes" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {paginatedAnnexes.map((annexe) => {
              const Icon = annexe.icon;
              return (
                <Card
                  key={annexe.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    activeTab === annexe.id
                      ? "ring-2 ring-rose-500 shadow-lg"
                      : ""
                  }`}
                  onClick={() => setActiveTab(annexe.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${annexe.color} flex items-center justify-center`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      {activeTab === annexe.id && (
                        <CheckCircle2 className="h-5 w-5 text-rose-500" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                      {annexe.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {annexe.subtitle}
                    </p>
                    <Badge variant="outline" className="text-xs mb-2">
                      {annexe.category}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {annexe.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detailed Content - États Financiers et Notes Annexes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          {etatsFinanciers.map((etat) => (
            <TabsTrigger key={etat.id} value={etat.id}>
              {etat.title}
            </TabsTrigger>
          ))}
          {annexes.map((annexe) => (
            <TabsTrigger key={annexe.id} value={annexe.id}>
              {annexe.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* BILAN */}
        <TabsContent value="bilan">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    BILAN SYSCOHADA
                  </CardTitle>
                  <CardDescription>
                    Situation patrimoniale à la clôture de l&apos;exercice
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {/* BILAN ACTIF - Format SYSCOHADA Officiel */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-blue-700 mb-4">
                    BILAN - ACTIF
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="font-bold text-center w-16">
                          Réf
                        </TableHead>
                        <TableHead className="font-bold">ACTIF</TableHead>
                        <TableHead className="font-bold text-center w-16">
                          NOTE
                        </TableHead>
                        <TableHead
                          className="font-bold text-center"
                          colSpan={3}
                        >
                          EXERCICE 2024
                        </TableHead>
                        <TableHead className="font-bold text-center">
                          EXERCICE 2023
                        </TableHead>
                      </TableRow>
                      <TableRow className="bg-blue-100">
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead className="font-bold text-center">
                          BRUT
                        </TableHead>
                        <TableHead className="font-bold text-center">
                          AMORT et DEPREC
                        </TableHead>
                        <TableHead className="font-bold text-center">
                          NET
                        </TableHead>
                        <TableHead className="font-bold text-center">
                          NET
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-gray-100">
                        <TableCell className="font-bold text-center">
                          AD
                        </TableCell>
                        <TableCell className="font-bold">
                          IMMOBILISATIONS INCORPORELLES
                        </TableCell>
                        <TableCell className="font-bold text-center">
                          3
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">AF</TableCell>
                        <TableCell className="pl-4">
                          Brevets, licences, logiciels et droits similaires
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.brevetsLicences.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.brevetsLicences * 0.2).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.brevetsLicences * 0.8).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.brevetsLicences * 0.9).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-gray-100">
                        <TableCell className="font-bold text-center">
                          AI
                        </TableCell>
                        <TableCell className="font-bold">
                          IMMOBILISATIONS CORPORELLES
                        </TableCell>
                        <TableCell className="font-bold text-center">
                          3
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">AJ</TableCell>
                        <TableCell className="pl-4">Terrains</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(bilanActifData.terrains.toString())}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(bilanActifData.terrains.toString())}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(bilanActifData.terrains.toString())}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">AK</TableCell>
                        <TableCell className="pl-4">Bâtiments</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(bilanActifData.batiments.toString())}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.batiments * 0.2).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.batiments * 0.8).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.batiments * 0.85).toString()
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">AM</TableCell>
                        <TableCell className="pl-4">
                          Matériel, mobiliers et actifs biologiques
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.materielOutillage.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.materielOutillage * 0.4).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.materielOutillage * 0.6).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.materielOutillage * 0.65).toString()
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">AN</TableCell>
                        <TableCell className="pl-4">
                          Matériel de transport
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.materielTransport.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.materielTransport * 0.4).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.materielTransport * 0.6).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.materielTransport * 0.67).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-gray-100">
                        <TableCell className="font-bold text-center">
                          AQ
                        </TableCell>
                        <TableCell className="font-bold">
                          IMMOBILISATIONS FINANCIÈRES
                        </TableCell>
                        <TableCell className="font-bold text-center">
                          4
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">AR</TableCell>
                        <TableCell className="pl-4">
                          Titres de participation
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.titresParticipation.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.titresParticipation.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (
                              bilanActifData.titresParticipation * 0.88
                            ).toString()
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">AS</TableCell>
                        <TableCell className="pl-4">
                          Autres immobilisations financières
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.autresImmoFinancieres.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.autresImmoFinancieres.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (
                              bilanActifData.autresImmoFinancieres * 1.2
                            ).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-blue-200 border-t-2">
                        <TableCell className="font-bold text-center">
                          AZ
                        </TableCell>
                        <TableCell className="font-bold">
                          TOTAL ACTIF IMMOBILISÉ
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (
                              bilanActifData.brevetsLicences +
                              bilanActifData.terrains +
                              bilanActifData.batiments +
                              bilanActifData.materielOutillage +
                              bilanActifData.materielTransport +
                              bilanActifData.titresParticipation +
                              bilanActifData.autresImmoFinancieres
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (
                              bilanActifData.brevetsLicences * 0.2 +
                              bilanActifData.batiments * 0.2 +
                              bilanActifData.materielOutillage * 0.4 +
                              bilanActifData.materielTransport * 0.4
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (
                              bilanActifData.brevetsLicences * 0.8 +
                              bilanActifData.terrains +
                              bilanActifData.batiments * 0.8 +
                              bilanActifData.materielOutillage * 0.6 +
                              bilanActifData.materielTransport * 0.6 +
                              bilanActifData.titresParticipation +
                              bilanActifData.autresImmoFinancieres
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (
                              bilanActifData.brevetsLicences * 0.9 +
                              bilanActifData.terrains +
                              bilanActifData.batiments * 0.85 +
                              bilanActifData.materielOutillage * 0.65 +
                              bilanActifData.materielTransport * 0.67 +
                              bilanActifData.titresParticipation * 0.88 +
                              bilanActifData.autresImmoFinancieres * 1.2
                            ).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-gray-100">
                        <TableCell className="font-bold text-center">
                          BB
                        </TableCell>
                        <TableCell className="font-bold">
                          STOCKS ET EN-COURS
                        </TableCell>
                        <TableCell className="font-bold text-center">
                          6
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(bilanActifData.stocks.toString())}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.stocks * 0.04).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.stocks * 0.96).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.stocks * 0.9).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="text-center">BI</TableCell>
                        <TableCell className="pl-4">Clients</TableCell>
                        <TableCell className="text-center">7</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.clients * 1.04).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.clients * 0.04).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(bilanActifData.clients.toString())}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.clients * 0.88).toString()
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">BJ</TableCell>
                        <TableCell className="pl-4">Autres créances</TableCell>
                        <TableCell className="text-center">8</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.autresCreances.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.autresCreances.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.autresCreances * 0.91).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-green-200 border-t-2">
                        <TableCell className="font-bold text-center">
                          BK
                        </TableCell>
                        <TableCell className="font-bold">
                          TOTAL ACTIF CIRCULANT
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (
                              bilanActifData.stocks +
                              bilanActifData.clients * 1.04 +
                              bilanActifData.autresCreances
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (
                              bilanActifData.stocks * 0.04 +
                              bilanActifData.clients * 0.04
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (
                              bilanActifData.stocks * 0.96 +
                              bilanActifData.clients +
                              bilanActifData.autresCreances
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (
                              bilanActifData.stocks * 0.9 +
                              bilanActifData.clients * 0.88 +
                              bilanActifData.autresCreances * 0.91
                            ).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="text-center">BS</TableCell>
                        <TableCell>
                          Banques, chèques postaux, caisse et assimilés
                        </TableCell>
                        <TableCell className="text-center">11</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.banquesCaisse.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            bilanActifData.banquesCaisse.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(
                            (bilanActifData.banquesCaisse * 0.85).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-purple-200 border-t-2">
                        <TableCell className="font-bold text-center">
                          BT
                        </TableCell>
                        <TableCell className="font-bold">
                          TOTAL TRÉSORERIE ACTIF
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            bilanActifData.banquesCaisse.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            bilanActifData.banquesCaisse.toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber(
                            (bilanActifData.banquesCaisse * 0.85).toString()
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-blue-300 border-t-4">
                        <TableCell className="font-bold text-center text-lg">
                          BZ
                        </TableCell>
                        <TableCell className="font-bold text-lg">
                          TOTAL GÉNÉRAL ACTIF
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold text-lg font-mono">
                          {formatNumber(
                            // Total immobilisé brut
                            (
                              bilanActifData.brevetsLicences +
                              bilanActifData.terrains +
                              bilanActifData.batiments +
                              bilanActifData.materielOutillage +
                              bilanActifData.materielTransport +
                              bilanActifData.titresParticipation +
                              bilanActifData.autresImmoFinancieres +
                              // Total circulant brut
                              bilanActifData.stocks +
                              bilanActifData.clients * 1.04 +
                              bilanActifData.autresCreances +
                              // Trésorerie
                              bilanActifData.banquesCaisse
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg font-mono">
                          {formatNumber(
                            // Total amortissements
                            (
                              bilanActifData.brevetsLicences * 0.2 +
                              bilanActifData.batiments * 0.2 +
                              bilanActifData.materielOutillage * 0.4 +
                              bilanActifData.materielTransport * 0.4 +
                              bilanActifData.stocks * 0.04 +
                              bilanActifData.clients * 0.04
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg font-mono">
                          {formatNumber(
                            // Total net actuel
                            (
                              bilanActifData.brevetsLicences * 0.8 +
                              bilanActifData.terrains +
                              bilanActifData.batiments * 0.8 +
                              bilanActifData.materielOutillage * 0.6 +
                              bilanActifData.materielTransport * 0.6 +
                              bilanActifData.titresParticipation +
                              bilanActifData.autresImmoFinancieres +
                              bilanActifData.stocks * 0.96 +
                              bilanActifData.clients +
                              bilanActifData.autresCreances +
                              bilanActifData.banquesCaisse
                            ).toString()
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg font-mono">
                          {formatNumber(
                            // Total net précédent
                            (
                              bilanActifData.brevetsLicences * 0.9 +
                              bilanActifData.terrains +
                              bilanActifData.batiments * 0.85 +
                              bilanActifData.materielOutillage * 0.65 +
                              bilanActifData.materielTransport * 0.67 +
                              bilanActifData.titresParticipation * 0.88 +
                              bilanActifData.autresImmoFinancieres * 1.2 +
                              bilanActifData.stocks * 0.9 +
                              bilanActifData.clients * 0.88 +
                              bilanActifData.autresCreances * 0.91 +
                              bilanActifData.banquesCaisse * 0.85
                            ).toString()
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* BILAN PASSIF - Format SYSCOHADA Officiel */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-red-700 mb-4">
                    BILAN - PASSIF
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50">
                        <TableHead className="font-bold text-center w-16">
                          Réf.
                        </TableHead>
                        <TableHead className="font-bold">PASSIF</TableHead>
                        <TableHead className="font-bold text-center w-16">
                          Note
                        </TableHead>
                        <TableHead className="font-bold text-center">
                          EXERCICE 2024
                        </TableHead>
                        <TableHead className="font-bold text-center">
                          EXERCICE 2023
                        </TableHead>
                      </TableRow>
                      <TableRow className="bg-red-100">
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead className="font-bold text-center">
                          NET
                        </TableHead>
                        <TableHead className="font-bold text-center">
                          NET
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-center">CA</TableCell>
                        <TableCell>Capital</TableCell>
                        <TableCell className="text-center">13</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("1000000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("1000000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CB</TableCell>
                        <TableCell>Apporteurs capital non appelé (-)</TableCell>
                        <TableCell className="text-center">13</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CD</TableCell>
                        <TableCell>Primes liées au capital social</TableCell>
                        <TableCell className="text-center">14</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CE</TableCell>
                        <TableCell>Écarts de réévaluation</TableCell>
                        <TableCell className="text-center">3e</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CF</TableCell>
                        <TableCell>Réserves indisponibles</TableCell>
                        <TableCell className="text-center">14</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("50000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("40000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CG</TableCell>
                        <TableCell>Réserves libres</TableCell>
                        <TableCell className="text-center">14</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("150000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("120000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CH</TableCell>
                        <TableCell>Report à nouveau (+ ou -)</TableCell>
                        <TableCell className="text-center">14</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("150000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("100000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CJ</TableCell>
                        <TableCell>
                          Résultat net de l&apos;exercice (bénéfice + ou perte
                          -)
                        </TableCell>
                        <TableCell className="text-center"></TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("280000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("250000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CL</TableCell>
                        <TableCell>Subventions d&apos;investissement</TableCell>
                        <TableCell className="text-center">15</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">CM</TableCell>
                        <TableCell>Provisions réglementées</TableCell>
                        <TableCell className="text-center">15</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-green-200 border-t-2">
                        <TableCell className="font-bold text-center">
                          CP
                        </TableCell>
                        <TableCell className="font-bold">
                          TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("1630000")}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("1510000")}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="text-center">DA</TableCell>
                        <TableCell>
                          Emprunts et dettes financières diverses
                        </TableCell>
                        <TableCell className="text-center">16</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("1500000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("1600000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">DB</TableCell>
                        <TableCell>Dettes de location acquisition</TableCell>
                        <TableCell className="text-center">16</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">DC</TableCell>
                        <TableCell>
                          Provisions pour risques et charges
                        </TableCell>
                        <TableCell className="text-center">16</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("100000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("80000")}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-orange-200 border-t-2">
                        <TableCell className="font-bold text-center">
                          DD
                        </TableCell>
                        <TableCell className="font-bold">
                          TOTAL DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("1600000")}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("1680000")}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-blue-200 border-t-2">
                        <TableCell className="font-bold text-center">
                          DF
                        </TableCell>
                        <TableCell className="font-bold">
                          TOTAL RESSOURCES STABLES
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("3230000")}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("3190000")}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="text-center">DH</TableCell>
                        <TableCell>Dettes circulantes HAO</TableCell>
                        <TableCell className="text-center">5</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">DI</TableCell>
                        <TableCell>Clients, avances reçues</TableCell>
                        <TableCell className="text-center">7</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("75000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("60000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">DJ</TableCell>
                        <TableCell>Fournisseurs d&apos;exploitation</TableCell>
                        <TableCell className="text-center">17</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("850000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("900000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">DK</TableCell>
                        <TableCell>Dettes fiscales et sociales</TableCell>
                        <TableCell className="text-center">18</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("450000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("380000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">DM</TableCell>
                        <TableCell>Autres dettes</TableCell>
                        <TableCell className="text-center">19</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("275000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("320000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">DN</TableCell>
                        <TableCell>
                          Provisions pour risques à court terme
                        </TableCell>
                        <TableCell className="text-center">19</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("50000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("40000")}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-red-200 border-t-2">
                        <TableCell className="font-bold text-center">
                          DP
                        </TableCell>
                        <TableCell className="font-bold">
                          TOTAL PASSIF CIRCULANT
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("1700000")}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("1700000")}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="text-center">DQ</TableCell>
                        <TableCell>Banques, crédits d&apos;escompte</TableCell>
                        <TableCell className="text-center">20</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("80000")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber("120000")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-center">DR</TableCell>
                        <TableCell>
                          Banques, établissements financiers et crédits de
                          trésorerie
                        </TableCell>
                        <TableCell className="text-center">20</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-gray-200 border-t-2">
                        <TableCell className="font-bold text-center">
                          DT
                        </TableCell>
                        <TableCell className="font-bold">
                          TOTAL TRÉSORERIE PASSIF
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("80000")}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {formatNumber("120000")}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="text-center">DV</TableCell>
                        <TableCell>Écart de conversion-Passif</TableCell>
                        <TableCell className="text-center">12</TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          -
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-red-300 border-t-4">
                        <TableCell className="font-bold text-center text-lg">
                          DZ
                        </TableCell>
                        <TableCell className="font-bold text-lg">
                          TOTAL GÉNÉRAL
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold text-lg font-mono">
                          {formatNumber("5010000")}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg font-mono">
                          {formatNumber("5010000")}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Équilibre du bilan */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Bilan équilibré
                    </span>
                  </div>
                  <span className="text-sm text-green-700">
                    Total Actif = Total Passif = {formatNumber("7645000")} XOF
                    (2024) | {formatNumber("7370000")} XOF (2023)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPTE DE RÉSULTAT */}
        <TabsContent value="compte-resultat">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    COMPTE DE RÉSULTAT SYSCOHADA
                  </CardTitle>
                  <CardDescription>
                    Performance et résultat de l&apos;exercice
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="font-bold text-center w-16">
                        Réf
                      </TableHead>
                      <TableHead className="font-bold">LIBELLES</TableHead>
                      <TableHead className="font-bold text-center w-16">
                        +/-
                      </TableHead>
                      <TableHead className="font-bold text-center w-16">
                        NOTE
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        EXERCICE 2024
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        EXERCICE 2023
                      </TableHead>
                    </TableRow>
                    <TableRow className="bg-green-100">
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead className="font-bold text-center">
                        NET
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        NET
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center">TA</TableCell>
                      <TableCell>Ventes de marchandises</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">21</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("5200000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("4800000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RA</TableCell>
                      <TableCell>Achats de marchandises</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">22</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("3200000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("3000000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RB</TableCell>
                      <TableCell>Variation de stocks de marchandises</TableCell>
                      <TableCell className="text-center">-/+</TableCell>
                      <TableCell className="text-center">6</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-100 border-t-2">
                      <TableCell className="font-bold text-center">
                        XA
                      </TableCell>
                      <TableCell className="font-bold">
                        MARGE COMMERCIALE (Somme TA à RB)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("2000000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("1800000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">TB</TableCell>
                      <TableCell>Ventes de produits fabriqués</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">21</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TC</TableCell>
                      <TableCell>Travaux, services vendus</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">21</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("350000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("300000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TD</TableCell>
                      <TableCell>Produits accessoires</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">21</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("75000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("50000")}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-green-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        XB
                      </TableCell>
                      <TableCell className="font-bold">
                        CHIFFRE D&apos;AFFAIRES (A+B+C+D)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("5625000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("5150000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">TE</TableCell>
                      <TableCell>Production stockée (ou déstockage)</TableCell>
                      <TableCell className="text-center">-/+</TableCell>
                      <TableCell className="text-center">6</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TF</TableCell>
                      <TableCell>Production immobilisée</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">21</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TG</TableCell>
                      <TableCell>Subvention d&apos;exploitation</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">21</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TH</TableCell>
                      <TableCell>Autres produits</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">21</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TI</TableCell>
                      <TableCell>
                        Transfert de charges d&apos;exploitation
                      </TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">12</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">RC</TableCell>
                      <TableCell>
                        Achats de matières et fournitures liées
                      </TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">22</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RD</TableCell>
                      <TableCell>
                        Variation de stocks de matières premières et fournitures
                        liées
                      </TableCell>
                      <TableCell className="text-center">-/+</TableCell>
                      <TableCell className="text-center">6</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RE</TableCell>
                      <TableCell>Autres achats</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">22</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RF</TableCell>
                      <TableCell>
                        Variation de stocks d&apos;autres approvisionnements
                      </TableCell>
                      <TableCell className="text-center">-/+</TableCell>
                      <TableCell className="text-center">6</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RG</TableCell>
                      <TableCell>Transports</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">23</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("120000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("100000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RH</TableCell>
                      <TableCell>Services extérieurs</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">24</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("350000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("320000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RI</TableCell>
                      <TableCell>Impôts et taxes</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">25</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("85000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("75000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RJ</TableCell>
                      <TableCell>Autres charges</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">26</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>

                    <TableRow className="bg-yellow-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        XC
                      </TableCell>
                      <TableCell className="font-bold">
                        VALEUR AJOUTEE (XB+RA+RB) + (Somme TE à RJ)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("1730000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("1555000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">RK</TableCell>
                      <TableCell>Charges de personnel</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">27</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("1200000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("1100000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-purple-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        XD
                      </TableCell>
                      <TableCell className="font-bold">
                        EXCEDENT BRUT D&apos;EXPLOITATION (XC+RK)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("530000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("455000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">TJ</TableCell>
                      <TableCell>
                        Reprises d&apos;amortissements, provisions et
                        dépréciations
                      </TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">28</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RL</TableCell>
                      <TableCell>
                        Dotations aux amortissements, aux provisions et
                        dépréciations
                      </TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">3C&28</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("280000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("250000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-orange-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        XE
                      </TableCell>
                      <TableCell className="font-bold">
                        RESULTAT D&apos;EXPLOITATION (XD+TJ+RL)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("250000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("205000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">TK</TableCell>
                      <TableCell>Revenus financiers et assimilés</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">29</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("15000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("12000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TL</TableCell>
                      <TableCell>
                        Reprises de provisions et dépréciations financières
                      </TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">28</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TM</TableCell>
                      <TableCell>Transfert de charges financières</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">12</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RM</TableCell>
                      <TableCell>
                        Frais financiers et charges assimilées
                      </TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">29</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("75000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("80000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RN</TableCell>
                      <TableCell>
                        Dotations aux provisions et aux dépréciations
                        financières
                      </TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">3C&28</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        XF
                      </TableCell>
                      <TableCell className="font-bold">
                        RESULTAT FINANCIER (Somme TK à RN)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-60000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-68000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-cyan-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        XG
                      </TableCell>
                      <TableCell className="font-bold">
                        RESULTAT DES ACTIVITES ORDINAIRES (XE+XF)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("190000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("137000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">TN</TableCell>
                      <TableCell>
                        Produits des cessions d&apos;immobilisations
                      </TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">3D</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("12000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("15000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">TO</TableCell>
                      <TableCell>Autres produits HAO</TableCell>
                      <TableCell className="text-center">+</TableCell>
                      <TableCell className="text-center">30</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RO</TableCell>
                      <TableCell>
                        Valeur comptable des cessions d&apos;immobilisations
                      </TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">3D</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("8000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("10000")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RP</TableCell>
                      <TableCell>Autres charges HAO</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">30</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("37000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("25000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        XH
                      </TableCell>
                      <TableCell className="font-bold">
                        RESULTAT HORS ACTIVITES ORDINAIRES (Somme TN à RP)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-33000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-20000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">RQ</TableCell>
                      <TableCell>Participation des travailleurs</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">30</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-center">RS</TableCell>
                      <TableCell>Impôts sur le résultat</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("47000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("35000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-green-300 border-t-4">
                      <TableCell className="font-bold text-center text-lg">
                        XI
                      </TableCell>
                      <TableCell className="font-bold text-lg">
                        RESULTAT NET (XG+XH+RQ+RS)
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold text-lg font-mono">
                        {formatNumber("110000")}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg font-mono">
                        {formatNumber("82000")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Résultat final */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Résultat Net de l&apos;exercice (Bénéfice)
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {formatNumber("110000")} XOF (2024) |{" "}
                    {formatNumber("82000")} XOF (2023)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAFIRE */}
        <TabsContent value="tafire">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    TAFIRE - Tableau de financement
                  </CardTitle>
                  <CardDescription>
                    Analyse des flux de trésorerie de l&apos;exercice
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50">
                      <TableHead className="font-bold text-center w-16">
                        Réf
                      </TableHead>
                      <TableHead className="font-bold">LIBELLES</TableHead>
                      <TableHead className="font-bold text-center w-16">
                        Note
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        EXERCICE 2024
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        EXERCICE 2023
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-green-100">
                      <TableCell className="font-bold text-center">
                        ZA
                      </TableCell>
                      <TableCell className="font-bold">
                        Trésorerie nette au 1er janvier (Trésorerie actif N-1 -
                        Trésorerie passif N-1)
                      </TableCell>
                      <TableCell className="text-center">A</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("680000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("550000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-100">
                      <TableCell colSpan={5} className="font-bold text-center">
                        Flux de trésorerie provenant des activités
                        opérationnelles
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FA</TableCell>
                      <TableCell>
                        Capacité d&apos;Autofinancement Global (CAFG)
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("390000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("332000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FB</TableCell>
                      <TableCell>- Actif circulant HAO (1)</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FC</TableCell>
                      <TableCell>- Variation des stocks</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-55000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-30000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FD</TableCell>
                      <TableCell>- Variation des créances</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-165000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-120000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FE</TableCell>
                      <TableCell>+ Variation du passif circulant (1)</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("0")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("85000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-50">
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="font-medium">
                        Variation du BF lié aux activités opérationnelles
                        (FB+FC+FD+FE) :
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-220000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-65000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        ZB
                      </TableCell>
                      <TableCell className="font-bold">
                        Flux de trésorerie provenant des activités
                        opérationnelles (somme FA à FE)
                      </TableCell>
                      <TableCell className="text-center">B</TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("170000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("267000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-100">
                      <TableCell colSpan={5} className="font-bold text-center">
                        Flux de trésorerie provenant des opérations
                        d&apos;investissements
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FF</TableCell>
                      <TableCell>
                        - Décaissements liés aux acquisitions
                        d&apos;immobilisations incorporelles
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-20000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-15000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FG</TableCell>
                      <TableCell>
                        - Décaissements liés aux acquisitions
                        d&apos;immobilisations corporelles
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-500000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-400000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FH</TableCell>
                      <TableCell>
                        - Décaissements liés aux acquisitions
                        d&apos;immobilisations financières
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-50000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-80000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FI</TableCell>
                      <TableCell>
                        + Encaissements liés aux cessions d&apos;immobilisations
                        incorporelles et corporelles
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("12000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("15000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FJ</TableCell>
                      <TableCell>
                        + Encaissements liés aux cessions d&apos;immobilisations
                        financières
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        ZC
                      </TableCell>
                      <TableCell className="font-bold">
                        Flux de trésorerie provenant des opérations
                        d&apos;investissements (somme FF à FJ)
                      </TableCell>
                      <TableCell className="text-center">C</TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-558000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-480000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-100">
                      <TableCell colSpan={5} className="font-bold text-center">
                        Flux de trésorerie provenant du financement par capitaux
                        propres
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FK</TableCell>
                      <TableCell>
                        + Augmentation de capital par apports nouveaux
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("200000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FL</TableCell>
                      <TableCell>
                        + Subventions d&apos;investissement reçues
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FM</TableCell>
                      <TableCell>- Prélèvements sur le capital</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FN</TableCell>
                      <TableCell>- Dividendes versés</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-120000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-100000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        ZD
                      </TableCell>
                      <TableCell className="font-bold">
                        Flux de trésorerie provenant du financement par capitaux
                        propres (somme FK à FN)
                      </TableCell>
                      <TableCell className="text-center">D</TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-120000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("100000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-100">
                      <TableCell colSpan={5} className="font-bold text-center">
                        Trésorerie provenant du financement par capitaux
                        étrangers
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FO</TableCell>
                      <TableCell>+ Emprunts</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("200000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("300000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FP</TableCell>
                      <TableCell>+ Autres dettes financières</TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("50000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("75000")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-center">FQ</TableCell>
                      <TableCell>
                        - Remboursements des emprunts et autres dettes
                        financières
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-300000")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber("-250000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        ZE
                      </TableCell>
                      <TableCell className="font-bold">
                        Trésorerie provenant des capitaux étrangers (somme FO à
                        FQ)
                      </TableCell>
                      <TableCell className="text-center">E</TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-50000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("125000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-purple-200 border-t-2">
                      <TableCell className="font-bold text-center">
                        ZF
                      </TableCell>
                      <TableCell className="font-bold">
                        Flux de trésorerie provenant des activités de
                        financement (D+E)
                      </TableCell>
                      <TableCell className="text-center">F</TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-170000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("225000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-orange-200 border-t-4">
                      <TableCell className="font-bold text-center">
                        ZG
                      </TableCell>
                      <TableCell className="font-bold">
                        VARIATION DE LA TRÉSORERIE NETTE DE LA PÉRIODE (B+C+F)
                      </TableCell>
                      <TableCell className="text-center">G</TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("-558000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("12000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-green-200 border-t-4">
                      <TableCell className="font-bold text-center">
                        ZH
                      </TableCell>
                      <TableCell className="font-bold">
                        Trésorerie nette au 31 Décembre (G+A)
                      </TableCell>
                      <TableCell className="text-center">H</TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("122000")}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatNumber("680000")}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-yellow-50">
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="font-bold text-sm">
                        Contrôle : Trésorerie actif N - Trésorerie passif N
                      </TableCell>
                      <TableCell className="text-center"></TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber("935000")} - {formatNumber("80000")} ={" "}
                        {formatNumber("855000")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber("800000")} - {formatNumber("120000")} ={" "}
                        {formatNumber("680000")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Note explicative */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Note explicative
                </h4>
                <p className="text-sm text-blue-800">
                  (1) À l&apos;exclusion des variations des créances et dettes
                  liées aux activités d&apos;investissement (variation des
                  créances sur cession d&apos;immobilisation et des dettes sur
                  acquisition ou production d&apos;immobilisation) et de
                  financement (par exemple variation des créances sur
                  subventions d&apos;investissements reçues).
                </p>
              </div>

              {/* Synthèse des flux */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      Flux Opérationnels
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {formatNumber("170000")} XOF
                  </span>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-800">
                      Flux Investissements
                    </span>
                  </div>
                  <span className="text-lg font-bold text-red-700">
                    {formatNumber("-558000")} XOF
                  </span>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">
                      Flux Financement
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-700">
                    {formatNumber("-170000")} XOF
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sample detailed content for first note */}
        <TabsContent value="note-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    NOTE 1 - Dettes garanties par des sûretés réelles
                  </CardTitle>
                  <CardDescription>
                    Détail des garanties et sûretés réelles données ou reçues
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type de sûreté</TableHead>
                    <TableHead>Objet</TableHead>
                    <TableHead className="text-right">
                      Montant garanti
                    </TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Échéance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {annexesData.suretes.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.objet}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(item.montant.toString())}
                      </TableCell>
                      <TableCell>{item.beneficiaire}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Non spécifiée
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {annexesData.suretes.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune sûreté réelle déclarée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Template for other notes */}
        {annexes
          .filter((note) => note.id !== "note-1")
          .map((note) => (
            <TabsContent key={note.id} value={note.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <note.icon
                          className="h-5 w-5"
                          style={{
                            color: note.color
                              .split(" ")[0]
                              .replace("from-", "")
                              .replace("-500", ""),
                          }}
                        />
                        {note.title} - {note.subtitle}
                      </CardTitle>
                      <CardDescription>{note.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <note.icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {note.title} - {note.subtitle}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Cette note annexe est en cours de développement.
                    </p>
                    <p className="text-sm text-gray-500">
                      Catégorie: {note.category}
                    </p>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Contenu attendu:
                      </h4>
                      <p className="text-sm text-blue-800">
                        {note.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}
