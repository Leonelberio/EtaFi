import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { CostCategoryForm } from "@/components/CostCategoryForm";

interface EditCostCategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function EditCostCategoryPage({
  params,
}: EditCostCategoryPageProps) {
  const { categoryId } = await params;
  const organizationId = await getCurrentOrgId();

  if (!organizationId) {
    notFound();
  }

  const category = await db.costCategory.findFirst({
    where: {
      id: categoryId,
      organizationId,
    },
  });

  if (!category) {
    notFound();
  }

  // Convert to plain object to avoid serialization issues
  const categoryData = {
    id: category.id,
    code: category.code,
    name: category.name,
    description: category.description,
    color: category.color,
    icon: category.icon,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
  };

  return (
    <div className="p-6">
      <CostCategoryForm
        category={{ ...categoryData, icon: categoryData.icon || undefined }}
        isEditing={true}
      />
    </div>
  );
}
