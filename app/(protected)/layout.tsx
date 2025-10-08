"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "./_components/sidebar";
import Header from "./_components/header";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { RefreshProvider } from "@/contexts/RefreshContext";
import { UnsavedChangesProvider } from "@/lib/contexts/unsaved-changes-context";
import { GlobalDataLossWarningDialog } from "@/components/GlobalDataLossWarningDialog";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <OrganizationProvider>
      <RefreshProvider>
        <UnsavedChangesProvider>
          <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="fixed inset-0 bg-black bg-opacity-50" />
              </div>
            )}

            {/* Sidebar */}
            <div
              className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } lg:flex lg:flex-col`}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Header */}
              <Header onMobileMenuToggle={() => setSidebarOpen(true)} />

              {/* Page content */}
              <main className="flex-1 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
          
          {/* Global warning dialog */}
          <GlobalDataLossWarningDialog />
        </UnsavedChangesProvider>
      </RefreshProvider>
    </OrganizationProvider>
  );
}
