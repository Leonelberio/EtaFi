import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ModernAuthForm } from "@/components/auth/modern-auth-form";
import type { Session } from "next-auth";

export default async function AuthPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (session) {
    redirect("/dashboard");
  }

  return <ModernAuthForm />;
}
