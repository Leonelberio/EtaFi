import { CostCategoryList } from "@/components/CostCategoryList";
import { RequireOrganization } from "@/components/RequireOrganization";

export default function CostCategoriesPage() {
  return (
    <div className="p-6">
      <RequireOrganization>
        <CostCategoryList />
      </RequireOrganization>
    </div>
  );
}
