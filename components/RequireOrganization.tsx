"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Loader2 } from "lucide-react";

interface RequireOrganizationProps {
  children: React.ReactNode;
}

export function RequireOrganization({ children }: RequireOrganizationProps) {
  const router = useRouter();
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkOrganization() {
      try {
        // Check if user has access to any API that requires organization
        const response = await fetch("/api/cost-categories");

        if (response.ok) {
          setHasOrganization(true);
        } else {
          const errorData = await response.json();
          if (errorData.action === "create_organization") {
            setHasOrganization(false);
          } else {
            // Other error, assume they have organization but there's another issue
            setHasOrganization(true);
          }
        }
      } catch (error) {
        // On error, assume they need organization
        setHasOrganization(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkOrganization();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking organization access...</p>
        </div>
      </div>
    );
  }

  if (!hasOrganization) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader className="text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Organization Required</CardTitle>
            <CardDescription>
              You need to create or join an organization to access accounting
              features.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Organizations help you manage your accounting data, team members,
              and projects. Create your first organization to get started.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => router.push("/dashboard/organizations/new")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/organizations")}
              >
                <Building2 className="h-4 w-4 mr-2" />
                View Organizations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
