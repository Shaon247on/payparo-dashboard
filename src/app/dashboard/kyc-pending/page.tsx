import { getPendingKycAction } from "@/actions/kyc.action";
import { AlertCircle } from "lucide-react";
import PendingKycPage from "@/components/dashboard/admin/PendingKycPage";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { page, status } = await searchParams;

  const result = await getPendingKycAction(
    page ? Number(page) : 1,
    status || "under_review"
  );

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold">KYC Approvals</h2>
          <p className="text-white/40 text-sm mt-1">
            Review and process user KYC submissions
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      </div>
    );
  }

  return <PendingKycPage data={result.data} initialStatus={status || "under_review"} />;
}
