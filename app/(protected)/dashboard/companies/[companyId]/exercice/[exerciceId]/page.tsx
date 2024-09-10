// @ts-nocheck


'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useSession } from "next-auth/react"; // Import useSession for authentication
import { BalanceSheetTable } from "@/app/(protected)/_components/balance-sheet";
import DocumentsList from "@/app/(protected)/_components/documents-list";
import ReminderTable from "@/app/(protected)/_components/reminders-table";

export default function ExerciceDetailPage() {
  const { exerciceId, companyId } = useParams();
  const { data: session } = useSession(); // Get current session and user data
  const [exercice, setExercice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState([]);
  const [documents, setDocuments] = useState([]); // State for documents
  const [reminders, setReminders] = useState([]);  // State for reminders (initially empty)

  // Fetch exercice details, balance sheet, documents, and reminders
  useEffect(() => {
    const fetchExercice = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch exercice details");
        }
        const data = await response.json();
        setExercice(data);

        // Fetch balance sheet
        const balanceResponse = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}/balance`);
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalanceSheetData(balanceData.data);
        } else {
          const savedData = localStorage.getItem(`balance-sheet-${exerciceId}`);
          if (savedData) {
            setBalanceSheetData(JSON.parse(savedData));
          }
        }

        // Fetch documents
        const documentsResponse = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}/documents`);
        if (documentsResponse.ok) {
          const docs = await documentsResponse.json();
          setDocuments(docs);
        } else {
          throw new Error("Failed to fetch documents");
        }

        // Fetch reminders
        const remindersResponse = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}/reminders`);
        if (remindersResponse.ok) {
          const rems = await remindersResponse.json();
          setReminders(rems); // Set the fetched reminders
        } else {
          throw new Error("Failed to fetch reminders");
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (exerciceId) {
      fetchExercice();
    }
  }, [exerciceId, companyId]);

  // Handle document upload
  const handleUploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const newDocument = await response.json();
      setDocuments((prevDocs) => [...prevDocs, newDocument]); // Add new document to state
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId)); // Remove document from state
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  // Handle reminder save (create or update)
  const handleSaveReminder = async (reminderData, reminderId = null) => {
    try {
      const method = reminderId ? 'PATCH' : 'POST';
      const url = reminderId 
        ? `/api/companies/${companyId}/exercice/${exerciceId}/reminders/${reminderId}` 
        : `/api/companies/${companyId}/exercice/${exerciceId}/reminders`;
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      });
  
      if (!response.ok) {
        throw new Error(reminderId ? "Failed to update reminder" : "Failed to create reminder");
      }
  
      const newReminder = await response.json();
      if (reminderId) {
        setReminders((prevReminders) =>
          prevReminders?.map((rem) => (rem.id === reminderId ? newReminder : rem))
        );
      } else {
        setReminders((prevReminders) => [...prevReminders, newReminder]);
      }
      
      alert(reminderId ? "Rappel mis à jour avec succès !" : "Rappel créé avec succès !");
    } catch (error) {
      console.error("Error saving reminder:", error.message);
      alert(`Failed to save reminder: ${error.message}`);
    }
  };

  // Handle reminder deletion
  const handleDeleteReminder = async (reminderId) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/exercice/${exerciceId}/reminders/${reminderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reminder");
      }

      setReminders((prevReminders) => prevReminders.filter((rem) => rem.id !== reminderId)); // Remove reminder from state
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Failed to delete reminder");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/companies/${companyId}`}>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          Exercice: {exercice?.name}
          {exercice && (
            <Badge variant="outline" className="text-sm">
              Du {new Date(exercice?.startDate).toLocaleDateString("fr-FR")} au {new Date(exercice?.endDate).toLocaleDateString("fr-FR")}
            </Badge>
          )}
        </h1>
      </div>

      {/* Balance Sheet Section */}
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
          <CardDescription>
            Téléchargez ou modifiez les données du bilan pour cet exercice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <BalanceSheetTable
              data={balanceSheetData}
              setData={setBalanceSheetData}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Documents liés</CardTitle>
          <CardDescription>Liste des documents liés à cet exercice.</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentsList
            documents={documents}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        </CardContent>
      </Card>

      {/* Reminder Table Section */}
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Rappels</CardTitle>
          <CardDescription>Liste des rappels créés pour cet exercice.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReminderTable
            reminders={reminders}
            onSaveReminder={handleSaveReminder} // Pass the save handler
            onDeleteReminder={handleDeleteReminder} // Pass the delete handler
          />
        </CardContent>
      </Card>
    </div>
  );
}
