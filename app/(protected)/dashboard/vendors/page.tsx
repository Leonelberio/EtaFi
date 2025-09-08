import { Suspense } from "react";
import { VendorList } from "@/components/VendorList";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import Link from "next/link";

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            <p className="text-gray-600">Manage your supplier relationships</p>
          </div>
        </div>
        <Link href="/dashboard/vendors/new">
          <Button className="bg-primary-950 hover:bg-primary-900 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Vendor
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Suspense fallback={<div>Loading vendors...</div>}>
        <VendorList />
      </Suspense>
    </div>
  );
}
