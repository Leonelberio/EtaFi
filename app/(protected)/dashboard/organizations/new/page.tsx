import { OrganizationForm } from "@/components/OrganizationForm";
import { OrganizationSettingsProvider } from "@/contexts/OrganizationSettingsContext";

export default function NewOrganizationPage() {
  return (
    <OrganizationSettingsProvider>
      <OrganizationForm />
    </OrganizationSettingsProvider>
  );
}
