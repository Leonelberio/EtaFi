// @ts-nocheck

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast as showToast } from "react-hot-toast"; // Importing toast
import Loader from "../dashboard/loading";
import { useToast } from "@/components/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

export const CompaniesList = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 0;
  const [companies, setCompanies] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const { toast } = useToast(); // Using shadcn's useToast
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await fetch(`/api/companies?page=${page}&limit=${ITEMS_PER_PAGE}`);
      const data = await response.json();
      setCompanies(data.companies);
      setHasMore(data.hasMore);
    };
    fetchCompanies();
  }, [page]);

  const goToPreviousPage = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", (page - 1).toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToNextPage = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", (page + 1).toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteClick = (id: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("companyId", id.toString());
    router.push(`${pathname}?${params.toString()}`, undefined, { shallow: true });
    setSelectedCompanyId(id);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (selectedCompanyId === null) return;
      const response = await fetch(`/api/companies?companyId=${selectedCompanyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast.success("L'entreprise a été supprimée avec succès.");
        setCompanies(companies.filter((company) => company.id !== selectedCompanyId));
      } else {
        toast.error("Échec de la suppression de l'entreprise.");
        console.error("Failed to delete company");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression.");
      console.error("Error deleting company:", error);
    } finally {
      setIsDialogOpen(false);
      setSelectedCompanyId(null);
    }
  };

  const handleRowClick = (companyId: number) => {
    router.push(`/dashboard/companies/${companyId}`);
  };

  return (
    <div className="bg-white p-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Entreprises</CardTitle>
            <CardDescription>Gérez vos entreprises et consultez leurs détails.</CardDescription>
          </div>
          <Link href="/dashboard/companies/new">
            <Button>Créer une entreprise</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Loader/>}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Logo</span>
                </TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden md:table-cell">NIF</TableHead>
                <TableHead className="hidden md:table-cell">Créé le</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies?.length > 0 ? (
                companies?.map((company) => (
                  <TableRow
                    key={company.id}
                    className="hover:bg-muted/10 cursor-pointer"
                    onClick={() => handleRowClick(company.id)} // Navigate to company details page on row click
                  >
                    <TableCell className="hidden sm:table-cell">
                      <Link href={`/dashboard/companies/${company.id}`}>
                        <ImageWithFallback
                          alt={`Logo de ${company.name}`}
                          className="aspect-square rounded-md object-contain"
                          height="64"
                          src={company.logo || "/placeholder.svg"}
                          width="64"
                          fallbackSrc="/placeholder.svg"
                        />
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{company.nif}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(company.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Basculer le menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Link href={`/dashboard/companies/${company.id}/edit`} onClick={(e) => e.stopPropagation()}> {/* Prevent row click */}
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleDeleteClick(company.id);
                            }}
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aucune entreprise
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Suspense>
      </CardContent>
      <Separator />
      <div className="flex flex-row justify-end p-4 align-middle gap-4">
        <div className="text-xs text-muted-foreground">
          Affichage de <strong>{ITEMS_PER_PAGE * page + 1}</strong> à{" "}
          <strong>{ITEMS_PER_PAGE * (page + 1)}</strong> entreprises
        </div>
        <div className="flex space-x-2">
          <Button
            className="h-8 w-8 rounded-full bg-gray-200 text-black"
            disabled={page === 0}
            onClick={goToPreviousPage}
          >
            {"<"}
          </Button>
          <Button
            className="h-8 w-8 rounded-full bg-gray-200 text-black"
            disabled={!hasMore}
            onClick={goToNextPage}
          >
            {">"}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component to handle image fallback
const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc,
  ...props
}: {
  src: string;
  alt: string;
  fallbackSrc: string;
  [x: string]: any;
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return <Image {...props} src={imgSrc} alt={alt} onError={() => setImgSrc(fallbackSrc)} />;
};
