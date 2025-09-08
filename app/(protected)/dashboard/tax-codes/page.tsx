import { Suspense } from "react";
import { TaxCodeList } from "@/components/TaxCodeList";
import { Loader2 } from "lucide-react";

export default function TaxCodesPage() {
  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <TaxCodeList />
      </Suspense>
    </div>
  );
}
