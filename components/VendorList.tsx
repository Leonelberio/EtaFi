"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  payableAccount: {
    number: string;
    name: string;
  } | null;
  createdAt: string;
}

export function VendorList() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVendors();
  }, [currentPage, searchTerm]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/vendors?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const data = await response.json();
      setVendors(data.vendors);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error("Failed to fetch vendors");
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDelete = async (vendorId: string, vendorName: string) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete vendor");
      }

      // Remove vendor from local state
      setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
      toast.success(`Vendor "${vendorName}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete vendor"
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading vendors...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vendor List</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary-950 focus:ring-primary-950/20"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vendors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "No vendors found matching your search."
              : "No vendors found."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {vendor.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {vendor.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {vendor.email}
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {vendor.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(vendor.address || vendor.city || vendor.country) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {[vendor.city, vendor.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor.payableAccount ? (
                      <Badge
                        variant="secondary"
                        className="bg-primary-50 text-primary-700"
                      >
                        {vendor.payableAccount.number} -{" "}
                        {vendor.payableAccount.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Aucun compte
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          router.push(`/dashboard/vendors/${vendor.id}/edit`)
                        }
                      >
                        <Edit className="h-3 w-3" />
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
                            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the vendor "{vendor.name}" and
                              remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDelete(vendor.id, vendor.name)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
