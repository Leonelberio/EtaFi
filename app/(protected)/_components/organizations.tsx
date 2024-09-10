//@ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Organizations() {
  const [organizations, setorganizations] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Fetch user's organizations
  useEffect(() => {
    const fetchorganizations = async () => {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setorganizations(data.organizations);
      }
    };
    fetchorganizations();
  }, []);

  // Create a new organization
  const handleCreateorganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const response = await fetch('/api/organizations', {
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
      setorganizations([...organizations, newOrg]);
      setName('');
      setDescription('');
    }

    setIsCreating(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">organizations</h1>

      {/* List of organizations */}
      <div>
        <h2 className="text-lg font-semibold">Mes organizations</h2>
        {organizations.length > 0 ? (
          <ul className="space-y-4">
            {organizations.map((org) => (
              <li key={org.id} className="border p-4">
                <h3 className="text-xl">{org.name}</h3>
                <p>{org.description}</p>
                <Button onClick={() => router.push(`/dashboard/organizations/${org.id}`)}>
                  Gérer
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Vous n&apos;êtes membre d&apos;aucune organization.</p>
        )}
      </div>

      {/* Create new organization */}
      <form onSubmit={handleCreateorganization}>
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Créer une nouvelle organization</legend>

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
            {isCreating ? 'Création...' : 'Créer l\'organization'}
          </Button>
        </fieldset>
      </form>
    </div>
  );}