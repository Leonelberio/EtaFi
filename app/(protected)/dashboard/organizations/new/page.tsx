"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "Côte d'Ivoire",
    phone: "",
    email: "",
    website: "",
    logo: null as File | null,
    type: "cabinet-comptable",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would make the API call to create the organization
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Mock delay

      // Redirect to dashboard with success message
      router.push("/dashboard?success=organization-created");
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("Erreur lors de la création de l'organisation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          </div>
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-medium text-gray-600">
                Nouvelle Organisation
              </span>
            </div>
            <h1 className="etafi-section-header">Créer une Organisation</h1>
            <p className="etafi-section-subtitle">
              Configurez votre nouveau cabinet comptable ou organisation
              professionnelle
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="etafi-card animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-rose-500" />
                Informations Générales
              </CardTitle>
              <CardDescription>
                Les informations de base sur votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nom de l&apos;Organisation *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Cabinet Comptable EtaFi"
                    className="etafi-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="type">Type d&apos;Organisation</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="etafi-input">
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cabinet-comptable">
                        Cabinet Comptable
                      </SelectItem>
                      <SelectItem value="expertise-comptable">
                        Expertise Comptable
                      </SelectItem>
                      <SelectItem value="audit-conseil">
                        Cabinet d&apos;Audit et Conseil
                      </SelectItem>
                      <SelectItem value="fiduciaire">
                        Société Fiduciaire
                      </SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez brièvement votre organisation et ses services..."
                    className="etafi-input"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="logo">Logo de l&apos;Organisation</Label>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        {formData.logo ? (
                          <img
                            src={URL.createObjectURL(formData.logo)}
                            alt="Logo preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Télécharger le logo
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          PNG, JPG jusqu'à 2MB. Recommandé: 256x256px
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card
            className="etafi-card animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-rose-500" />
                Informations de Contact
              </CardTitle>
              <CardDescription>
                Coordonnées et adresse de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Adresse Complète *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Rue, quartier, commune..."
                    className="etafi-input"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Abidjan"
                    className="etafi-input"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, country: value }))
                    }
                  >
                    <SelectTrigger className="etafi-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Côte d'Ivoire">
                        Côte d&apos;Ivoire
                      </SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                      <SelectItem value="Mali">Mali</SelectItem>
                      <SelectItem value="Sénégal">Sénégal</SelectItem>
                      <SelectItem value="Bénin">Bénin</SelectItem>
                      <SelectItem value="Togo">Togo</SelectItem>
                      <SelectItem value="Niger">Niger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+225 27 XX XX XX XX"
                    className="etafi-input"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@etafi.com"
                    className="etafi-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="website">Site Web</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.etafi.com"
                    className="etafi-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link href="/dashboard">
              <Button variant="outline" className="etafi-button-secondary">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="etafi-button-primary"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Créer l&apos;Organisation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
