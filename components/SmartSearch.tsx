"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, FolderOpen, User, Building, Calculator, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'invoice' | 'project' | 'customer' | 'vendor';
  href: string;
  icon: React.ReactNode;
}

interface SmartSearchProps {
  className?: string;
  placeholder?: string;
}

export function SmartSearch({ className = "", placeholder = "Rechercher pages, factures, projets..." }: SmartSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Navigation items
  const navigationItems: SearchResult[] = [
    {
      id: "nav-new-invoice",
      title: "Nouvelle Facture",
      subtitle: "Créer une nouvelle facture",
      type: 'navigation',
      href: "/dashboard/invoices/new",
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: "nav-invoices",
      title: "Factures",
      subtitle: "Voir toutes les factures",
      type: 'navigation',
      href: "/dashboard/invoices",
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: "nav-projects",
      title: "Projets",
      subtitle: "Gestion des projets",
      type: 'navigation',
      href: "/dashboard/projects",
      icon: <FolderOpen className="h-4 w-4" />
    },
    {
      id: "nav-customers",
      title: "Clients",
      subtitle: "Gestion des clients",
      type: 'navigation',
      href: "/dashboard/customers",
      icon: <User className="h-4 w-4" />
    },
    {
      id: "nav-vendors",
      title: "Fournisseurs",
      subtitle: "Gestion des fournisseurs",
      type: 'navigation',
      href: "/dashboard/vendors",
      icon: <Building className="h-4 w-4" />
    },
    {
      id: "nav-ledger",
      title: "Grand Livre",
      subtitle: "États financiers et comptabilité",
      type: 'navigation',
      href: "/dashboard/ledger",
      icon: <Calculator className="h-4 w-4" />
    },
    {
      id: "nav-journals",
      title: "Écritures de Journal",
      subtitle: "Gestion des écritures comptables",
      type: 'navigation',
      href: "/dashboard/journals",
      icon: <Calculator className="h-4 w-4" />
    }
  ];

  // Search data when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults(navigationItems);
      return;
    }

    setLoading(true);
    searchData(query);
  }, [query]);

  const searchData = async (searchQuery: string) => {
    try {
      const [invoicesRes, projectsRes, customersRes, vendorsRes] = await Promise.all([
        fetch(`/api/invoices?search=${encodeURIComponent(searchQuery)}`).catch(() => null),
        fetch(`/api/projects?search=${encodeURIComponent(searchQuery)}`).catch(() => null),
        fetch(`/api/customers?search=${encodeURIComponent(searchQuery)}`).catch(() => null),
        fetch(`/api/vendors?search=${encodeURIComponent(searchQuery)}`).catch(() => null)
      ]);

      const searchResults: SearchResult[] = [];

      // Filter navigation items
      const filteredNavigation = navigationItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      searchResults.push(...filteredNavigation);

      // Add invoices
      if (invoicesRes?.ok) {
        const invoicesData = await invoicesRes.json();
        const invoices = invoicesData.invoices || [];
        
        invoices.slice(0, 5).forEach((invoice: any) => {
          searchResults.push({
            id: `invoice-${invoice.id}`,
            title: `Facture ${invoice.number}`,
            subtitle: `${invoice.customer?.name || invoice.vendor?.name || 'Client/Fournisseur'} - ${invoice.total}€`,
            type: 'invoice',
            href: `/dashboard/invoices/${invoice.id}`,
            icon: <FileText className="h-4 w-4" />
          });
        });
      }

      // Add projects
      if (projectsRes?.ok) {
        const projectsData = await projectsRes.json();
        const projects = projectsData.projects || [];
        
        projects.slice(0, 5).forEach((project: any) => {
          searchResults.push({
            id: `project-${project.id}`,
            title: `${project.code} - ${project.name}`,
            subtitle: `Client: ${project.client?.name || 'Non assigné'}`,
            type: 'project',
            href: `/dashboard/projects/${project.id}`,
            icon: <FolderOpen className="h-4 w-4" />
          });
        });
      }

      // Add customers
      if (customersRes?.ok) {
        const customersData = await customersRes.json();
        const customers = customersData.customers || [];
        
        customers.slice(0, 3).forEach((customer: any) => {
          searchResults.push({
            id: `customer-${customer.id}`,
            title: customer.name,
            subtitle: customer.email || 'Client',
            type: 'customer',
            href: `/dashboard/customers/${customer.id}`,
            icon: <User className="h-4 w-4" />
          });
        });
      }

      // Add vendors
      if (vendorsRes?.ok) {
        const vendorsData = await vendorsRes.json();
        const vendors = vendorsData.vendors || [];
        
        vendors.slice(0, 3).forEach((vendor: any) => {
          searchResults.push({
            id: `vendor-${vendor.id}`,
            title: vendor.name,
            subtitle: vendor.email || 'Fournisseur',
            type: 'vendor',
            href: `/dashboard/vendors/${vendor.id}`,
            icon: <Building className="h-4 w-4" />
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults(navigationItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
    setQuery("");
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <div className={`relative ${className}`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500 pl-10 pr-3 sm:text-sm cursor-pointer"
          placeholder={placeholder}
          value=""
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Tapez pour rechercher..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Recherche en cours..." : "Aucun résultat trouvé."}
          </CommandEmpty>
          
          {groupedResults.navigation && groupedResults.navigation.length > 0 && (
            <CommandGroup heading="Navigation">
              {groupedResults.navigation.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3"
                >
                  {result.icon}
                  <div className="flex-1">
                    <div className="font-medium">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-gray-500">{result.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {groupedResults.invoice && groupedResults.invoice.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Factures">
                {groupedResults.invoice.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3"
                  >
                    {result.icon}
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {groupedResults.project && groupedResults.project.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projets">
                {groupedResults.project.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3"
                  >
                    {result.icon}
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {(groupedResults.customer && groupedResults.customer.length > 0) ||
           (groupedResults.vendor && groupedResults.vendor.length > 0) ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Contacts">
                {groupedResults.customer?.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3"
                  >
                    {result.icon}
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </CommandItem>
                ))}
                {groupedResults.vendor?.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3"
                  >
                    {result.icon}
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
