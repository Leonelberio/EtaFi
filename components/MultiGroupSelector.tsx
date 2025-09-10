"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Target,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface CostGroup {
  id?: string;
  costGroup: "M" | "S" | "D" | "E" | "MOD";
  percentage: number;
  glAccountId?: string;
  description?: string;
  isActive?: boolean;
}

interface ChartAccount {
  id: string;
  number: string;
  name: string;
  type: string;
}

interface MultiGroupSelectorProps {
  projectId: string;
  activityId?: string;
  initialGroups?: CostGroup[];
  chartAccounts: ChartAccount[];
  onGroupsChange?: (groups: CostGroup[]) => void;
  disabled?: boolean;
}

// Cost group definitions with enhanced UI
const COST_GROUPS = [
  {
    key: "M" as const,
    code: "M",
    name: "Matériel & Fournitures",
    icon: Package,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
    description: "Matières premières, fournitures, composants",
  },
  {
    key: "S" as const,
    code: "S",
    name: "Sous-traitance & Services",
    icon: Users,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    badgeColor: "bg-purple-100 text-purple-800",
    description: "Services externes, sous-traitants, consultants",
  },
  {
    key: "D" as const,
    code: "D",
    name: "Frais Généraux & Divers",
    icon: FileText,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
    description: "Frais administratifs, déplacements, divers",
  },
  {
    key: "E" as const,
    code: "E",
    name: "Équipement & Outillage",
    icon: Wrench,
    color: "bg-green-50 text-green-700 border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    description: "Machines, outils, équipements spécialisés",
  },
  {
    key: "MOD" as const,
    code: "MOD",
    name: "Main-d'œuvre Directe",
    icon: DollarSign,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeColor: "bg-indigo-100 text-indigo-800",
    description: "Salaires directs, charges sociales directes",
  },
] as const;

export function MultiGroupSelector({
  projectId,
  activityId,
  initialGroups = [],
  chartAccounts,
  onGroupsChange,
  disabled = false,
}: MultiGroupSelectorProps) {
  const [groups, setGroups] = useState<CostGroup[]>(initialGroups);
  const [isLoading, setIsLoading] = useState(false);
  const [projectCostCodes, setProjectCostCodes] = useState<any[]>([]);

  // Calculate total percentage
  const totalPercentage = groups.reduce(
    (sum, group) => sum + (Number(group.percentage) || 0),
    0
  );
  const isValid = Math.abs(totalPercentage - 100) < 0.01;

  // Load project cost group codes
  useEffect(() => {
    const fetchProjectCostCodes = async () => {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/cost-group-codes`
        );
        if (response.ok) {
          const data = await response.json();
          setProjectCostCodes(data.costGroupCodes || []);
        }
      } catch (error) {
        console.error("Error fetching project cost codes:", error);
      }
    };

    if (projectId) {
      fetchProjectCostCodes();
    }
  }, [projectId]);

  // Notify parent of changes
  useEffect(() => {
    onGroupsChange?.(groups);
  }, [groups, onGroupsChange]);

  const addGroup = (groupType: "M" | "S" | "D" | "E" | "MOD") => {
    if (groups.some((g) => g.costGroup === groupType)) {
      toast.error(`Le groupe ${groupType} est déjà ajouté`);
      return;
    }

    // Find default GL account for this group in project
    const defaultAccount = projectCostCodes.find(
      (code) => code.costGroup === groupType && code.isDefault
    );

    const newGroup: CostGroup = {
      costGroup: groupType,
      percentage: Math.max(0, 100 - totalPercentage),
      glAccountId: defaultAccount?.glAccountId,
      description: `${COST_GROUPS.find((g) => g.key === groupType)?.name}`,
      isActive: true,
    };

    setGroups([...groups, newGroup]);
  };

  const updateGroup = (index: number, updates: Partial<CostGroup>) => {
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], ...updates };
    setGroups(newGroups);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const getAvailableGroups = () => {
    const usedGroups = groups.map((g) => g.costGroup);
    return COST_GROUPS.filter((g) => !usedGroups.includes(g.key));
  };

  const getAccountsForGroup = (groupType: string) => {
    // Filter accounts based on project cost group codes
    const groupCodes = projectCostCodes.filter(
      (code) => code.costGroup === groupType
    );
    if (groupCodes.length > 0) {
      return chartAccounts.filter((account) =>
        groupCodes.some((code) => code.glAccountId === account.id)
      );
    }
    // Show all accounts for project cost allocation (not just EXPENSE)
    // Users can select appropriate accounts for each cost group
    return chartAccounts;
  };

  const saveGroups = async () => {
    if (!activityId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/activities/${activityId}/cost-groups`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ costGroups: groups }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la sauvegarde");
      }

      toast.success("Groupes de coûts sauvegardés avec succès");
    } catch (error) {
      console.error("Error saving cost groups:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur de sauvegarde"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Répartition par Groupes de Coûts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Assignez des pourcentages aux 5 groupes analytiques
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-right">
            <div className="text-2xl font-bold">
              <span className={isValid ? "text-green-600" : "text-red-600"}>
                {Number(totalPercentage || 0).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {isValid ? "✓ Équilibré" : "⚠ Non équilibré"}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress
            value={Math.min(totalPercentage, 100)}
            className={`h-2 ${
              isValid
                ? "progress-green"
                : totalPercentage > 100
                  ? "progress-red"
                  : "progress-yellow"
            }`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Validation Alert */}
        {!isValid && (
          <Alert variant={totalPercentage > 100 ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {totalPercentage > 100
                ? `Le total dépasse 100% de ${Number(totalPercentage - 100).toFixed(1)}%`
                : totalPercentage < 100
                  ? `Il reste ${Number(100 - totalPercentage).toFixed(1)}% à répartir`
                  : "La répartition est équilibrée"}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Groups */}
        <div className="space-y-3">
          {groups.map((group, index) => {
            const groupDef = COST_GROUPS.find((g) => g.key === group.costGroup);
            const Icon = groupDef?.icon || Package;
            const availableAccounts = getAccountsForGroup(group.costGroup);

            return (
              <Card
                key={`${group.costGroup}-${index}`}
                className={`border-l-4 ${groupDef?.color || "border-gray-200"}`}
              >
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Group Info */}
                    <div className="md:col-span-3 flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <Badge className={groupDef?.badgeColor}>
                          {group.costGroup}
                        </Badge>
                        <div className="text-sm font-medium mt-1">
                          {groupDef?.name}
                        </div>
                      </div>
                    </div>

                    {/* Percentage Input */}
                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium">Pourcentage</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={group.percentage}
                          onChange={(e) =>
                            updateGroup(index, {
                              percentage: parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={disabled}
                          className="text-right"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    {/* GL Account Selection */}
                    <div className="md:col-span-4">
                      <Label className="text-xs font-medium">Compte GL</Label>
                      <Select
                        value={group.glAccountId || ""}
                        onValueChange={(value) =>
                          updateGroup(index, { glAccountId: value })
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {account.number}
                                </Badge>
                                <span>{account.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium">Description</Label>
                      <Input
                        value={group.description || ""}
                        onChange={(e) =>
                          updateGroup(index, { description: e.target.value })
                        }
                        placeholder="Optionnel"
                        disabled={disabled}
                        className="text-sm"
                      />
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGroup(index)}
                        disabled={disabled}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Group Section */}
        {getAvailableGroups().length > 0 && (
          <>
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Ajouter un groupe de coûts
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {getAvailableGroups().map((groupDef) => {
                  const Icon = groupDef.icon;
                  return (
                    <Button
                      key={groupDef.key}
                      type="button"
                      variant="outline"
                      onClick={() => addGroup(groupDef.key)}
                      disabled={disabled}
                      className={`h-auto p-3 flex flex-col items-center gap-2 ${groupDef.color} hover:shadow-md transition-all`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium text-xs">
                          {groupDef.code}
                        </div>
                        <div className="text-xs opacity-75">
                          {groupDef.name}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        {activityId && groups.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm">
                  {isValid
                    ? "Configuration valide"
                    : "Ajustez les pourcentages"}
                </span>
              </div>

              <Button
                onClick={saveGroups}
                disabled={disabled || !isValid || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Sauvegarde..." : "Sauvegarder les Groupes"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
