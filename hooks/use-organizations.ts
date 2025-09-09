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
  isSwitching: boolean;
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
  const [isSwitching, setIsSwitching] = useState(false);

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

        // Use the user's preferred current organization if available
        if (orgs.length > 0) {
          const preferredOrgId = data.currentOrganizationId;
          let orgToSet = null;

          if (preferredOrgId) {
            // Try to find the preferred organization
            orgToSet = orgs.find((o: Organization) => o.id === preferredOrgId);
          }

          // If preferred org not found or doesn't exist, use the first one
          if (!orgToSet) {
            orgToSet = orgs[0];
          }

          // Only update if the organization actually changed
          if (!currentOrganization || currentOrganization.id !== orgToSet.id) {
            console.log("Setting current organization to:", orgToSet.name, orgToSet.id);
            setCurrentOrganization(orgToSet);
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
      setIsSwitching(true);
      
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

      // Add a small delay to show the loading animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Force a hard refresh with a timestamp to bypass cache
      const url = new URL(window.location.href);
      url.searchParams.set("_t", Date.now().toString());
      window.location.href = url.toString();
    } catch (error) {
      console.error("Error switching organization:", error);
      setIsSwitching(false);
      throw error;
    }
  }, []);

  return {
    organizations,
    currentOrganization,
    isLoading,
    isSwitching,
    refreshOrganizations,
    switchOrganization,
    setCurrentOrganization,
  };
}
