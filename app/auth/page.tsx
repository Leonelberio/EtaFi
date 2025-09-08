import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ModernAuthForm } from "@/components/auth/modern-auth-form";

export default async function AuthPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return <ModernAuthForm />;
}
