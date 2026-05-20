import AdminPage from "@/components/dashboard/superAdmin/AdminPage";
import { getKycAdminsAction } from "@/actions/kyc.action";
import { AlertCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { page } = await searchParams;

  const result = await getKycAdminsAction(page ? Number(page) : 1);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold">Admin Settings & Roles</h2>
          <p className="text-white/40 text-sm mt-1">
            Manage administrators and system configuration
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      </div>
    );
  }

  return <AdminPage data={result.data} />;
}