import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2, ArrowLeft, Percent, MapPin, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TaxCodePageProps {
  params: Promise<{ taxCodeId: string }>;
}

async function fetchTaxCode(taxCodeId: string) {
  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/tax-codes/${taxCodeId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch tax code");
  }

  return response.json();
}

const PROVINCE_NAMES: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  NT: "Northwest Territories",
  NU: "Nunavut",
  YT: "Yukon",
};

export default async function TaxCodePage({ params }: TaxCodePageProps) {
  const { taxCodeId } = await params;
  const taxCode = await fetchTaxCode(taxCodeId);

  const formatRate = (rate: number): string => {
    return `${(rate * 100).toFixed(3)}%`;
  };

  const getProvinceDisplay = (province?: string): string | null => {
    if (!province) return null;
    return PROVINCE_NAMES[province] || province;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tax-codes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tax Codes
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Percent className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{taxCode.name}</h1>
            <p className="text-gray-600">Tax Code Details</p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href={`/dashboard/tax-codes/${taxCodeId}/edit`}>
            <Button variant="outline">Edit Tax Code</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tax Code Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Code
                    </label>
                    <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                      {taxCode.code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Display Name
                    </label>
                    <p className="text-sm">{taxCode.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tax Rate
                    </label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatRate(taxCode.rate)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Configuration
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Province/Territory
                    </label>
                    {taxCode.province ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {getProvinceDisplay(taxCode.province)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {taxCode.province}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Federal (All provinces)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div>
                      <Badge
                        variant={taxCode.isActive ? "default" : "secondary"}
                        className={
                          taxCode.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {taxCode.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tax Type
                    </label>
                    <div className="flex gap-2">
                      {taxCode.isCompound && (
                        <Badge variant="outline" className="text-xs">
                          Compound Tax
                        </Badge>
                      )}
                      {taxCode.rate === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Tax Exempt
                        </Badge>
                      )}
                      {!taxCode.isCompound && taxCode.rate > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Simple Tax
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {taxCode.description && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{taxCode.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Calculation Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax Calculation Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {taxCode.rate > 0 ? (
              <div className="space-y-3">
                {[100, 500, 1000].map((amount) => {
                  const tax = amount * taxCode.rate;
                  const total = amount + tax;

                  return (
                    <div key={amount} className="border rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        On ${amount.toFixed(2)}:
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Base Amount:</span>
                          <span>${amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax ({formatRate(taxCode.rate)}):</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {taxCode.isCompound && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      ⚠️ <strong>Compound Tax:</strong> This tax is calculated
                      on the base amount plus other applicable taxes (e.g., QST
                      calculated on amount + GST).
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-gray-100 rounded-full h-12 w-12 mx-auto mb-3 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  This is a tax-exempt code (0% rate)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-500">Created</label>
              <p className="text-gray-900">
                {new Date(taxCode.createdAt).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Last Updated</label>
              <p className="text-gray-900">
                {new Date(taxCode.updatedAt).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Tax Code ID</label>
              <p className="text-gray-900 font-mono text-xs">{taxCode.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
