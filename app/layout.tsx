import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";
import ClientProviders from "@/components/providers/client-providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Système de Comptabilité Multi-Organisations",
  description:
    "Plateforme moderne de comptabilité multi-tenant avec gestion des factures, codes de taxe et génération automatique des écritures comptables",
  keywords:
    "comptabilité, multi-tenant, factures, codes de taxe, grand livre, Next.js, Prisma, PostgreSQL",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="fr" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="./favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} font-sans`}>
        <ClientProviders session={session}>
          <div className="min-h-screen bg-gray-50">{children}</div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
