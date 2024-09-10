// @ts-nocheck


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { LoginButton } from "@/components/auth/login-button";
import { LogoutButton } from "@/components/auth/logout-button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Banknote, ShieldCheck, Users } from "lucide-react";
import { UserButton } from "@/components/auth/user-button";

export default function HeaderFront() {
  const { data: session } = useSession(); // Access session data using useSession hook
  const [comparators, setComparators] = useState([]);

  const router = useRouter();





  const handleCreateComparator = () => {
    router.push("/dashboard/comparators/new");
  };




  return (
      
      <header className="flex flex-col gap-4 md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4">
            <Link href="/">
          <Image src="/logo_etafi.png" alt="Logo" width={140} height={40} />
            </Link>
        </div>
        {session ? (

        <UserButton/>
        ) : (
          <LoginButton asChild>
            <Button size="lg">Se connecter</Button>
          </LoginButton>
        )}
      </header>

  );
}
