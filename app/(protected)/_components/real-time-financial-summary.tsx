"use client";

import React from "react";
import { formatNumber } from "@/lib/utils";
import { useFinancialTotals } from "@/lib/stores/balance-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Activity,
  RefreshCw,
} from "lucide-react";

interface RealTimeFinancialSummaryProps {
  className?: string;
  showTitle?: boolean;
}

export default function RealTimeFinancialSummary({
  className = "",
  showTitle = true,
}: RealTimeFinancialSummaryProps) {
  const financialTotals = useFinancialTotals();

  const metrics = [
    {
      label: "Total Actif",
      value: financialTotals.totalActif,
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-500",
      change: "+2.1%",
    },
    {
      label: "Total Passif",
      value: financialTotals.totalPassif,
      icon: BarChart3,
      color: "from-emerald-500 to-teal-500",
      change: "+1.8%",
    },
    {
      label: "Résultat Net",
      value: financialTotals.resultatNet,
      icon: DollarSign,
      color:
        financialTotals.resultatNet >= 0
          ? "from-green-500 to-emerald-500"
          : "from-red-500 to-red-600",
      change: financialTotals.resultatNet >= 0 ? "+5.2%" : "-3.1%",
    },
    {
      label: "Flux de Trésorerie",
      value: financialTotals.fluxTresorerie,
      icon: Activity,
      color: "from-purple-500 to-pink-500",
      change: "+0.7%",
    },
  ];

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-rose-600" />
              États Financiers en Temps Réel
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Mise à jour automatique lors des modifications de la balance
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            En direct
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isNegative = metric.value < 0;

          return (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-sm bg-white hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {metric.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p
                        className={`text-2xl font-bold ${
                          isNegative ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {formatNumber(Math.abs(metric.value).toString())}
                      </p>
                      {isNegative && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className={`text-xs font-medium ${
                          metric.change.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {metric.change}
                      </span>
                      <span className="text-xs text-gray-500">
                        vs période précédente
                      </span>
                    </div>
                  </div>

                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>

              {/* Subtle border animation for real-time updates */}
              <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-rose-100 to-blue-100 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Card>
          );
        })}
      </div>

      {/* Balance status */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Équilibre Comptable
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Actif: {formatNumber(financialTotals.totalActif.toString())} XOF
            {" • "}
            Passif: {formatNumber(financialTotals.totalPassif.toString())} XOF
            {" • "}
            Écart:{" "}
            {formatNumber(
              Math.abs(
                financialTotals.totalActif - financialTotals.totalPassif
              ).toString()
            )}{" "}
            XOF
          </div>
        </div>
      </div>
    </div>
  );
}
