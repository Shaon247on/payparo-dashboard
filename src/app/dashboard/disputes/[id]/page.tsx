import { getDisputeDetailAction } from "@/actions/kyc/dispute.action";
import SuperAdminDisputeDetailPage from "@/components/dashboard/superAdmin/DisputeDetailPage";
import {
  getAccessTokenAction,
  getCurrentUserIdAction,
} from "@/lib/auth/session";
import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const token = await getAccessTokenAction();
  const userId = await getCurrentUserIdAction();

  const result = await getDisputeDetailAction(id);

  const BackLink = (
    <Link
      href="/dashboard/disputes?tab=assigned"
      className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-2"
    >
      <ChevronLeft className="w-4 h-4" />
      Back to Disputes Desk
    </Link>
  );

  if (!result.success) {
    return (
      <div className="space-y-4">
        {BackLink}
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {BackLink}
      <SuperAdminDisputeDetailPage
        accessToken={token}
        buyerConversationId={result.data.dispute.buyer_conversation_id}
        currentUserId={userId}
        sellerConversationId={result.data.dispute.seller_conversation_id}
        dispute={result.data.dispute}
      />
    </div>
  );
}
