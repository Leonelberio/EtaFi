"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useOrganizations } from "@/hooks/use-organizations";

interface Organization {
  id: string;
  name: string;
  role: string;
  logo?: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  refreshOrganizations: () => Promise<void>;
  switchOrganization: (org: Organization) => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const organizationData = useOrganizations();

  return (
    <OrganizationContext.Provider value={organizationData}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganizationContext must be used within an OrganizationProvider"
    );
  }
  return context;
}
