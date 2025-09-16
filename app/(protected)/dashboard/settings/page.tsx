"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";

import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSchema } from "@/schemas";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { settings } from "@/actions/settings";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { OrganizationList } from "@/components/OrganizationList";
import {
  OrganizationSettingsProvider,
  useOrganizationSettings,
} from "@/contexts/OrganizationSettingsContext";
import { Lock, Eye, EyeOff } from "lucide-react";
// UserRole enum values
const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

// Tax Password Settings Component
const TaxPasswordSettings = () => {
  const { taxPassword, setTaxPassword, isTaxPasswordSet } =
    useOrganizationSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères");
      return;
    }

    setTaxPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("Mot de passe fiscal enregistré avec succès");
  };

  const handleClearPassword = () => {
    setTaxPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("Mot de passe fiscal supprimé");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Mot de passe pour les informations fiscales
        </CardTitle>
        <p className="text-sm text-gray-600">
          Définissez un mot de passe pour protéger l'accès aux informations
          fiscales des organisations.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isTaxPasswordSet ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Lock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Mot de passe défini
                  </p>
                  <p className="text-sm text-green-600">
                    Les informations fiscales sont protégées par un mot de
                    passe.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Entrez un nouveau mot de passe"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePassword}
                    disabled={!newPassword || !confirmPassword}
                    className="flex-1"
                  >
                    Mettre à jour le mot de passe
                  </Button>
                  <Button
                    onClick={handleClearPassword}
                    variant="outline"
                    className="flex-1"
                  >
                    Supprimer le mot de passe
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Lock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Aucun mot de passe défini
                  </p>
                  <p className="text-sm text-yellow-600">
                    Les informations fiscales ne sont pas protégées. Définissez
                    un mot de passe pour les sécuriser.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Entrez un mot de passe"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez le mot de passe"
                  />
                </div>

                <Button
                  onClick={handleSavePassword}
                  disabled={!newPassword || !confirmPassword}
                  className="w-full"
                >
                  Définir le mot de passe
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SettingsPage = () => {
  const user = useCurrentUser();

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      name: user?.name || undefined,
      email: user?.email || undefined,
      role: (user?.role as "ADMIN" | "USER") || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }

          if (data.success) {
            update();
            setSuccess(data.success);
          }
        })
        .catch(() => setError("Quelque chose s'est mal passé !"));
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Account Settings Form */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <p className="text-2xl font-semibold text-center">
            ⚙️ Paramètres du compte
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Jean Dupont"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {user?.isOAuth === false && (
                  <>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="jean.dupont@exemple.com"
                              type="email"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="******"
                              type="password"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nouveau mot de passe</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="******"
                              type="password"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.ADMIN}>
                            Administrateur
                          </SelectItem>
                          <SelectItem value={UserRole.USER}>
                            Utilisateur
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {user?.isOAuth === false && (
                  <FormField
                    control={form.control}
                    name="isTwoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>
                            Authentification à deux facteurs
                          </FormLabel>
                          <FormDescription>
                            Activez l&apos;authentification à deux facteurs pour
                            votre compte.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={isPending}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button disabled={isPending} type="submit">
                Enregistrer
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Tax Password Settings */}
      <TaxPasswordSettings />

      {/* organization Section */}
      <Card className="w-full max-w-4xl mx-auto p-6">
        <CardHeader>
          <p className="text-2xl font-semibold text-center">🏢 organization </p>
        </CardHeader>
        <OrganizationList />
      </Card>
    </div>
  );
};

// Wrap the component with the provider
const SettingsPageWithProvider = () => {
  return (
    <OrganizationSettingsProvider>
      <SettingsPage />
    </OrganizationSettingsProvider>
  );
};

export default SettingsPageWithProvider;
