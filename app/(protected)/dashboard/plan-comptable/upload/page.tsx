// @ts-nocheck


"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UploadPlanComptable() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/plan-comptable/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Plan comptable uploaded successfully!");
      } else {
        alert("Failed to upload plan comptable.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <Input type="file" accept=".csv" onChange={handleFileUpload} />
      <Button onClick={handleUpload}>Upload Plan Comptable</Button>
    </div>
  );
}
