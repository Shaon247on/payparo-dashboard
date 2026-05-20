import type { PaginatedKycAdminResponse } from "@/types/kyc.type";
import InviteForm from "./InviteForm";
import KycTeamList from "./KycTeamList";


interface AdminPageProps {
  data: PaginatedKycAdminResponse;
}

export default function AdminPage({ data }: AdminPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Admin Settings & Roles</h2>
        <p className="text-white/40 text-sm mt-1">
          Manage administrators and system configuration
        </p>
      </div>

      <InviteForm />
      <KycTeamList data={data} />
    </div>
  );
}