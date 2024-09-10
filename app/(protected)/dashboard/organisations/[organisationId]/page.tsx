//@ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrganizationMembers() {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER'); // Default role is MEMBER
  const [loading, setLoading] = useState(true); // Loading state for fetching members
  const [inviteLoading, setInviteLoading] = useState(false); // Loading state for invite
  const [error, setError] = useState(null); // Error state
  const { organisationId } = useParams(); 
  const router = useRouter();

  // Fetch members of the organization
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true); // Set loading state
        const response = await fetch(`/api/organisations/${organisationId}/members`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members);
        } else {
          setError('Failed to fetch members.');
        }
      } catch (err) {
        setError('Error fetching members.');
      } finally {
        setLoading(false); // Turn off loading state
      }
    };
    fetchMembers();
  }, [organisationId]);

  // Handle inviting a member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true); // Set loading state for invite
    setError(null); // Clear any previous errors

    try {
      const response = await fetch(`/api/organisations/${organisationId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email, role }),
      });

      if (response.ok) {
        const newMember = await response.json();
        setMembers([...members, newMember]); // Add new member to the list
        setEmail(''); // Clear the input after inviting
        setRole('MEMBER'); // Reset role to MEMBER after successful invite
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to invite member.');
      }
    } catch (err) {
      setError('Error inviting member.');
    } finally {
      setInviteLoading(false); // Turn off loading state for invite
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold">Organisation Members</h1>

      {/* Show error message if there's an error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Show loading state */}
      {loading ? (
        <p>Chargement des membres...</p>
      ) : (
        <>
          {/* Display message if there are no members */}
          {members.length === 0 ? (
            <p>Aucun membre invité</p> // Display message when no members exist
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.user?.name}</TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {/* Invite new member */}
      <form onSubmit={handleInviteMember} className="space-y-4 mt-8">
        <div>
          <Label htmlFor="email">Email du membre</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={inviteLoading} // Disable input when invite is in progress
          />
        </div>

        <div>
          <Label htmlFor="role">Rôle</Label>
          <Select onValueChange={(value) => setRole(value)} value={role}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Membre</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={inviteLoading}>
          {inviteLoading ? 'Inviting...' : 'Inviter'}
        </Button>
      </form>
    </>
  );
}
