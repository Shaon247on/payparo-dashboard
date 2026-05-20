import EscrowDetailPage from "@/components/dashboard/superAdmin/EscrowDetailPage";
import { getEscrowDetailAction } from "@/actions/escrow.action";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const result = await getEscrowDetailAction(id);

  // Back link shown in both error and success states
  const BackLink = (
    <Link
      href="/dashboard/escrow"
      className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-2"
    >
      <ChevronLeft className="w-4 h-4" />
      All Transactions
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
      <EscrowDetailPage id={id} data={result.data} />
    </div>
  );
}