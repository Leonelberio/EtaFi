"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Percent,
  MapPin,
  Loader2,
} from "lucide-react";

interface TaxCode {
  id: string;
  code: string;
  name: string;
  rate: number;
  province?: string;
  isActive: boolean;
  isCompound: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const PROVINCE_NAMES: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  NT: "Northwest Territories",
  NU: "Nunavut",
  YT: "Yukon",
};

export function TaxCodeList() {
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [filteredTaxCodes, setFilteredTaxCodes] = useState<TaxCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTaxCodes();
  }, []);

  useEffect(() => {
    const filtered = taxCodes.filter(
      (taxCode) =>
        taxCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        taxCode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (taxCode.description &&
          taxCode.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTaxCodes(filtered);
  }, [taxCodes, searchTerm]);

  const fetchTaxCodes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tax-codes");

      if (!response.ok) {
        throw new Error("Failed to fetch tax codes");
      }

      const data = await response.json();
      setTaxCodes(data);
    } catch (error) {
      console.error("Error fetching tax codes:", error);
      toast.error("Failed to fetch tax codes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/tax-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tax code");
      }

      toast.success(
        currentStatus ? "Tax code deactivated" : "Tax code activated"
      );
      fetchTaxCodes();
    } catch (error) {
      console.error("Error updating tax code:", error);
      toast.error("Failed to update tax code");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/tax-codes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tax code");
      }

      toast.success("Tax code deleted successfully");
      setDeleteId(null);
      fetchTaxCodes();
    } catch (error) {
      console.error("Error deleting tax code:", error);
      toast.error("Failed to delete tax code");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInitializeCanadian = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tax-codes/initialize-canadian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overwrite: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize Canadian tax codes");
      }

      const result = await response.json();
      toast.success(
        `Initialized ${result.created} Canadian tax codes successfully!`
      );
      fetchTaxCodes();
    } catch (error) {
      console.error("Error initializing Canadian tax codes:", error);
      toast.error("Failed to initialize Canadian tax codes");
    } finally {
      setIsLoading(false);
    }
  };

  const formatRate = (rate: number): string => {
    return `${(rate * 100).toFixed(3)}%`;
  };

  const getProvinceDisplay = (province?: string): string | null => {
    if (!province) return null;
    return PROVINCE_NAMES[province] || province;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tax Codes</CardTitle>
          <CardDescription>Loading tax codes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Canadian Tax Codes
              </CardTitle>
              <CardDescription>
                Manage GST/HST, QST, and other Canadian tax codes
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/dashboard/tax-codes/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Tax Code
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by code, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {taxCodes.length === 0 && (
              <Button
                variant="outline"
                onClick={handleInitializeCanadian}
                disabled={isLoading}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Initialize Canadian Taxes
              </Button>
            )}
          </div>

          {/* Tax Codes Table */}
          {filteredTaxCodes.length === 0 ? (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No tax codes found" : "No tax codes configured"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first Canadian tax code (GST, QST, HST)"}
              </p>
              {!searchTerm && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleInitializeCanadian}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Initialize Canadian Taxes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/tax-codes/new")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Manually
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTaxCodes.map((taxCode) => (
                    <TableRow key={taxCode.id}>
                      <TableCell>
                        <div className="font-medium">{taxCode.code}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{taxCode.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {formatRate(taxCode.rate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {taxCode.province ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {getProvinceDisplay(taxCode.province)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Federal</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {taxCode.isCompound && (
                            <Badge variant="outline" className="text-xs">
                              Compound
                            </Badge>
                          )}
                          {taxCode.rate === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Exempt
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={taxCode.isActive ? "default" : "secondary"}
                          className={
                            taxCode.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {taxCode.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {taxCode.description ? (
                          <div className="text-sm text-gray-600 truncate">
                            {taxCode.description}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No description
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/tax-codes/${taxCode.id}`
                                )
                              }
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/tax-codes/${taxCode.id}/edit`
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleActive(taxCode.id, taxCode.isActive)
                              }
                            >
                              {taxCode.isActive ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(taxCode.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Stats */}
          {filteredTaxCodes.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
              <div>
                Showing {filteredTaxCodes.length} of {taxCodes.length} tax codes
              </div>
              <div className="flex gap-4">
                <span>
                  Active: {taxCodes.filter((tc) => tc.isActive).length}
                </span>
                <span>
                  Inactive: {taxCodes.filter((tc) => !tc.isActive).length}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tax code? This action cannot
              be undone and may affect existing transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
