import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TaxCodeForm } from "@/components/TaxCodeForm";
import { Loader2 } from "lucide-react";

interface EditTaxCodePageProps {
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

export default async function EditTaxCodePage({
  params,
}: EditTaxCodePageProps) {
  const { taxCodeId } = await params;
  const taxCode = await fetchTaxCode(taxCodeId);

  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <TaxCodeForm taxCode={taxCode} isEditing={true} />
      </Suspense>
    </div>
  );
}
