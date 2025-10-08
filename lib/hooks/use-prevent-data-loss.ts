"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UsePreventDataLossOptions {
  hasUnsavedChanges: boolean;
  onConfirmExit?: () => void;
  warningMessage?: string;
}

export function usePreventDataLoss({
  hasUnsavedChanges,
  onConfirmExit,
  warningMessage = "⚠️ ATTENTION: Vous avez des modifications non sauvegardées. Si vous quittez maintenant, toutes vos modifications seront perdues. Voulez-vous vraiment continuer ?",
}: UsePreventDataLossOptions) {
  const router = useRouter();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = warningMessage;
        return warningMessage;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, warningMessage]);

  // Handle navigation with confirmation
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowExitDialog(true);
    } else {
      router.push(path);
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    if (onConfirmExit) {
      onConfirmExit();
    }
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  return {
    showExitDialog,
    handleNavigation,
    confirmExit,
    cancelExit,
  };
}
