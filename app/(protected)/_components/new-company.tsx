"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Upload,
  MapPin,
  Phone,
  Mail,
  Hash,
  Users,
  Building,
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
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
}

export default function NewCompany() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    nif: "",
    contact: "",
    email: "",
    phone: "",
    website: "",
    logo: null as File | null,
    organizationId: "",
    sector: "",
    description: "",
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

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
      if (!session?.user?.id) {
        throw new Error("User is not authenticated");
      }

      let logoUrl = "";
      if (formData.logo) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.logo);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          logoUrl = uploadData.url;
        }
      }

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          nif: formData.nif,
          contact: formData.contact,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          logo: logoUrl,
          organizationId: formData.organizationId || null,
          sector: formData.sector,
          description: formData.description,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/companies");
      } else {
        throw new Error("Failed to create company");
      }
    } catch (error) {
      console.error("Error creating company:", error);
      alert("Erreur lors de la création de l'entreprise");
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
            <Link href="/dashboard/companies">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux Entreprises
              </Button>
            </Link>
          </div>
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-medium text-gray-600">
                Nouvelle Entreprise Cliente
              </span>
            </div>
            <h1 className="etafi-section-header">
              Ajouter une Entreprise Cliente
            </h1>
            <p className="etafi-section-subtitle">
              Créez un nouveau profil d&apos;entreprise pour votre client et
              configurez ses informations essentielles
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
                Les informations de base sur l&apos;entreprise cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nom de l&apos;Entreprise *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ABC SARL, XYZ SA..."
                    className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <Label htmlFor="nif">
                    <Hash className="h-4 w-4 inline mr-1" />
                    Numéro d&apos;Identification Fiscale (NIF) *
                  </Label>
                  <Input
                    id="nif"
                    name="nif"
                    type="text"
                    required
                    value={formData.nif}
                    onChange={handleInputChange}
                    placeholder="CI-ABJ-01-2024-A-12345678"
                    className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <Label htmlFor="sector">Secteur d&apos;Activité</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, sector: value }))
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500">
                      <SelectValue placeholder="Sélectionnez le secteur" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                      <SelectItem value="industrie">Industrie</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="technologie">Technologie</SelectItem>
                      <SelectItem value="sante">Santé</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">
                    Description de l&apos;Activité
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez brièvement l'activité principale de l'entreprise..."
                    className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="organizationId">
                    <Users className="h-4 w-4 inline mr-1" />
                    Organisation Propriétaire
                  </Label>
                  <Select
                    value={
                      formData.organizationId === ""
                        ? "none"
                        : formData.organizationId
                    }
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        organizationId: value === "none" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500">
                      <SelectValue placeholder="Sélectionnez votre organisation" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="none">Aucune (indépendant)</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="logo">Logo de l&apos;Entreprise</Label>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                        {formData.logo ? (
                          <img
                            src={URL.createObjectURL(formData.logo)}
                            alt="Logo preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-gray-400" />
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
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Télécharger le logo
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          PNG, JPG jusqu&apos;à 2MB. Recommandé: 256x256px
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
                Coordonnées et adresse de l&apos;entreprise cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Adresse Complète *
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Rue, quartier, commune, ville..."
                    className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+225 27 XX XX XX XX"
                    className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@entreprise.com"
                    className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <Label htmlFor="contact">Personne de Contact *</Label>
                  <Input
                    id="contact"
                    name="contact"
                    type="text"
                    required
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Nom du responsable ou gérant"
                    className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Site Web</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.entreprise.com"
                    className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div
            className="flex items-center justify-between pt-6 border-t border-gray-200 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link href="/dashboard/companies">
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
                  Création en cours...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Créer l&apos;Entreprise
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
