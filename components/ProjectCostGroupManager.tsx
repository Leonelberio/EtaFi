"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Plus,
  Edit,
  Star,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface ProjectCostGroupCode {
  id: string;
  costGroup: "M" | "S" | "D" | "E" | "MOD";
  glAccountId: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  glAccount: {
    id: string;
    number: string;
    name: string;
    type: string;
  };
}

interface ChartAccount {
  id: string;
  number: string;
  name: string;
  type: string;
}

interface ProjectCostGroupManagerProps {
  projectId: string;
  projectName: string;
}

// Cost group definitions
const COST_GROUPS = [
  {
    key: "M" as const,
    name: "Matériel & Fournitures",
    icon: Package,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    key: "S" as const,
    name: "Sous-traitance & Services",
    icon: Users,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  {
    key: "D" as const,
    name: "Frais Généraux & Divers",
    icon: FileText,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  {
    key: "E" as const,
    name: "Équipement & Outillage",
    icon: Wrench,
    color: "bg-green-50 text-green-700 border-green-200",
    badgeColor: "bg-green-100 text-green-800",
  },
  {
    key: "MOD" as const,
    name: "Main-d'œuvre Directe",
    icon: DollarSign,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeColor: "bg-indigo-100 text-indigo-800",
  },
] as const;

export function ProjectCostGroupManager({
  projectId,
  projectName,
}: ProjectCostGroupManagerProps) {
  const [costGroupCodes, setCostGroupCodes] = useState<ProjectCostGroupCode[]>(
    []
  );
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ProjectCostGroupCode | null>(
    null
  );

  // Form state
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isDefault, setIsDefault] = useState<boolean>(false);

  // Load data
  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load cost group codes
      const codesResponse = await fetch(
        `/api/projects/${projectId}/cost-group-codes`
      );
      if (codesResponse.ok) {
        const codesData = await codesResponse.json();
        setCostGroupCodes(codesData.costGroupCodes || []);
      }

      // Load chart accounts
      const accountsResponse = await fetch(`/api/chart-accounts`);
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setChartAccounts(accountsData.accounts || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = (group?: "M" | "S" | "D" | "E" | "MOD") => {
    setEditingCode(null);
    setSelectedGroup(group || "");
    setSelectedAccount("");
    setDescription("");
    setIsDefault(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (code: ProjectCostGroupCode) => {
    setEditingCode(code);
    setSelectedGroup(code.costGroup);
    setSelectedAccount(code.glAccountId);
    setDescription(code.description || "");
    setIsDefault(code.isDefault);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedGroup || !selectedAccount) {
      toast.error("Veuillez sélectionner un groupe et un compte");
      return;
    }

    setIsLoading(true);
    try {
      const body = {
        costGroup: selectedGroup,
        glAccountId: selectedAccount,
        description,
        isDefault,
      };

      const response = await fetch(
        `/api/projects/${projectId}/cost-group-codes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la sauvegarde");
      }

      toast.success("Code de groupe ajouté avec succès");
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving cost group code:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur de sauvegarde"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupStatus = (groupKey: string) => {
    const codes = costGroupCodes.filter((c) => c.costGroup === groupKey);
    if (codes.length === 0)
      return { status: "missing", message: "Aucun code assigné" };

    const hasDefault = codes.some((c) => c.isDefault);
    if (!hasDefault)
      return { status: "warning", message: "Pas de code par défaut" };

    return {
      status: "complete",
      message: `${codes.length} code(s) assigné(s)`,
    };
  };

  const getAvailableAccounts = () => {
    return chartAccounts.filter((account) => account.type === "EXPENSE");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Configuration des Codes GL par Projet
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Projet: {projectName}
              </p>
            </div>
          </div>

          <Button
            onClick={() => openAddDialog()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Code
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {COST_GROUPS.map((group) => {
            const status = getGroupStatus(group.key);
            const Icon = group.icon;

            return (
              <Card
                key={group.key}
                className={`cursor-pointer transition-all hover:shadow-md ${group.color}`}
                onClick={() => openAddDialog(group.key)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <Badge className={group.badgeColor}>{group.key}</Badge>
                  <div className="mt-2">
                    <div className="text-xs font-medium">{group.name}</div>
                    <div className="flex items-center justify-center mt-1">
                      {status.status === "complete" && (
                        <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                      )}
                      {status.status === "warning" && (
                        <AlertCircle className="h-3 w-3 text-yellow-600 mr-1" />
                      )}
                      {status.status === "missing" && (
                        <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
                      )}
                      <span className="text-xs">{status.message}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator />

        {/* Codes Table */}
        <div>
          <h4 className="text-md font-semibold mb-4">Codes GL Assignés</h4>

          {costGroupCodes.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun code GL n'est encore assigné à ce projet. Ajoutez des
                codes pour permettre l'imputation automatique.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Groupe</TableHead>
                  <TableHead>Compte GL</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Par Défaut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costGroupCodes.map((code) => {
                  const groupDef = COST_GROUPS.find(
                    (g) => g.key === code.costGroup
                  );
                  const Icon = groupDef?.icon || Package;

                  return (
                    <TableRow key={code.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <Badge className={groupDef?.badgeColor}>
                            {code.costGroup}
                          </Badge>
                          <span className="text-sm">{groupDef?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {code.glAccount.number}
                          </Badge>
                          <span className="text-sm">{code.glAccount.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {code.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {code.isDefault && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(code)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? "Modifier" : "Ajouter"} un Code GL
              </DialogTitle>
              <DialogDescription>
                Assignez un compte du plan comptable à un groupe de coûts.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Groupe de Coûts</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    {COST_GROUPS.map((group) => {
                      const Icon = group.icon;
                      return (
                        <SelectItem key={group.key} value={group.key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <Badge className={group.badgeColor}>
                              {group.key}
                            </Badge>
                            <span>{group.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Compte GL</Label>
                <Select
                  value={selectedAccount}
                  onValueChange={setSelectedAccount}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableAccounts().map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{account.number}</Badge>
                          <span>{account.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description (optionnel)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Matériel spécialisé pour ce projet"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <Label htmlFor="isDefault">
                  Compte par défaut pour ce groupe
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
