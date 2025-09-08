/**
 * Simplified RBAC Middleware for API Route Protection
 *
 * This middleware provides basic role-based access control
 * without the complex ERP module system.
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser, getCurrentOrgId } from "@/lib/auth";
import { hasPermission, ROLES, Role } from "@/lib/rbac";

export interface RBACConfig {
  module: string;
  action: string;
  requireOrgId?: boolean;
  allowedRoles?: Role[];
  resourceIdParam?: string; // URL param name for resource ID
}

/**
 * Middleware to protect API routes with RBAC
 */
export function withRBAC(config: RBACConfig) {
  return function (
    handler: (
      request: NextRequest,
      context: any,
      authContext: {
        user: any;
        organizationId: string;
        membership: any;
      }
    ) => Promise<NextResponse>
  ) {
    return async function (request: NextRequest, context: any) {
      try {
        // Get authenticated user
        const user = await currentUser();
        if (!user) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        // Get organization ID
        let organizationId: string;

        if (config.requireOrgId !== false) {
          // Try to get from query params first
          const { searchParams } = new URL(request.url);
          organizationId = searchParams.get("organizationId") || "";

          // If not in query params, try from current user context
          if (!organizationId) {
            organizationId = (await getCurrentOrgId()) || "";
          }

          if (!organizationId) {
            return NextResponse.json(
              { error: "Organization context required" },
              { status: 400 }
            );
          }
        }

        // Check role-based access if specified
        if (config.allowedRoles && config.allowedRoles.length > 0) {
          let hasRoleAccess = false;

          for (const role of config.allowedRoles) {
            if (await hasPermission(user.id, organizationId!, role)) {
              hasRoleAccess = true;
              break;
            }
          }

          if (!hasRoleAccess) {
            return NextResponse.json(
              {
                error: `Access denied. Required roles: ${config.allowedRoles.join(
                  ", "
                )}`,
              },
              { status: 403 }
            );
          }
        }

        // Get resource ID if specified
        let resourceId: string | undefined;
        if (config.resourceIdParam && context.params) {
          resourceId = context.params[config.resourceIdParam];
        }

        // Call the handler with auth context
        return await handler(request, context, {
          user,
          organizationId: organizationId!,
          membership: { organizationId: organizationId! },
        });
      } catch (error) {
        console.error("RBAC middleware error:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Simple role-based route protection
 */
export function requireRole(requiredRole: Role) {
  return function (
    handler: (request: NextRequest, context: any) => Promise<NextResponse>
  ) {
    return async function (request: NextRequest, context: any) {
      try {
        const user = await currentUser();
        if (!user) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        const organizationId = await getCurrentOrgId();
        if (!organizationId) {
          return NextResponse.json(
            { error: "Organization context required" },
            { status: 400 }
          );
        }

        const hasAccess = await hasPermission(
          user.id,
          organizationId,
          requiredRole
        );

        if (!hasAccess) {
          return NextResponse.json(
            { error: `Access denied. Required role: ${requiredRole}` },
            { status: 403 }
          );
        }

        return await handler(request, context);
      } catch (error) {
        console.error("Role check error:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    };
  };
}
