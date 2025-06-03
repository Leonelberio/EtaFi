"use client";

import { Users, Plus, Search, Filter, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: "Marie Dupont",
      email: "marie.dupont@etafi.com",
      phone: "+225 01 23 45 67",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15T10:30:00Z",
      avatar: "",
    },
    {
      id: 2,
      name: "Jean Martin",
      email: "jean.martin@etafi.com",
      phone: "+225 07 89 12 34",
      role: "user",
      status: "active",
      lastLogin: "2024-01-14T15:45:00Z",
      avatar: "",
    },
    {
      id: 3,
      name: "Sophie Laurent",
      email: "sophie.laurent@etafi.com",
      phone: "+225 05 67 89 01",
      role: "user",
      status: "inactive",
      lastLogin: "2024-01-10T09:15:00Z",
      avatar: "",
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "user":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in-up">
              <h1 className="etafi-section-header">Utilisateurs</h1>
              <p className="etafi-section-subtitle">
                Gérez les accès et permissions des utilisateurs
              </p>
            </div>
            <div className="animate-fade-in-up">
              <Button className="etafi-button-primary">
                <Plus className="h-5 w-5 mr-2" />
                Nouvel Utilisateur
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="etafi-input pl-10"
            />
          </div>
          <Button variant="outline" className="etafi-button-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Utilisateurs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter((u) => u.status === "active").length} actifs
              </p>
            </CardContent>
          </Card>

          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administrateurs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "admin").length}
              </div>
              <p className="text-xs text-muted-foreground">
                avec privilèges admin
              </p>
            </CardContent>
          </Card>

          <Card className="etafi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dernière Connexion
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Aujourd&apos;hui</div>
              <p className="text-xs text-muted-foreground">dernière activité</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card
              key={user.id}
              className="etafi-card hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={getRoleColor(user.role)}
                        >
                          {user.role === "admin"
                            ? "Administrateur"
                            : "Utilisateur"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(user.status)}
                        >
                          {user.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Dernière connexion:{" "}
                  {new Date(user.lastLogin).toLocaleDateString("fr-FR")}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    {user.status === "active" ? "Désactiver" : "Activer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun utilisateur
            </h3>
            <p className="text-gray-600 mb-6">
              Invitez des utilisateurs pour collaborer sur vos projets
            </p>
            <Button className="etafi-button-primary">
              <Plus className="h-5 w-5 mr-2" />
              Inviter un Utilisateur
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
