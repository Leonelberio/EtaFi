"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { ReactNode } from "react";

interface SessionProviderWrapperProps {
  children: ReactNode;
  session: Session | null;
}

export default function SessionProviderWrapper({
  children,
  session,
}: SessionProviderWrapperProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
