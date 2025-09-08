import { Suspense } from "react";
import { TaxCodeForm } from "@/components/TaxCodeForm";
import { Loader2 } from "lucide-react";

export default function NewTaxCodePage() {
  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <TaxCodeForm />
      </Suspense>
    </div>
  );
}
