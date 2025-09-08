"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  Star,
  PlayCircle,
  BarChart3,
  Calculator,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    title: "Système de Comptabilité Complet",
    description:
      "Gérez vos factures, codes de taxe, activités et générez automatiquement les écritures comptables du Grand Livre.",
  },
  {
    icon: Building2,
    title: "Multi-Organisations",
    description:
      "Gérez plusieurs organisations avec leurs comptes, fournisseurs, clients et projets depuis une seule plateforme.",
  },
  {
    icon: TrendingUp,
    title: "Posting Automatique",
    description:
      "Génération automatique des écritures comptables avec équilibre débit/crédit et mapping intelligent par groupe.",
  },
  {
    icon: Shield,
    title: "Sécurisé & Multi-Tenant",
    description:
      "Architecture multi-tenant sécurisée avec authentification NextAuth et validation des données Zod.",
  },
  {
    icon: Zap,
    title: "Codes de Taxe & TVA",
    description:
      "Gestion complète des codes de taxe avec comptes 445xx et calcul automatique HT/TVA/TTC sur les factures.",
  },
  {
    icon: Globe,
    title: "Grand Livre & Rapports",
    description:
      "Grand livre complet avec filtres, soldes automatiques et export des données pour vos rapports financiers.",
  },
];

const testimonials = [
  {
    name: "Next.js 15 + App Router",
    role: "Framework moderne et performant",
    content:
      "Architecture Next.js 15 avec App Router, Server Components et optimisation automatique des performances.",
    rating: 5,
  },
  {
    name: "Prisma + PostgreSQL",
    role: "Base de données robuste",
    content:
      "ORM Prisma avec base PostgreSQL, migrations automatiques et relations optimisées pour la comptabilité.",
    rating: 5,
  },
  {
    name: "shadcn/ui + Tailwind",
    role: "Interface utilisateur moderne",
    content:
      "Composants UI professionnels avec Tailwind CSS, design system cohérent et responsive design.",
    rating: 5,
  },
];

const stats = [
  { number: "Multi", label: "Organisations" },
  { number: "100%", label: "Multi-Tenant" },
  { number: "Auto", label: "Posting" },
  { number: "Securisé", label: "NextAuth" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EtaFi</h1>
                <p className="text-xs text-gray-500 font-medium">
                  Comptabilité
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Fonctionnalités
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Technologies
              </Link>
              <Link
                href="/dashboard/tax-codes"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Démo
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="etafi-button-primary">
                  Commencer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <Badge className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 mb-6">
              <Star className="h-3 w-3" />
              Système Comptable Multi-Tenant
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Système de{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Comptabilité Complet
              </span>
              <br />
              Multi-Organisations & Multi-Tenant
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Plateforme moderne de comptabilité avec gestion des factures,
              codes de taxe, activités et génération automatique des écritures
              comptables. Architecture sécurisée multi-tenant prête pour la
              production.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="etafi-button-primary text-lg px-8 py-4"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Commencer Gratuitement
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="etafi-button-secondary text-lg px-8 py-4"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Voir la Démo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/50 to-blue-200/50 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 mb-6">
              <Zap className="h-3 w-3" />
              Fonctionnalités Avancées
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Système de comptabilité complet et moderne
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plateforme de comptabilité multi-organisations avec gestion des
              factures, codes de taxe, activités et génération automatique des
              écritures comptables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="etafi-card hover:shadow-xl group">
                <CardContent className="etafi-card-content">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 mb-6">
              <Zap className="h-3 w-3" />
              Technologies & Architecture
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stack technique moderne et robuste
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Construit avec les meilleures technologies du marché pour une
              performance et une sécurité optimales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="etafi-card text-center p-6">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Next.js 15
              </h3>
              <p className="text-sm text-gray-600">
                App Router, Server Components, Turbopack
              </p>
            </Card>

            <Card className="etafi-card text-center p-6">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                NextAuth
              </h3>
              <p className="text-sm text-gray-600">
                Authentification sécurisée multi-tenant
              </p>
            </Card>

            <Card className="etafi-card text-center p-6">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Prisma
              </h3>
              <p className="text-sm text-gray-600">
                ORM type-safe avec PostgreSQL
              </p>
            </Card>

            <Card className="etafi-card text-center p-6">
              <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                shadcn/ui
              </h3>
              <p className="text-sm text-gray-600">
                Composants UI professionnels
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshot/Demo Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dashboard de gestion comptable
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interface moderne pour gérer vos codes de taxe, activités,
              factures et visualiser votre grand livre en temps réel.
            </p>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 bg-red-400 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-500">
                    EtaFi Dashboard
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 font-medium">
                          ORGANISATIONS
                        </p>
                        <p className="text-2xl font-bold text-blue-900">12</p>
                      </div>
                      <Building2 className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 font-medium">
                          FACTURES
                        </p>
                        <p className="text-2xl font-bold text-green-900">89</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-600 font-medium">
                          ÉCRITURES
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          234
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Gestion des codes de taxe et factures
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="inline-flex items-center gap-2 bg-green-50 text-green-700 border-green-200 mb-6">
              <Star className="h-3 w-3" />
              Témoignages Clients
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Architecture moderne et sécurisée
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Système de comptabilité multi-tenant avec authentification
              NextAuth, validation Zod et base de données PostgreSQL optimisée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="etafi-card">
                <CardContent className="etafi-card-content">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à utiliser le système de comptabilité moderne ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Système de comptabilité multi-organisations avec gestion des
            factures, codes de taxe et génération automatique des écritures
            comptables.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-4 font-semibold"
              >
                <FileText className="mr-2 h-5 w-5" />
                Commencer Maintenant
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
            >
              <Download className="mr-2 h-5 w-5" />
              Télécharger la Brochure
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">EtaFi</h1>
                  <p className="text-xs text-gray-400 font-medium">
                    Comptabilité
                  </p>
                </div>
              </div>
              <p className="text-gray-400">
                Système de comptabilité multi-organisations moderne et sécurisé
                avec architecture multi-tenant.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Démo
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Carrières
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Presse
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 EtaFi. Tous droits réservés.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Confidentialité
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Conditions
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
