//@ts-nocheck

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Fetch user's organizations
  useEffect(() => {
    const fetchOrganisations = async () => {
      const response = await fetch('/api/organisations');
      if (response.ok) {
        const data = await response.json();
        setOrganisations(data.organisations);
      }
    };
    fetchOrganisations();
  }, []);

  // Create a new organization
  const handleCreateOrganisation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const response = await fetch('/api/organisations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    if (response.ok) {
      const newOrg = await response.json();
      setOrganisations([...organisations, newOrg]);
      setName('');
      setDescription('');
    }

    setIsCreating(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Organisations</h1>

      {/* List of organisations */}
      <div>
        <h2 className="text-lg font-semibold">Mes organisations</h2>
        {organisations.length > 0 ? (
          <ul className="space-y-4">
            {organisations.map((org) => (
              <li key={org.id} className="border p-4">
                <h3 className="text-xl">{org.name}</h3>
                <p>{org.description}</p>
                <Button onClick={() => router.push(`/dashboard/organisations/${org.id}`)}>
                  Gérer
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Vous n&apos;êtes membre d&apos;aucune organisation.</p>
        )}
      </div>

      {/* Create new organization */}
      <form onSubmit={handleCreateOrganisation}>
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Créer une nouvelle organisation</legend>

          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Création...' : 'Créer l\'organisation'}
          </Button>
        </fieldset>
      </form>
    </div>
  );}