import { ChartAccountList } from "@/components/ChartAccountList";
import { RequireOrganization } from "@/components/RequireOrganization";

export default function ChartOfAccountsPage() {
  return (
    <div className="p-6">
      <RequireOrganization>
        <ChartAccountList />
      </RequireOrganization>
    </div>
  );
}
