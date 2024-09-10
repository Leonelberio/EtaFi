//@ts-nocheck

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react'; // Import session hook
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'; // Use Select component for organisation

export default function NewCompany() {
  const { data: session } = useSession(); // Get session data
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [nif, setNif] = useState('');
  const [contact, setContact] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [organisationId, setOrganisationId] = useState<string | null>(null); // Selected organisation
  const [organisations, setOrganisations] = useState([]); // List of user's organisations
  const router = useRouter();

  useEffect(() => {
    // Fetch user's organisations when the component mounts
    const fetchOrganisations = async () => {
      const response = await fetch('/api/organisations'); // API to get user's organisations
      if (response.ok) {
        const data = await response.json();
        setOrganisations(data.organisations);
      }
    };

    fetchOrganisations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      console.error('User is not authenticated');
      return;
    }

    let logoUrl = '';
    if (logo) {
      const formData = new FormData();
      formData.append('file', logo);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      logoUrl = uploadData.url;
    }

    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        address,
        nif,
        contact,
        logo: logoUrl,
        organisationId, // Optional organisationId
      }),
    });

    if (response.ok) {
      router.push('/dashboard/companies'); // Redirect after creation
    } else {
      console.error('Échec de la création de l\'entreprise');
    }
  };

  return (
    <div className="relative flex-col items-start gap-8 md:flex">
      <form className="grid w-full items-start gap-6" onSubmit={handleSubmit}>
        <fieldset className="grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Nouvelle Entreprise</legend>

          {/* Organisation Selection */}
          <div className="grid gap-3">
            <Label htmlFor="organisation">Organisation (optionnel)</Label>
            <Select onValueChange={(value) => setOrganisationId(value)} value={organisationId || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une organisation (facultatif)" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Organisations disponibles</SelectLabel>
                  <SelectItem value="Aucun">Aucune (indépendant)</SelectItem> {/* Independent option */}
                  {organisations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Name Field */}
          <div className="grid gap-3">
            <Label htmlFor="name">Nom de l&apos;entreprise</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom de l'entreprise"
              required
            />
          </div>

          {/* Address Field */}
          <div className="grid gap-3">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Entrez l'adresse"
              required
            />
          </div>

          {/* NIF Field */}
          <div className="grid gap-3">
            <Label htmlFor="nif">Numéro d&apos;Identification Fiscale (NIF)</Label>
            <Input
              id="nif"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              placeholder="Entrez le NIF"
              required
            />
          </div>

          {/* Contact Field */}
          <div className="grid gap-3">
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Entrez le contact"
              required
            />
          </div>

          {/* Logo Upload */}
          <div className="grid gap-3">
            <Label htmlFor="logo">Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
            />
          </div>
        </fieldset>

        {/* Submit Button */}
        <Button type="submit">Créer</Button>
      </form>
    </div>
  );
}
