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
    title: "États Financiers SYSCOHADA",
    description:
      "Générez automatiquement vos bilans, comptes de résultat et tableaux de flux conformes aux normes SYSCOHADA.",
  },
  {
    icon: Building2,
    title: "Multi-Entreprises",
    description:
      "Gérez plusieurs entreprises et leurs exercices financiers depuis une seule plateforme.",
  },
  {
    icon: TrendingUp,
    title: "Analyses Avancées",
    description:
      "Obtenez des analyses financières détaillées et des ratios de performance automatiquement calculés.",
  },
  {
    icon: Shield,
    title: "Sécurisé & Conforme",
    description:
      "Vos données sont protégées avec un chiffrement de niveau bancaire et une conformité RGPD.",
  },
  {
    icon: Zap,
    title: "Import CSV Rapide",
    description:
      "Importez vos balances comptables en quelques clics depuis votre logiciel de comptabilité.",
  },
  {
    icon: Globe,
    title: "Norme Internationale",
    description:
      "Respect total des normes OHADA et SYSCOHADA pour l&apos;Afrique de l&apos;Ouest et Centrale.",
  },
];

const testimonials = [
  {
    name: "Amadou Diallo",
    role: "Directeur Financier, ABC SARL",
    content:
      "EtaFi a révolutionné notre processus de reporting financier. Nous générons nos états SYSCOHADA en minutes au lieu de jours.",
    rating: 5,
  },
  {
    name: "Marie Kouassi",
    role: "Expert-Comptable, Cabinet KPMG Abidjan",
    content:
      "Un outil indispensable pour tous les cabinets comptables. La conformité SYSCOHADA est parfaite et les clients adorent.",
    rating: 5,
  },
  {
    name: "Ibrahim Traore",
    role: "PDG, XYZ Industries",
    content:
      "Interface intuitive et résultats professionnels. Nos investisseurs sont impressionnés par la qualité de nos rapports.",
    rating: 5,
  },
];

const stats = [
  { number: "500+", label: "Entreprises" },
  { number: "12", label: "Pays OHADA" },
  { number: "99.9%", label: "Conformité" },
  { number: "5min", label: "Génération" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EtaFi</h1>
                <p className="text-xs text-gray-500 font-medium">SYSCOHADA</p>
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
                Témoignages
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Tarifs
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth/register">
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
            <Badge className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 border-rose-200 mb-6">
              <Star className="h-3 w-3" />
              Conforme SYSCOHADA & OHADA
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Générez vos{" "}
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                États Financiers
              </span>
              <br />
              SYSCOHADA en minutes
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              La plateforme de référence pour créer des états financiers
              conformes aux normes SYSCOHADA pour l&apos;Afrique de l&apos;Ouest
              et Centrale. Simple, rapide et professionnel.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/register">
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-rose-100/50 to-pink-100/50 rounded-full blur-3xl"></div>
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
              Tout ce dont vous avez besoin pour vos états financiers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              EtaFi simplifie la création d&apos;états financiers conformes
              SYSCOHADA avec des fonctionnalités pensées pour les entreprises
              africaines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="etafi-card hover:shadow-xl group">
                <CardContent className="etafi-card-content">
                  <div className="h-12 w-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
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

      {/* Screenshot/Demo Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Interface moderne et intuitive
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre interface conçue pour les comptables et dirigeants
              d&apos;entreprise modernes.
            </p>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 shadow-2xl">
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
                          ENTREPRISES
                        </p>
                        <p className="text-2xl font-bold text-blue-900">24</p>
                      </div>
                      <Building2 className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 font-medium">
                          ÉTATS GÉNÉRÉS
                        </p>
                        <p className="text-2xl font-bold text-green-900">156</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-600 font-medium">
                          CONFORMITÉ
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          100%
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aperçu du tableau de bord</p>
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
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez ce que nos clients disent d&apos;EtaFi et comment nous
              les aidons à simplifier leur comptabilité.
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
      <section className="py-20 md:py-28 bg-gradient-to-br from-rose-500 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à révolutionner votre comptabilité ?
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-3xl mx-auto">
            Rejoignez des centaines d&apos;entreprises qui utilisent déjà EtaFi
            pour générer leurs états financiers SYSCOHADA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-white text-rose-600 hover:bg-gray-50 text-lg px-8 py-4 font-semibold"
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
                <div className="h-8 w-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">EtaFi</h1>
                  <p className="text-xs text-gray-400 font-medium">SYSCOHADA</p>
                </div>
              </div>
              <p className="text-gray-400">
                La plateforme de référence pour les états financiers SYSCOHADA
                en Afrique.
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
