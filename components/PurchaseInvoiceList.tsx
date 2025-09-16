"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface PurchaseInvoice {
  id: string;
  number: string;
  status: string;
  date: string;
  dueDate?: string;
  ref?: string;
  vendor?: { name: string };
  project?: { code: string; name: string };
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  currency: string;
  creator?: { name: string };
  approver?: { name: string };
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    totalAmount: number;
    activity?: { code: string; name: string };
    subActivity?: { code: string; name: string };
    costCategory?: string;
  }>;
}

interface PurchaseInvoiceListProps {
  projectId?: string;
}

export function PurchaseInvoiceList({ projectId }: PurchaseInvoiceListProps) {
  const router = useRouter();
  const [allInvoices, setAllInvoices] = useState<PurchaseInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<PurchaseInvoice[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: "1000", // Fetch all invoices for client-side filtering
      });

      if (projectId) params.append("projectId", projectId);

      const response = await fetch(`/api/purchase-invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAllInvoices(data.invoices || []);
        setFilteredInvoices(data.invoices || []);
        setTotalCount(data.invoices?.length || 0);
      } else {
        toast.error("Erreur lors du chargement des factures d'achat");
      }
    } catch (error) {
      console.error("Error fetching purchase invoices:", error);
      toast.error("Erreur lors du chargement des factures d'achat");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function
  const applyFilters = () => {
    setFiltering(true);

    let filtered = [...allInvoices];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.number.toLowerCase().includes(searchLower) ||
          invoice.ref?.toLowerCase().includes(searchLower) ||
          invoice.vendor?.name.toLowerCase().includes(searchLower) ||
          invoice.project?.name.toLowerCase().includes(searchLower) ||
          invoice.project?.code.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filtering

    // Simulate a small delay for skeleton effect
    setTimeout(() => {
      setFiltering(false);
    }, 300);
  };

  // Fetch invoices only on mount and when projectId changes
  useEffect(() => {
    fetchInvoices();
  }, [projectId]);

  // Apply filters when search terms or filters change
  useEffect(() => {
    if (allInvoices.length > 0) {
      applyFilters();
    }
  }, [searchTerm, statusFilter, allInvoices]);

  // Get paginated invoices
  const getPaginatedInvoices = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInvoices.slice(startIndex, endIndex);
  };

  const handleDelete = async (invoiceId: string) => {
    if (
      !confirm("Êtes-vous sûr de vouloir supprimer cette facture d'achat ?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/purchase-invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Facture d'achat supprimée");
        // Remove from both arrays
        setAllInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
        setFilteredInvoices((prev) =>
          prev.filter((inv) => inv.id !== invoiceId)
        );
        setTotalCount((prev) => prev - 1);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting purchase invoice:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handlePost = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/purchase-invoices/${invoiceId}/post`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Facture d'achat postée - Écritures de journal créées");
        // Update the invoice status in both arrays
        setAllInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: "POSTED" } : inv
          )
        );
        setFilteredInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: "POSTED" } : inv
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors du posting");
      }
    } catch (error) {
      console.error("Error posting purchase invoice:", error);
      toast.error("Erreur lors du posting");
    }
  };

  const formatCurrency = (amount: number, currency: string = "CAD") => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <FileText className="h-4 w-4 text-gray-500" />;
      case "SENT":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "OVERDUE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Brouillon";
      case "SENT":
        return "Envoyée";
      case "PAID":
        return "Payée";
      case "CANCELLED":
        return "Annulée";
      case "OVERDUE":
        return "En retard";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des factures d'achat...</p>
        </div>
      </div>
    );
  }

  // Skeleton component for filtering
  const InvoiceSkeleton = () => (
    <TableRow>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
      </TableCell>
      <TableCell>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures d'achat</h1>
          <p className="text-gray-600">
            {totalCount} facture{totalCount > 1 ? "s" : ""} d'achat au total
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/purchase-invoices/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture d'achat
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Numéro, référence, fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="SENT">Envoyée</SelectItem>
                  <SelectItem value="PAID">Payée</SelectItem>
                  <SelectItem value="CANCELLED">Annulée</SelectItem>
                  <SelectItem value="OVERDUE">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchInvoices}
                variant="outline"
                className="w-full"
              >
                Actualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Payé</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtering
                ? // Show skeleton loading during filtering
                  Array.from({ length: 5 }).map((_, index) => (
                    <InvoiceSkeleton key={index} />
                  ))
                : getPaginatedInvoices().map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="font-medium">{invoice.number}</div>
                        {invoice.ref && (
                          <div className="text-sm text-gray-500">
                            {invoice.ref}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusLabel(invoice.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{formatDate(invoice.date)}</div>
                        {invoice.dueDate && (
                          <div className="text-sm text-gray-500">
                            Échéance: {formatDate(invoice.dueDate)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{invoice.vendor?.name || "—"}</TableCell>
                      <TableCell>
                        {invoice.project ? (
                          <div>
                            <div className="font-medium">
                              {invoice.project.code}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.project.name}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.paidAmount, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/purchase-invoices/${invoice.id}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/purchase-invoices/${invoice.id}/edit`
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePost(invoice.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
                            disabled={
                              invoice.status === "PAID" ||
                              invoice.paidAmount > 0
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {!filtering && getPaginatedInvoices().length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Aucune facture d'achat trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
