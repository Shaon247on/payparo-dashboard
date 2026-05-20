import { getAdminAffiliateDetailAction } from "@/actions/affiliate.admin.action";
import AffiliateDetailClient from "@/components/dashboard/superAdmin/AffiliateDetailClient";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminAffiliateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getAdminAffiliateDetailAction(id);

  if (!result.success) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{result.error}</span>
      </div>
    );
  }

  return <AffiliateDetailClient application={result.data} />;
}
