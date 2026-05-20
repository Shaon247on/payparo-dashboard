import { Suspense } from "react";
import DisputeManagementPage from "@/components/dashboard/superAdmin/DisputeManagementPage";
import {
  getUnassignedDisputesAction,
  getAssignedDisputesAction,
} from "@/actions/kyc/dispute.action";
import type { AiStatus, DisputeCurrentStatus } from "@/types/kyc/dispute.type";
import { AlertCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    tab?: "unassigned" | "assigned";
    q?: string;
    status?: string;
    confidence?: string;
    page?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { tab = "unassigned", q, status, confidence, page } = await searchParams;

  const pageNum = page ? Number(page) : 1;

  // 1. Fetch unassigned list (always needed for the tab badge counts)
  const unassignedResult = await getUnassignedDisputesAction({
    q: tab === "unassigned" ? q : undefined,
    status: tab === "unassigned" && status ? (status as AiStatus) : undefined,
    min_confidence: confidence ? Number(confidence) : undefined,
    page: tab === "unassigned" ? pageNum : 1,
  });

  // 2. Fetch assigned list
  const assignedResult = await getAssignedDisputesAction({
    q: tab === "assigned" ? q : undefined,
    status: tab === "assigned" && status ? (status as DisputeCurrentStatus) : undefined,
    min_confidence: confidence ? Number(confidence) : undefined,
    page: tab === "assigned" ? pageNum : 1,
  });

  // Handle any overall server errors
  if (!unassignedResult.success && tab === "unassigned") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{unassignedResult.error}</span>
      </div>
    );
  }

  if (!assignedResult.success && tab === "assigned") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{assignedResult.error}</span>
      </div>
    );
  }

  const unassignedData = unassignedResult.success ? unassignedResult.data : undefined;
  const assignedData = assignedResult.success ? assignedResult.data : undefined;

  return (
    <Suspense fallback={<div className="text-white/40 text-sm">Loading disputes desk...</div>}>
      <DisputeManagementPage
        unassignedData={unassignedData}
        assignedData={assignedData}
        activeTab={tab}
      />
    </Suspense>
  );
}