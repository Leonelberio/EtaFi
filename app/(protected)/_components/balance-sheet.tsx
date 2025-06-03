"use client";

import React, { useState, useEffect } from "react";
import { formatNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { Edit, Save, X, Check, Plus } from "lucide-react";
import {
  useBalanceStore,
  type BalanceData,
  useBalanceIsSaving,
} from "@/lib/stores/balance-store";
import RealTimeFinancialSummary from "@/app/(protected)/_components/real-time-financial-summary";

export default function BalanceSheet() {
  const { companyId, exerciceId } = useParams() as {
    companyId: string;
    exerciceId: string;
  };

  // Global state
  const { balance, updateBalanceRow, setLoading, lastUpdated } =
    useBalanceStore();
  const isSaving = useBalanceIsSaving();

  // Add sample data function
  const { addSampleData } = useBalanceStore();

  // Local editing state
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<BalanceData>>({});

  const handleEdit = (row: BalanceData) => {
    setEditingRow(row.accountNumber);
    setEditValues({
      account: row.account,
      debits: row.debits,
      credits: row.credits,
    });
  };

  const handleSave = () => {
    if (!editingRow) return;

    // Calculate new solde
    const debits = parseFloat(
      editValues.debits?.replace(/\s/g, "").replace(",", ".") || "0"
    );
    const credits = parseFloat(
      editValues.credits?.replace(/\s/g, "").replace(",", ".") || "0"
    );
    const solde = debits - credits;

    const updates = {
      ...editValues,
      solde: formatNumber(solde.toString()),
    };

    updateBalanceRow(editingRow, updates);
    setEditingRow(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditValues({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const calculateTotals = () => {
    let totalDebits = 0;
    let totalCredits = 0;
    let totalSolde = 0;

    balance.forEach((row) => {
      totalDebits +=
        parseFloat(row.debits.replace(/\s/g, "").replace(",", ".")) || 0;
      totalCredits +=
        parseFloat(row.credits.replace(/\s/g, "").replace(",", ".")) || 0;
      totalSolde +=
        parseFloat(row.solde.replace(/\s/g, "").replace(",", ".")) || 0;
    });

    return { totalDebits, totalCredits, totalSolde };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Real-time Financial Summary */}
      <RealTimeFinancialSummary />

      {/* Balance Sheet Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Balance Comptable
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Cliquez sur les cellules pour modifier • Appuyez sur Entrée pour
                sauvegarder • Échap pour annuler
              </p>
            </div>
            <div className="flex items-center gap-4">
              {balance.length === 0 && (
                <Button
                  onClick={addSampleData}
                  variant="outline"
                  size="sm"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Charger données d&apos;exemple
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Dernière mise à jour:{" "}
                {new Date(lastUpdated).toLocaleTimeString("fr-FR")}
                {isSaving && (
                  <span className="text-blue-600 font-medium">
                    • Sauvegarde en cours...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 w-32">
                  N° Compte
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    Intitulé du compte
                    <Edit className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-right w-32">
                  <div className="flex items-center justify-end gap-2">
                    Débits
                    <Edit className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-right w-32">
                  <div className="flex items-center justify-end gap-2">
                    Crédits
                    <Edit className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-right w-32">
                  Solde
                </TableHead>
                <TableHead className="font-semibold text-gray-900 w-24">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balance.map((row) => (
                <TableRow
                  key={row.accountNumber}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-mono text-sm font-medium">
                    {row.accountNumber}
                  </TableCell>

                  {/* Account Name - Editable */}
                  <TableCell>
                    {editingRow === row.accountNumber ? (
                      <Input
                        value={editValues.account || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            account: e.target.value,
                          })
                        }
                        onKeyDown={handleKeyPress}
                        className="border-rose-200 focus:border-rose-500"
                        autoFocus={editValues.account !== undefined}
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                        onClick={() => handleEdit(row)}
                      >
                        {row.account}
                      </div>
                    )}
                  </TableCell>

                  {/* Debits - Editable */}
                  <TableCell className="text-right">
                    {editingRow === row.accountNumber ? (
                      <Input
                        type="text"
                        value={editValues.debits || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            debits: e.target.value,
                          })
                        }
                        onKeyDown={handleKeyPress}
                        className="text-right border-rose-200 focus:border-rose-500"
                        placeholder="0"
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-right"
                        onClick={() => handleEdit(row)}
                      >
                        {row.debits}
                      </div>
                    )}
                  </TableCell>

                  {/* Credits - Editable */}
                  <TableCell className="text-right">
                    {editingRow === row.accountNumber ? (
                      <Input
                        type="text"
                        value={editValues.credits || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            credits: e.target.value,
                          })
                        }
                        onKeyDown={handleKeyPress}
                        className="text-right border-rose-200 focus:border-rose-500"
                        placeholder="0"
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-right"
                        onClick={() => handleEdit(row)}
                      >
                        {row.credits}
                      </div>
                    )}
                  </TableCell>

                  {/* Solde - Auto-calculated */}
                  <TableCell className="text-right font-medium">
                    {editingRow === row.accountNumber ? (
                      <div className="text-right p-2 bg-gray-50 rounded">
                        {(() => {
                          const debits =
                            parseFloat(
                              editValues.debits
                                ?.replace(/\s/g, "")
                                .replace(",", ".") ||
                                row.debits.replace(/\s/g, "").replace(",", ".")
                            ) || 0;
                          const credits =
                            parseFloat(
                              editValues.credits
                                ?.replace(/\s/g, "")
                                .replace(",", ".") ||
                                row.credits.replace(/\s/g, "").replace(",", ".")
                            ) || 0;
                          const solde = debits - credits;
                          return formatNumber(solde.toString());
                        })()}
                      </div>
                    ) : (
                      <span
                        className={
                          parseFloat(
                            row.solde.replace(/\s/g, "").replace(",", ".")
                          ) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {row.solde}
                      </span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    {editingRow === row.accountNumber ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(row)}
                        className="h-8 w-8 p-0 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals Row */}
              <TableRow className="bg-gray-50 font-semibold border-t-2">
                <TableCell colSpan={2} className="font-bold text-gray-900">
                  TOTAUX
                </TableCell>
                <TableCell className="text-right font-bold text-gray-900">
                  {formatNumber(totals.totalDebits.toString())}
                </TableCell>
                <TableCell className="text-right font-bold text-gray-900">
                  {formatNumber(totals.totalCredits.toString())}
                </TableCell>
                <TableCell className="text-right font-bold text-gray-900">
                  <span
                    className={
                      totals.totalSolde >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatNumber(totals.totalSolde.toString())}
                  </span>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
