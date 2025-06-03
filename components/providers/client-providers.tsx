"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { ReactNode, Component, ErrorInfo } from "react";

interface ClientProvidersProps {
  children: ReactNode;
  session: Session | null;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SessionErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SessionProvider error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de Session
            </h2>
            <p className="text-gray-600 mb-4">
              Une erreur s'est produite lors de l'initialisation de la session.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ClientProviders({
  children,
  session,
}: ClientProvidersProps) {
  return (
    <SessionErrorBoundary>
      <SessionProvider
        session={session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus={true}
      >
        {children}
      </SessionProvider>
    </SessionErrorBoundary>
  );
}
