"use client";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in-up">
            <h1 className="etafi-section-header">Analyses</h1>
            <p className="etafi-section-subtitle">
              Analysez les tendances et performances de vos entreprises
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chiffre d'Affaires
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 450 000 €</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +12.5% vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marge Brute</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28.4%</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +2.1% vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Charges</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1 756 000 €</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                -3.2% vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entreprises Actives
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +2 nouvelles ce mois
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card className="etafi-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Analyse de Rentabilité
              </CardTitle>
              <CardDescription>
                Performance financière par secteur d'activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Services IT</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-16"></div>
                    </div>
                    <span className="text-sm text-green-600">32%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Commerce</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-14"></div>
                    </div>
                    <span className="text-sm text-blue-600">28%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Manufacturing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full w-10"></div>
                    </div>
                    <span className="text-sm text-yellow-600">18%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="etafi-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Tendances Mensuelles
              </CardTitle>
              <CardDescription>
                Évolution des indicateurs clés sur 6 mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">📈</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Croissance continue du chiffre d&apos;affaires depuis 6 mois
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-600">+15%</p>
                    <p className="text-xs text-gray-500">Revenus</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">+8%</p>
                    <p className="text-xs text-gray-500">Marges</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">-5%</p>
                    <p className="text-xs text-gray-500">Coûts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="etafi-card mt-8">
          <CardHeader>
            <CardTitle>Recommandations</CardTitle>
            <CardDescription>
              Suggestions d'amélioration basées sur vos données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Optimisation des coûts</p>
                  <p className="text-sm text-gray-600">
                    Les charges administratives peuvent être réduites de 12% en
                    automatisant certains processus.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Diversification</p>
                  <p className="text-sm text-gray-600">
                    Le secteur IT montre une forte rentabilité. Considérez
                    d&apos;augmenter les investissements dans ce domaine.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Trésorerie</p>
                  <p className="text-sm text-gray-600">
                    Améliorez le délai de recouvrement clients pour optimiser
                    votre flux de trésorerie.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
