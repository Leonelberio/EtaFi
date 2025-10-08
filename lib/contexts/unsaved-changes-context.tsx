"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  showExitDialog: boolean;
  setShowExitDialog: (show: boolean) => void;
  pendingNavigation: string | null;
  setPendingNavigation: (path: string | null) => void;
  confirmExit: () => void;
  cancelExit: () => void;
}

const UnsavedChangesContext = createContext<
  UnsavedChangesContextType | undefined
>(undefined);

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "⚠️ ATTENTION: Vous avez des modifications non sauvegardées. Si vous quittez maintenant, toutes vos modifications seront perdues. Voulez-vous vraiment continuer ?";
        return "⚠️ ATTENTION: Vous avez des modifications non sauvegardées. Si vous quittez maintenant, toutes vos modifications seront perdues. Voulez-vous vraiment continuer ?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercept all link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;

      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (link) {
        const href = link.getAttribute("href");

        // Skip if it's a hash link or external link
        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("http") ||
          href.startsWith("mailto:")
        ) {
          return;
        }

        // Skip if it's the same page
        if (href === window.location.pathname) {
          return;
        }

        // Prevent navigation immediately
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        setPendingNavigation(href);
        setShowExitDialog(true);
      }
    };

    // Use capture phase to intercept before Next.js Link handlers
    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [hasUnsavedChanges]);

  const confirmExit = () => {
    setShowExitDialog(false);
    setHasUnsavedChanges(false); // Clear the flag before navigation
    if (pendingNavigation) {
      window.location.href = pendingNavigation;
      setPendingNavigation(null);
    }
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges,
        showExitDialog,
        setShowExitDialog,
        pendingNavigation,
        setPendingNavigation,
        confirmExit,
        cancelExit,
      }}
    >
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (context === undefined) {
    throw new Error(
      "useUnsavedChanges must be used within an UnsavedChangesProvider"
    );
  }
  return context;
}
