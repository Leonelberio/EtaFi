// @ts-nocheck


"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import ExercicesList from "@/app/(protected)/_components/exercices-list"; // Exercise List Component
import DocumentsList from "@/app/(protected)/_components/documents-list";

export default function CompanyDetailPage() {
  const { companyId } = useParams(); 
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [nif, setNif] = useState('');
  const [contact, setContact] = useState('');
  const [imageSrc, setImageSrc] = useState("/placeholder.svg");
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [exercices, setExercices] = useState([]); // State for exercises
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const router = useRouter();
  const [documents, setDocuments] = useState([]); // State for company documents

  // Fetch company details and exercises
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch company details");
        }
        const data = await response.json();
        setCompany(data);
        setName(data.name);
        setAddress(data.address);
        setNif(data.nif);
        setContact(data.contact);
        setImageSrc(data.logo || "/placeholder.svg");
        setExercices(data.exercices || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany(); 
    }
  }, [companyId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewLogo(e.target.files[0]);
      setImageSrc(URL.createObjectURL(e.target.files[0]));
      setIsButtonDisabled(false);
    }
  };

  const handleRemoveLogo = () => {
    setImageSrc("/placeholder.svg");
    setNewLogo(null);
    setIsButtonDisabled(false);
  };

  const handleInputChange = (setter: Function) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
    setIsButtonDisabled(false);
  };

  const handleSave = async () => {
    try {
      let logoUrl = imageSrc;

      if (imageSrc === "/placeholder.svg" && !newLogo) {
        logoUrl = null;
      } else if (newLogo) {
        const formData = new FormData();
        formData.append("file", newLogo);
        const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      const response = await fetch(`/api/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, nif, contact, logo: logoUrl }),
      });

      if (!response.ok) throw new Error("Failed to save company details");
      setIsButtonDisabled(true);
      router.refresh(); 
    } catch (error) {
      console.error("Error saving company details:", error);
    }
  };

  const handleNewExercice = async (name: number, startDate: Date, endDate: Date) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/exercice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, startDate, endDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to create new exercice");
      }

      const newExercice = await response.json();
      setExercices((prev) => [...prev, newExercice]);
    } catch (error) {
      console.error("Error adding new exercice:", error);
    }
  };


  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await fetch(`/api/companies/${companyId}/documents`);
      const data = await response.json();
      setDocuments(data);
    };

    fetchDocuments();
  }, [companyId]);

  

  const handleUploadDocument = async (file, isExercice = false, exerciceId = null) => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      let uploadUrl = `/api/companies/${companyId}/documents`;
      if (isExercice && exerciceId) {
        uploadUrl = `/api/companies/${companyId}/exercice/${exerciceId}/documents`;
      }
  
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.statusText}`);
      }
  
      const newDocument = await response.json();
      setDocuments((prevDocs) => [...prevDocs, newDocument]); // Add the new document to the state
    } catch (error) {
      console.error("Error during document upload:", error);
      alert("Failed to upload document");
    }
  };
  
  
  

  
  // Handle document deletion for a company
  const handleDeleteDocument = async (documentId) => {
    await fetch(`/api/companies/${companyId}/documents/${documentId}`, {
      method: "DELETE",
    });

    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId)); // Remove the document from the state
  };

  // DELETE Exercise Function
  const handleDeleteExercice = async (exerciceId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete exercice");
      }

      setExercices((prevExercices) => prevExercices.filter((ex) => ex.id !== exerciceId)); // Remove from UI
    } catch (error) {
      console.error("Error deleting exercice:", error);
    }
  };


  

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/companies">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div className="w-full flex justify-between gap-4">
            <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
            <Button size="sm" onClick={handleSave} disabled={isButtonDisabled}>
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {/* Détails de l'entreprise */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Détails de l&apos;entreprise</CardTitle>
              <CardDescription>
                Modifiez les détails de l&apos;entreprise ici.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" value={name} onChange={handleInputChange(setName)} />
                <Label htmlFor="address">Adresse</Label>
                <Textarea id="address" value={address} onChange={handleInputChange(setAddress)} />
                <Label htmlFor="nif">NIF</Label>
                <Input id="nif" value={nif} onChange={handleInputChange(setNif)} />
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" value={contact} onChange={handleInputChange(setContact)} />
              </div>
            </CardContent>
          </Card>

          {/* Logo de l'entreprise */}
          <Card>
            <CardHeader>
              <CardTitle>Logo de l&apos;entreprise</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-center">
                <Image alt="Company logo" src={imageSrc} width={200} height={200} className="rounded-md" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveLogo}
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </Button>
              <Input type="file" accept="image/*" onChange={handleLogoChange} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Exercices Financiers Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Exercices Financiers</CardTitle>
            <CardDescription>Liste des exercices financiers de cette entreprise.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Call the exercise list component */}
            <ExercicesList exercices={exercices} onNewExercice={handleNewExercice} onDeleteExercice={handleDeleteExercice} />
          </CardContent>
        </Card>


<Card className="mt-8">
  <CardHeader>
    <CardTitle>Documents liés</CardTitle>
    <CardDescription>Liste des documents liés.</CardDescription>
  </CardHeader>
  <CardContent>
    <DocumentsList
      documents={documents}
      onUploadDocument={handleUploadDocument}
      onDeleteDocument={handleDeleteDocument}
    />
  </CardContent>
</Card>

      </div>
    </main>
  );
}
