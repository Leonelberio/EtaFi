// @ts-nocheck

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UploadPlanComptable() {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  // Handle file selection
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
      readFileContent(event.target.files[0]);
    }
  };

  // Function to read file content using FileReader
  const readFileContent = (file: File) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const content = e.target?.result as string;
      setFileContent(content);
      // Save content to localStorage after reading it
      localStorage.setItem("planComptable", content);
    };

    reader.onerror = function (error) {
      console.error("Error reading file:", error);
      alert("Erreur lors de la lecture du fichier.");
    };

    reader.readAsText(file); // Reading the file as text
  };

  // Handle file upload to the server (optional)
  const handleUpload = async () => {
    if (!file) return alert("Veuillez sélectionner un fichier.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/plan-comptable/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Plan comptable téléchargé avec succès !");
      } else {
        alert("Échec du téléchargement du plan comptable.");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier :", error);
    }
  };

  return (
    <div>
      <Input type="file" accept=".csv" onChange={handleFileUpload} />
      <Button onClick={handleUpload}>Télécharger le Plan Comptable</Button>

      {/* Display file content for debugging purposes */}
      {fileContent && (
        <pre className="mt-4 p-4 bg-gray-200 rounded">
          {fileContent}
        </pre>
      )}
    </div>
  );
}
