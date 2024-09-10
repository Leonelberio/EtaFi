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
import HeaderFront from "./header-font";

export default function HomeComponent() {
  const { data: session } = useSession(); // Access session data using useSession hook
  const [comparators, setComparators] = useState([]);
  const [place, setPlace] = useState("Any Type");
  const [accessory, setAccessory] = useState("Any Type");
  const [price, setPrice] = useState("Any Prices");
  const router = useRouter();





  const handleCreateComparator = () => {
    router.push("/dashboard/comparators/new");
  };




  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <HeaderFront/>

      {/* Title Section */}
      <section className="flex align-middle justify-center">
        <div className="flex flex-col gap-6 text-center pt-16 pb-4 max-w-3xl">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          EtaFi votre guide
            <span className="text-purple-600">comptable.</span>
          </h1>
          <p className="leading-7">Le guide comptable dont vous avez besoin</p>
          <Link href="/dashboard">
          <Button size="lg">Démarrer gratuitement</Button>
          </Link>
        </div>
      </section>

     
     
    </div>
  );
}
