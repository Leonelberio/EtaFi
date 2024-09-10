// @ts-nocheck

'use client';

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Le composant prend `accounts` en prop
export default function ImportSuccessTable({ accounts }: { accounts: any[] }) {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Comptes importés</CardTitle>
        <CardDescription>Détails des comptes après l&apos;import de la balance comptable.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code du Compte</TableHead>
              <TableHead>Nom du Compte</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="text-right">Solde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.accountCode}>
                <TableCell>
                  <div className="font-medium">{account.accountCode}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{account.accountName}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    {account.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {account.balance.toFixed(2)} €
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
