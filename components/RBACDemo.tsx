"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Lock, CheckCircle, XCircle } from "lucide-react";

interface UserPermissions {
  role: string;
  roleLevel: number;
  rolePermissions: Record<string, string[]>;
  customPermissions: any[];
  projectAccess: string[];
  maxApprovalAmount?: number;
  department?: string;
  costCenter?: string;
}

export function RBACDemo() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      // This would normally get the organizationId from context
      const response = await fetch(`/api/rbac/permissions?organizationId=demo`);

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
      } else {
        setError("Failed to load permissions");
      }
    } catch (err) {
      setError("Error loading permissions");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      OWNER: "bg-purple-100 text-purple-800",
      ADMINISTRATOR: "bg-red-100 text-red-800",
      CPA_CONTROLEUR: "bg-blue-100 text-blue-800",
      TECHNICIEN: "bg-green-100 text-green-800",
      GESTIONNAIRE: "bg-yellow-100 text-yellow-800",
      DEMANDEUR: "bg-orange-100 text-orange-800",
      LECTURE: "bg-gray-100 text-gray-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPermissionLevel = (role: string) => {
    const levels = {
      OWNER: 100,
      ADMINISTRATOR: 90,
      CPA_CONTROLEUR: 80,
      TECHNICIEN: 60,
      GESTIONNAIRE: 50,
      DEMANDEUR: 30,
      LECTURE: 10,
    };
    return levels[role as keyof typeof levels] || 0;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            RBAC System Demo
          </CardTitle>
          <CardDescription>Loading current user permissions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            RBAC System Demo - Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchPermissions} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Canadian ERP RBAC System Demo
          </CardTitle>
          <CardDescription>
            Role-Based Access Control system with Canadian compliance features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissions ? (
            <div className="space-y-6">
              {/* Current Role */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Current Role:</span>
                </div>
                <Badge className={getRoleColor(permissions.role)}>
                  {permissions.role.replace("_", "/")}
                </Badge>
                <div className="text-sm text-gray-600">
                  Level {permissions.roleLevel}/100
                </div>
              </div>

              {/* Access Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-gray-600">
                      Department
                    </div>
                    <div className="text-lg">
                      {permissions.department || "Not Set"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-gray-600">
                      Cost Center
                    </div>
                    <div className="text-lg">
                      {permissions.costCenter || "Not Set"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-gray-600">
                      Max Approval
                    </div>
                    <div className="text-lg">
                      {permissions.maxApprovalAmount
                        ? `$${permissions.maxApprovalAmount.toLocaleString()}`
                        : "No Limit"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-gray-600">
                      Project Access
                    </div>
                    <div className="text-lg">
                      {permissions.projectAccess.length === 0
                        ? "All Projects"
                        : `${permissions.projectAccess.length} Projects`}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Module Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Module Permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(permissions.rolePermissions).map(
                    ([module, actions]) => (
                      <Card key={module} className="p-4">
                        <div className="font-medium text-sm mb-2">
                          {module.replace(/_/g, " ")}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(actions as string[]).map((action) => (
                            <Badge
                              key={action}
                              variant="secondary"
                              className="text-xs"
                            >
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    )
                  )}
                </div>
              </div>

              {/* Canadian Compliance Features */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Canadian Compliance Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-green-700">
                  <ul className="space-y-2 text-sm">
                    <li>✅ NCECF compliant role definitions</li>
                    <li>✅ LPRPDE (Bill 25) data protection roles</li>
                    <li>
                      ✅ Separation of duties (demandeur ≠ approbateur ≠ payeur)
                    </li>
                    <li>✅ Audit trail for all permission changes</li>
                    <li>✅ Project-based cost center tracking</li>
                    <li>✅ Multi-level approval workflows</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Custom Permissions */}
              {permissions.customPermissions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Custom Permissions
                  </h3>
                  <div className="space-y-2">
                    {permissions.customPermissions.map((perm, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 border rounded"
                      >
                        <Badge variant="outline">{perm.module}</Badge>
                        <Badge variant="outline">{perm.action}</Badge>
                        {perm.resource && (
                          <span className="text-sm text-gray-600">
                            Resource: {perm.resource}
                          </span>
                        )}
                        {perm.expiresAt && (
                          <span className="text-sm text-gray-600">
                            Expires:{" "}
                            {new Date(perm.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No permissions data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
