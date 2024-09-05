// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Database, FileText, Sheet, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import SelectDataSource from "./SelectDataSource";


export function ComparatorDetailPage({ comparator }) {
  const [name, setName] = useState(comparator?.name || "");
  const [description, setDescription] = useState(comparator?.description || "");
  const [color, setColor] = useState(comparator?.color || "#000000");
  const [imageSrc, setImageSrc] = useState(comparator?.logo || "/placeholder.svg");
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [showDataSource, setShowDataSource] = useState(false);
  const [sheets, setSheets] = useState<{ id: string; name: string }[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<any>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchDataSources();
    checkAccessToken();
  }, [] );

  const fetchDataSources = async () => {
    try {
      const response = await fetch(`/api/comparators/${comparator.id}/data-source`);
      if (!response.ok) throw new Error("Failed to fetch data sources");
      
      const data = await response.json();
      setDataSources(data);
    } catch (error) {
      console.error("Error fetching data sources:", error);
    }
  };

  const checkAccessToken = async () => {
    try {
      const response = await fetch("/api/google/check-token");
      const { hasToken } = await response.json();
      setShowDataSource(hasToken);
    } catch (error) {
      console.error("Error checking access token:", error);
    }
  };

  const getGoogleSheetsAuthUrl = async () => {
    try {
      const response = await fetch("/api/google/initiate");
      if (!response.ok) {
        throw new Error("Failed to get Google Sheets auth URL");
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error getting Google Sheets auth URL:", error);
      return null;
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewLogo(e.target.files[0]);
      setImageSrc(URL.createObjectURL(e.target.files[0]));
      setIsButtonDisabled(false);
    }
  };

  const handleInputChange = (setter: Function) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
    setIsButtonDisabled(false);
  };

  const handleSelectGoogleSheets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/google/check-token");
      const { hasToken } = await response.json();

      if (hasToken) {
        setShowDataSource(!showDataSource);
      } else {
        const authUrl = await getGoogleSheetsAuthUrl();
        const popup = window.open(authUrl, "Google Sheets Authentication", "width=600,height=600");

        const interval = setInterval(() => {
          if (popup.closed) {
            clearInterval(interval);
            checkAccessToken();
            router.refresh();
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error initiating Google Sheets auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      let logoUrl = imageSrc;
      if (newLogo) {
        const formData = new FormData();
        formData.append("file", newLogo);
        const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      const response = await fetch(`/api/comparators/${comparator.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, color, logo: logoUrl }),
      });

      if (!response.ok) throw new Error("Failed to save comparator");
      setIsButtonDisabled(true);
      router.refresh(); // Refresh the page to reflect the changes
    } catch (error) {
      console.error("Error saving comparator:", error);
    }
  };

  const handleEditDataSource = (dataSource) => {
    setSelectedDataSource(dataSource);
    setShowDataSource(true); // Show the data source editing form
  };

  const handleFinish = () => {
    setSelectedDataSource(null); // Reset the selected data source after finishing editing
    setShowDataSource(false);
    fetchDataSources(); // Refresh the data sources list
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Link href="/web/comparators">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div className="w-full flex justify-between gap-4">
            <div className="flex gap-2">

            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {name}
            </h1>
             {/* New Link to open the comparator view in a new tab */}
             <Link href={`/web/comparators/${comparator.id}/views?v=compare`} target="_blank" className="text-purple-600">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                Voir le comparateur
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            </div>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isButtonDisabled} // Disable until changes are made
            >
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Détails du comparateur</CardTitle>
                <CardDescription>
                  Modifiez les détails de votre comparateur ici.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      type="text"
                      className="w-full"
                      value={name}
                      onChange={handleInputChange(setName)} // Handle change and enable save button
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={handleInputChange(setDescription)} // Handle change and enable save button
                      className="min-h-32"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="color">Couleur</Label>
                    <Input
                      id="color"
                      type="color"
                      className="w-20"
                      value={color}
                      onChange={handleInputChange(setColor)} // Handle change and enable save button
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source de données</CardTitle>
                <CardDescription>
                  Gérez les sources de données associées à ce comparateur.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 h-12">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-full w-full"
                    onClick={handleSelectGoogleSheets}
                  >
                    <Sheet className="h-4 w-4" />
                    Google Sheets
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-full w-full">
                    <FileText className="h-4 w-4" />
                    Notion
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-full w-full">
                    <Database className="h-4 w-4" />
                    Airtable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Image du comparateur</CardTitle>
                <CardDescription>
                  Téléchargez et gérez l&apos;image associée à ce comparateur.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Image
                    alt="Comparator image"
                    className="aspect-square w-full rounded-md object-contain"
                    height="300"
                    src={imageSrc}
                    width="300"
                  />
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange} // Handle change and enable save button
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conditionally render SelectDataSource based on showDataSource state */}
        {showDataSource && (
          <SelectDataSource
            params={{ comparatorId: comparator.id }}
            sheets={sheets}
            setSheets={setSheets}
            selectedDataSource={selectedDataSource} // Pass the selected data source to the component
            onFinish={handleFinish} // Pass handleFinish to SelectDataSource
          />
        )}

        {/* Render existing data sources */}
        {dataSources.length > 0 && (
          <div className="grid gap-4 mt-6">
            {dataSources.map((dataSource) => (
              <Card key={dataSource.id}>
                <CardHeader>
                  <CardTitle>{dataSource.type} Data Source</CardTitle>
                  <CardDescription>
                    Feuille: {dataSource.sheetId || "N/A"} <br />
                    Onglet: {dataSource.selectedColumns[0]?.tabName || "N/A"} <br />
                    Filtres: {dataSource.selectedColumns.map(col => col.columnName).join(", ")} <br />
                    Critères: {dataSource.selectedRows.map(row => row.rowName).join(", ")}
                  </CardDescription>
                  <Button variant="ghost" size="icon" onClick={() => handleEditDataSource(dataSource)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
