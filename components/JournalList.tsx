"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileX,
  Calculator,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface Journal {
  id: string;
  journalType: string;
  entryDate: string;
  reference: string;
  description: string;
  totalAmount: number;
  status: string;
  postedAt: string | null;
  postedByUser: {
    name: string;
    email: string;
  } | null;
  lines: {
    id: string;
    debitAmount: number | null;
    creditAmount: number | null;
    account: {
      number: string;
      name: string;
    };
  }[];
}

interface JournalListProps {
  initialJournals?: Journal[];
}

export function JournalList({ initialJournals = [] }: JournalListProps) {
  const [journals, setJournals] = useState<Journal[]>(initialJournals);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [journalTypeFilter, setJournalTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (journalTypeFilter && journalTypeFilter !== "ALL")
        params.append("journalType", journalTypeFilter);
      if (statusFilter && statusFilter !== "ALL")
        params.append("status", statusFilter);

      const response = await fetch(`/api/journals?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJournals(data.journals);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching journals:", error);
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [currentPage, searchTerm, journalTypeFilter, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDelete = async (journalId: string, reference: string) => {
    try {
      const response = await fetch(`/api/journals/${journalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete journal");
      }

      setJournals(journals.filter((journal) => journal.id !== journalId));
      toast.success(`Journal "${reference}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting journal:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete journal"
      );
    }
  };

  const handlePost = async (journalId: string) => {
    try {
      const response = await fetch(`/api/journals/${journalId}/post`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post journal");
      }

      toast.success("Journal posted successfully");
      fetchJournals(); // Refresh the list
    } catch (error) {
      console.error("Error posting journal:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to post journal"
      );
    }
  };

  const handleReverse = async (journalId: string) => {
    try {
      const response = await fetch(`/api/journals/${journalId}/post`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reverse journal");
      }

      toast.success("Journal reversed successfully");
      fetchJournals(); // Refresh the list
    } catch (error) {
      console.error("Error reversing journal:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reverse journal"
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "POSTED":
        return <Badge className="bg-green-100 text-green-800">Posted</Badge>;
      case "REVERSED":
        return <Badge variant="destructive">Reversed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getJournalTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      GENERAL: "bg-blue-100 text-blue-800",
      PURCHASE: "bg-purple-100 text-purple-800",
      SALES: "bg-green-100 text-green-800",
      CASH_RECEIPTS: "bg-emerald-100 text-emerald-800",
      CASH_DISBURSEMENTS: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  if (loading && journals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Calculator className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Loading journals...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Journal Entries
          </CardTitle>
          <Button
            onClick={() => router.push("/dashboard/journals/new")}
            className="bg-primary-950 hover:bg-primary-900 text-white"
          >
            New Journal Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search journals..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={journalTypeFilter}
            onValueChange={setJournalTypeFilter}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="PURCHASE">Purchase</SelectItem>
              <SelectItem value="SALES">Sales</SelectItem>
              <SelectItem value="CASH_RECEIPTS">Cash Receipts</SelectItem>
              <SelectItem value="CASH_DISBURSEMENTS">
                Cash Disbursements
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="POSTED">Posted</SelectItem>
              <SelectItem value="REVERSED">Reversed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Journal Table */}
        {journals.length === 0 ? (
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No journal entries found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || journalTypeFilter || statusFilter
                ? "Try adjusting your search criteria."
                : "Get started by creating your first journal entry."}
            </p>
            <Button
              onClick={() => router.push("/dashboard/journals/new")}
              className="bg-primary-950 hover:bg-primary-900 text-white"
            >
              Create Journal Entry
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journals.map((journal) => (
                  <TableRow key={journal.id}>
                    <TableCell>
                      {new Date(journal.entryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {journal.reference || journal.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {getJournalTypeBadge(journal.journalType)}
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-xs truncate"
                        title={journal.description}
                      >
                        {journal.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(Number(journal.totalAmount) || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(journal.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            router.push(`/dashboard/journals/${journal.id}`)
                          }
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {journal.status === "DRAFT" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                router.push(
                                  `/dashboard/journals/${journal.id}/edit`
                                )
                              }
                            >
                              <Edit className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              onClick={() => handlePost(journal.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Journal Entry
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the journal entry "
                                    {journal.reference ||
                                      journal.id.slice(0, 8)}
                                    " and all its lines.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(
                                        journal.id,
                                        journal.reference || journal.id
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {journal.status === "POSTED" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Reverse Journal Entry
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will create a reversing journal entry to
                                  undo the effects of this posted journal. This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReverse(journal.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Reverse Entry
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
