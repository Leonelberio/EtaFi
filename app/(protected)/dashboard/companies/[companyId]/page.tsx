"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Hash,
  Globe,
  Users,
  Calendar,
  FileText,
  Upload,
  Edit2,
  Trash2,
  Save,
  Plus,
  Eye,
  MoreVertical,
  Archive,
  Settings,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import ExercicesList from "@/app/(protected)/_components/exercices-list";
import DocumentsList from "@/app/(protected)/_components/documents-list";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";

interface Company {
  id: string;
  name: string;
  address: string;
  nif: string;
  contact: string;
  email?: string;
  phone?: string;
  website?: string;
  sector?: string;
  logo?: string;
  exercices?: Exercice[];
  createdAt?: string;
}

interface Exercice {
  id: string;
  name: number;
  startDate: string;
  endDate: string;
  companyId: string;
}

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  type: string;
  companyId?: string;
  exerciceId?: string;
  createdAt: string;
}

interface ChartDataItem {
  year: number;
  count: number;
  name: string;
}

interface DocumentTypeData {
  name: string;
  value: number;
}

export default function CompanyDetailPage() {
  const { companyId } = useParams() as { companyId: string };
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    nif: "",
    contact: "",
    email: "",
    phone: "",
    website: "",
    sector: "",
  });
  const [imageSrc, setImageSrc] = useState<string>("/placeholder.svg");
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);

  // Fetch company details and exercises
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch company details");
        }
        const data: Company = await response.json();
        setCompany(data);
        setFormData({
          name: data.name,
          address: data.address,
          nif: data.nif,
          contact: data.contact,
          email: data.email || "",
          phone: data.phone || "",
          website: data.website || "",
          sector: data.sector || "",
        });
        setImageSrc(data.logo || "/placeholder.svg");
        setExercices(data.exercices || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewLogo(e.target.files[0]);
      setImageSrc(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveLogo = () => {
    setImageSrc("/placeholder.svg");
    setNewLogo(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let logoUrl: string | null = imageSrc;

      if (imageSrc === "/placeholder.svg" && !newLogo) {
        logoUrl = null;
      } else if (newLogo) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", newLogo);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      const response = await fetch(`/api/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, logo: logoUrl }),
      });

      if (!response.ok) throw new Error("Failed to save company details");

      const updatedCompany = await response.json();
      setCompany(updatedCompany);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving company details:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewExercice = async (
    name: number,
    startDate: Date,
    endDate: Date
  ) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/exercice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, startDate, endDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to create new exercice");
      }

      const newExercice: Exercice = await response.json();
      setExercices((prev) => [...prev, newExercice]);
    } catch (error) {
      console.error("Error adding new exercice:", error);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/documents`);
        const data: Document[] = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [companyId]);

  const handleUploadDocument = async (
    file: File,
    isExercice = false,
    exerciceId: string | null = null
  ) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      let uploadUrl = `/api/companies/${companyId}/documents`;
      if (isExercice && exerciceId) {
        uploadUrl = `/api/companies/${companyId}/exercice/${exerciceId}/documents`;
      }

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.statusText}`);
      }

      const newDocument: Document = await response.json();
      setDocuments((prevDocs) => [...prevDocs, newDocument]);
    } catch (error) {
      console.error("Error during document upload:", error);
      alert("Failed to upload document");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await fetch(`/api/companies/${companyId}/documents/${documentId}`, {
        method: "DELETE",
      });

      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== documentId)
      );
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDeleteExercice = async (exerciceId: string) => {
    try {
      const response = await fetch(
        `/api/companies/${companyId}/exercice/${exerciceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete exercice");
      }

      setExercices((prevExercices) =>
        prevExercices.filter((ex) => ex.id !== exerciceId)
      );
    } catch (error) {
      console.error("Error deleting exercice:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">
            Chargement des détails de l&apos;entreprise...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard/companies">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux entreprises
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/companies">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux Entreprises
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-md transition-colors disabled:bg-rose-400"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border border-gray-200 shadow-lg"
                    >
                      <DropdownMenuItem className="hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les rapports
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-gray-50">
                        <Archive className="h-4 w-4 mr-2" />
                        Archiver
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {/* Company Header Info */}
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="h-10 w-10 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {company.name}
                </h1>
                {company.sector && (
                  <Badge
                    variant="secondary"
                    className="bg-rose-50 text-rose-700 border-rose-200"
                  >
                    {company.sector}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                {company.nif && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>NIF: {company.nif}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:text-rose-700"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="overview"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger
              value="exercices"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Exercices ({exercices.length})
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="bg-white data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
            >
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Total Exercices
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {exercices.length}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+12% ce mois</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Documents
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {documents.length}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Actif</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        Exercices Actifs
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {
                          exercices.filter((ex) => {
                            const now = new Date();
                            const start = new Date(ex.startDate);
                            const end = new Date(ex.endDate);
                            return now >= start && now <= end;
                          }).length
                        }
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-200 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-600">
                      En progression
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">
                        Dernière Activité
                      </p>
                      <p className="text-sm font-bold text-orange-900">
                        {company.createdAt
                          ? new Date(company.createdAt).toLocaleDateString(
                              "fr-FR"
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-200 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-600">Récemment</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exercices Timeline Chart */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-rose-600" />
                    <CardTitle className="text-lg">
                      Exercices par Année
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Répartition des exercices financiers par année
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={exercices.reduce(
                        (acc: ChartDataItem[], exercice) => {
                          const year = exercice.name;
                          const existingYear = acc.find(
                            (item) => item.year === year
                          );
                          if (existingYear) {
                            existingYear.count += 1;
                          } else {
                            acc.push({ year, count: 1, name: `${year}` });
                          }
                          return acc;
                        },
                        []
                      )}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Documents Distribution Chart */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-rose-600" />
                    <CardTitle className="text-lg">
                      Types de Documents
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Répartition des documents par type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={
                          documents.reduce((acc: DocumentTypeData[], doc) => {
                            const type = doc.type || "Autre";
                            const existing = acc.find(
                              (item) => item.name === type
                            );
                            if (existing) {
                              existing.value += 1;
                            } else {
                              acc.push({ name: type, value: 1 });
                            }
                            return acc;
                          }, []).length
                            ? documents.reduce(
                                (acc: DocumentTypeData[], doc) => {
                                  const type = doc.type || "Autre";
                                  const existing = acc.find(
                                    (item) => item.name === type
                                  );
                                  if (existing) {
                                    existing.value += 1;
                                  } else {
                                    acc.push({ name: type, value: 1 });
                                  }
                                  return acc;
                                },
                                []
                              )
                            : [{ name: "Aucun document", value: 1 }]
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          "#f43f5e",
                          "#3b82f6",
                          "#10b981",
                          "#f59e0b",
                          "#8b5cf6",
                          "#ef4444",
                          "#06b6d4",
                          "#84cc16",
                        ].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-600" />
                  <CardTitle className="text-lg">Activité Mensuelle</CardTitle>
                </div>
                <CardDescription>
                  Évolution de l&apos;activité au cours des derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={(() => {
                      const months = [];
                      const currentDate = new Date();
                      for (let i = 11; i >= 0; i--) {
                        const date = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth() - i,
                          1
                        );
                        const monthName = date.toLocaleDateString("fr-FR", {
                          month: "short",
                          year: "2-digit",
                        });

                        // Count exercices created in this month
                        const exercicesCount = exercices.filter((ex) => {
                          const exDate = new Date(ex.startDate);
                          return (
                            exDate.getMonth() === date.getMonth() &&
                            exDate.getFullYear() === date.getFullYear()
                          );
                        }).length;

                        // Count documents created in this month
                        const documentsCount = documents.filter((doc) => {
                          const docDate = new Date(doc.createdAt);
                          return (
                            docDate.getMonth() === date.getMonth() &&
                            docDate.getFullYear() === date.getFullYear()
                          );
                        }).length;

                        months.push({
                          month: monthName,
                          exercices: exercicesCount,
                          documents: documentsCount,
                          total: exercicesCount + documentsCount,
                        });
                      }
                      return months;
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorExercices"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f43f5e"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f43f5e"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorDocuments"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="exercices"
                      stackId="1"
                      stroke="#f43f5e"
                      fillOpacity={1}
                      fill="url(#colorExercices)"
                      name="Exercices"
                    />
                    <Area
                      type="monotone"
                      dataKey="documents"
                      stackId="1"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorDocuments)"
                      name="Documents"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Items Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Exercices */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-rose-600" />
                      Exercices Récents
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-rose-50 text-rose-700"
                    >
                      {exercices.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {exercices.slice(0, 3).map((exercice) => {
                    const isActive = (() => {
                      const now = new Date();
                      const start = new Date(exercice.startDate);
                      const end = new Date(exercice.endDate);
                      return now >= start && now <= end;
                    })();

                    return (
                      <div
                        key={exercice.id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isActive ? "bg-green-500" : "bg-gray-300"
                            }`}
                          ></div>
                          <div>
                            <p className="font-medium">
                              Exercice {exercice.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(exercice.startDate).toLocaleDateString(
                                "fr-FR"
                              )}{" "}
                              -{" "}
                              {new Date(exercice.endDate).toLocaleDateString(
                                "fr-FR"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800 text-xs"
                            >
                              Actif
                            </Badge>
                          )}
                          <Link
                            href={`/dashboard/companies/${companyId}/exercice/${exercice.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  {exercices.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun exercice</p>
                      <p className="text-sm text-gray-400">
                        Créez votre premier exercice financier
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Documents */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-rose-600" />
                      Documents Récents
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700"
                    >
                      {documents.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {documents.slice(0, 3).map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-48">
                            {document.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(document.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun document</p>
                      <p className="text-sm text-gray-400">
                        Téléchargez vos premiers documents
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Exercices Tab */}
          <TabsContent value="exercices">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-rose-500" />
                      Exercices Financiers
                    </CardTitle>
                    <CardDescription>
                      Gérez les exercices financiers de cette entreprise
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ExercicesList
                  exercices={exercices}
                  onNewExercice={handleNewExercice}
                  onDeleteExercice={handleDeleteExercice}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-rose-500" />
                      Documents & Fichiers
                    </CardTitle>
                    <CardDescription>
                      Gérez tous les documents liés à cette entreprise
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DocumentsList
                  documents={documents}
                  onUploadDocument={handleUploadDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-rose-500" />
                  Paramètres de l&apos;Entreprise
                </CardTitle>
                <CardDescription>
                  Modifiez les informations détaillées de l&apos;entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Company Details Form */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Informations Générales
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">
                            Nom de l&apos;entreprise *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nif">NIF *</Label>
                          <Input
                            id="nif"
                            name="nif"
                            value={formData.nif}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sector">
                            Secteur d&apos;activité
                          </Label>
                          <Input
                            id="sector"
                            name="sector"
                            value={formData.sector}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Adresse complète *</Label>
                          <Textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            rows={3}
                            className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Informations de Contact
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="contact">Personne de contact *</Label>
                          <Input
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Adresse email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Numéro de téléphone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Site web</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Logo de l&apos;entreprise
                    </h3>
                    <Card className="bg-white border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="h-32 w-32 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-200">
                            {imageSrc !== "/placeholder.svg" ? (
                              <Image
                                src={imageSrc}
                                alt="Company logo"
                                width={128}
                                height={128}
                                className="h-full w-full object-cover rounded-xl"
                              />
                            ) : (
                              <Building2 className="h-16 w-16 text-gray-400" />
                            )}
                          </div>
                          {isEditing && (
                            <div className="space-y-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                                id="logo-upload"
                              />
                              <Label
                                htmlFor="logo-upload"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Télécharger un logo
                              </Label>
                              {imageSrc !== "/placeholder.svg" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleRemoveLogo}
                                  className="block mx-auto bg-white"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer le logo
                                </Button>
                              )}
                              <p className="text-xs text-gray-500">
                                PNG, JPG jusqu&apos;à 2MB. Recommandé: 256x256px
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
