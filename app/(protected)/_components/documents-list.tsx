// @ts-nocheck


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, FileText } from 'lucide-react'; // Importing Trash and File Icon
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
import { format } from 'date-fns'; // Format dates

// Reusable component to handle document lists for both companies and exercises
export default function DocumentsList({ documents, onUploadDocument, onDeleteDocument }) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const { companyId, exerciceId } = useParams();

  const handleFileChange = (event) => {
    setNewFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (newFile) {
      await onUploadDocument(newFile);
      setIsDialogOpen(false);
      setNewFile(null);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedDocumentId(id);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedDocumentId) {
      await onDeleteDocument(selectedDocumentId);
      setShowConfirmDelete(false);
      setSelectedDocumentId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Documents</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>+ Ajouter un document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Ajouter un document</DialogTitle>
            <div className="mt-4">
              <Input type="file" onChange={handleFileChange} />
              <Button onClick={handleUpload} disabled={!newFile} className="mt-4">
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document List */}
      {documents.length > 0 ? (
        documents.map((document) => (
          <div key={document.id} className="m-4">
            <CardContent className="flex items-center gap-4">
              {/* Document Icon */}
              <FileText className="w-6 h-6 text-gray-500" />

              <div className="grid gap-1 flex-grow">
                {/* Document clickable link */}
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium leading-none hover:underline"
                >
                  {document.fileName}
                </a>

                {/* Created at and created by */}
                <p className="text-xs text-muted-foreground">
                  Créé le {document.createdAt ? format(new Date(document.createdAt), 'dd/MM/yyyy') : 'Date inconnue'}{' '}
                  {document.createdBy?.name && `par ${document.createdBy.name}`}
                </p>

                {/* Updated at */}
                <p className="text-xs text-muted-foreground">
                  Dernière mise à jour le{' '}
                  {document.updatedAt ? format(new Date(document.updatedAt), 'dd/MM/yyyy') : 'Date inconnue'}
                </p>
              </div>

              {/* Delete Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 ml-auto"
                onClick={() => handleDeleteClick(document.id)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardContent>
          </div>
        ))
      ) : (
        <p>Aucun document trouvé</p>
      )}

      {/* Confirmation Dialog for Deleting a Document */}
      {showConfirmDelete && (
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent>
            <DialogTitle>Confirmation de suppression</DialogTitle>
            <p>Êtes-vous sûr de vouloir supprimer ce document ?</p>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
