"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface OrganizationSettingsContextType {
  taxPassword: string;
  setTaxPassword: (password: string) => void;
  isTaxPasswordSet: boolean;
}

const OrganizationSettingsContext = createContext<
  OrganizationSettingsContextType | undefined
>(undefined);

export function OrganizationSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [taxPassword, setTaxPasswordState] = useState<string>("");

  // Load tax password from localStorage on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem("taxPassword");
    if (savedPassword) {
      setTaxPasswordState(savedPassword);
    }
  }, []);

  const setTaxPassword = (password: string) => {
    setTaxPasswordState(password);
    localStorage.setItem("taxPassword", password);
  };

  const isTaxPasswordSet = taxPassword.length > 0;

  return (
    <OrganizationSettingsContext.Provider
      value={{
        taxPassword,
        setTaxPassword,
        isTaxPasswordSet,
      }}
    >
      {children}
    </OrganizationSettingsContext.Provider>
  );
}

export function useOrganizationSettings() {
  const context = useContext(OrganizationSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useOrganizationSettings must be used within an OrganizationSettingsProvider"
    );
  }
  return context;
}
