"use client";

import { HelpCircle, Book, MessageCircle, Video, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HelpPage() {
  const helpCategories = [
    {
      id: 1,
      title: "Guide de démarrage",
      description: "Apprenez les bases d'EtaFi en quelques minutes",
      icon: Book,
      articles: 8,
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: 2,
      title: "Gestion des entreprises",
      description: "Créer et gérer vos entreprises et exercices",
      icon: Book,
      articles: 12,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "États financiers",
      description: "Générer et interpréter vos rapports",
      icon: Book,
      articles: 15,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      title: "Plan comptable SYSCOHADA",
      description: "Comprendre et utiliser le référentiel",
      icon: Book,
      articles: 20,
      color: "from-orange-500 to-red-500",
    },
  ];

  const quickActions = [
    {
      title: "Vidéos tutoriels",
      description: "Regardez nos vidéos explicatives",
      icon: Video,
      action: "Voir les vidéos",
    },
    {
      title: "Contacter le support",
      description: "Obtenez de l'aide de notre équipe",
      icon: MessageCircle,
      action: "Nous contacter",
    },
  ];

  const faqItems = [
    {
      question: "Comment créer ma première entreprise ?",
      answer:
        "Rendez-vous dans la section Entreprises et cliquez sur 'Nouvelle Entreprise'. Remplissez les informations requises.",
    },
    {
      question: "Qu'est-ce que le plan comptable SYSCOHADA ?",
      answer:
        "SYSCOHADA est le système comptable et financier harmonisé utilisé dans plusieurs pays d'Afrique de l'Ouest et Centrale.",
    },
    {
      question: "Comment générer un bilan comptable ?",
      answer:
        "Accédez aux États Financiers, sélectionnez votre entreprise et exercice, puis choisissez le type de rapport à générer.",
    },
    {
      question: "Puis-je inviter d'autres utilisateurs ?",
      answer:
        "Oui, allez dans la section Utilisateurs pour inviter des collaborateurs avec différents niveaux d'accès.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center animate-fade-in-up">
            <h1 className="etafi-section-header">Centre d&apos;aide</h1>
            <p className="etafi-section-subtitle mb-8">
              Trouvez les réponses à vos questions sur EtaFi
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher dans l'aide..."
                  className="etafi-input pl-12 py-3 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Help Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Catégories d&apos;aide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((category) => (
              <Card
                key={category.id}
                className="etafi-card hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}
                    >
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {category.description}
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        {category.articles} articles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="etafi-card hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <action.icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-gray-600">{action.description}</p>
                    </div>
                    <div className="text-blue-600 font-medium">
                      {action.action} →
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="etafi-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    {item.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="mt-12 text-center">
          <Card className="etafi-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Besoin d&apos;aide supplémentaire ?
              </h3>
              <p className="text-gray-600 mb-6">
                Notre équipe support est là pour vous aider à réussir avec EtaFi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-blue-600">support@etafi.com</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">Téléphone</p>
                  <p className="text-blue-600">+225 01 23 45 67</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
