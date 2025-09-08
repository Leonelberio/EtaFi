import { notFound } from "next/navigation";
import { ChartAccountForm } from "@/components/ChartAccountForm";

// This would normally fetch data server-side
async function getChartAccount(accountId: string) {
  try {
    // In a real app, you'd fetch this server-side
    // For now, we'll return a placeholder
    return {
      id: accountId,
      number: "1000",
      name: "Cash",
      type: "ASSET",
      description: "Cash on hand and in bank accounts",
      isActive: true,
      isSystem: false,
      allowManualEntries: true,
      requireProjectAllocation: false,
    };
  } catch (error) {
    return null;
  }
}

interface PageProps {
  params: Promise<{ accountId: string }>;
}

export default async function EditChartAccountPage({ params }: PageProps) {
  const { accountId } = await params;
  const account = await getChartAccount(accountId);

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ChartAccountForm account={account} isEditing />
    </div>
  );
}
