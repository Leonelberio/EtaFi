"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Organization {
  id: string;
  name: string;
  role: string;
  logo?: string;
}

interface UseOrganizationsReturn {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  refreshOrganizations: () => Promise<void>;
  switchOrganization: (org: Organization) => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
}

export function useOrganizations(): UseOrganizationsReturn {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizations = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        const orgs = data.organizations.map((org: any) => ({
          id: org.id,
          name: org.name,
          role:
            org.members?.find((m: any) => m.userId === session?.user?.id)
              ?.role || "MEMBER",
          logo: org.logo || "",
        }));

        setOrganizations(orgs);

        // Set the first organization as current if none is set or current doesn't exist
        if (orgs.length > 0) {
          if (
            !currentOrganization ||
            !orgs.find((o: Organization) => o.id === currentOrganization.id)
          ) {
            setCurrentOrganization(orgs[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, currentOrganization]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const refreshOrganizations = useCallback(async () => {
    await fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrganization = useCallback(async (org: Organization) => {
    try {
      // Call API to persist organization switch
      const response = await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: org.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch organization");
      }

      // Update local state
      setCurrentOrganization(org);

      // Refresh the page to reload all data with new organization context
      window.location.reload();
    } catch (error) {
      console.error("Error switching organization:", error);
      throw error;
    }
  }, []);

  return {
    organizations,
    currentOrganization,
    isLoading,
    refreshOrganizations,
    switchOrganization,
    setCurrentOrganization,
  };
}
