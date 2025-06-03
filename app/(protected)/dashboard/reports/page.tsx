"use client";

import { useState } from "react";
import { FileText, Download, Eye, Filter, Search } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const reports = [
    {
      id: 1,
      name: "Bilan Comptable",
      description: "État de la situation financière de l'entreprise",
      type: "Bilan",
      lastGenerated: "2024-01-15",
      company: "EtaFi Corp",
    },
    {
      id: 2,
      name: "Compte de Résultat",
      description: "Performance financière sur la période",
      type: "Compte de Résultat",
      lastGenerated: "2024-01-15",
      company: "EtaFi Corp",
    },
    {
      id: 3,
      name: "Flux de Trésorerie",
      description: "Mouvements de liquidités",
      type: "Flux de Trésorerie",
      lastGenerated: "2024-01-15",
      company: "EtaFi Corp",
    },
  ];

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in-up">
              <h1 className="etafi-section-header">États Financiers</h1>
              <p className="etafi-section-subtitle">
                Générez et consultez vos rapports financiers SYSCOHADA
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un rapport..."
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Tous les rapports</DropdownMenuItem>
              <DropdownMenuItem>Bilans</DropdownMenuItem>
              <DropdownMenuItem>Comptes de résultat</DropdownMenuItem>
              <DropdownMenuItem>Flux de trésorerie</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="etafi-card hover:shadow-lg transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <p className="text-sm text-gray-500">{report.company}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {report.description}
                </CardDescription>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {report.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Dernière génération:</span>{" "}
                    {new Date(report.lastGenerated).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun rapport trouvé
            </h3>
            <p className="text-gray-600">
              Aucun état financier ne correspond à vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
