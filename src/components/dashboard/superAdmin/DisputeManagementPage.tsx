"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Search,
  SlidersHorizontal,
  FolderOpen,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { assignDisputeAction } from "@/actions/kyc/dispute.action";
import Pagination from "@/components/shared/Pagination";
import type {
  PaginatedUnassignedDisputeResponse,
  PaginatedAssignedDisputeResponse,
} from "@/types/kyc/dispute.type";

const PAGE_SIZE = 10;

// AI confidence / status config
const AI_STATUS_CONFIG: Record<
  string,
  { label: string; cls: string; bg: string; iconColor: string }
> = {
  favor_buyer: {
    label: "Favor Buyer",
    cls: "border-[#0091e5]/30 text-[#0091e5] bg-[#0091e5]/5",
    bg: "bg-[#0091e5]/10",
    iconColor: "text-[#0091e5]",
  },
  favor_seller: {
    label: "Favor Seller",
    cls: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  need_human_review: {
    label: "Needs Review",
    cls: "border-amber-500/30 text-amber-400 bg-amber-500/5",
    bg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  uncertain: {
    label: "Uncertain",
    cls: "border-white/10 text-white/50 bg-white/5",
    bg: "bg-white/5",
    iconColor: "text-white/40",
  },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending_kyc: {
    label: "Awaiting Review",
    cls: "border-amber-500/30 text-amber-400 bg-amber-500/5",
  },
  resolved: {
    label: "Resolved",
    cls: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  },
};

interface DisputeManagementPageProps {
  unassignedData?: PaginatedUnassignedDisputeResponse;
  assignedData?: PaginatedAssignedDisputeResponse;
  activeTab: "unassigned" | "assigned";
}

export default function DisputeManagementPage({
  unassignedData,
  assignedData,
  activeTab,
}: DisputeManagementPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local filter states
  const [searchVal, setSearchVal] = useState(searchParams.get("q") ?? "");

  // Update query params helper
  const updateQuery = (newParams: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    nextParams.delete("page"); // Reset page when query parameters change
    router.push(`/dashboard/disputes?${nextParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ q: searchVal || null });
  };

  const handleClaim = (disputeId: string) => {
    startTransition(async () => {
      const result = await assignDisputeAction(disputeId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Dispute successfully assigned to your workspace!");
      router.refresh();
      router.push(`/dashboard/disputes/${disputeId}`);
    });
  };

  const currentCount =
    activeTab === "unassigned" ? unassignedData?.count ?? 0 : assignedData?.count ?? 0;

  // Render upper stats cards
  const stats = [
    {
      label: "Needs Specialist",
      value: unassignedData?.count ?? "0",
      description: "Cases awaiting manual claim",
      icon: FolderOpen,
      cls: "text-[#0091e5]",
      bg: "bg-[#0091e5]/10",
    },
    {
      label: "My Active Cases",
      value: assignedData?.results.filter((d) => d.current_status === "pending_kyc").length ?? "0",
      description: "Assigned to you for resolution",
      icon: UserCheck,
      cls: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "AI Resolved Cases",
      value: assignedData?.results.filter((d) => d.current_status === "resolved").length ?? "0",
      description: "Resolved dispute cases",
      icon: CheckCircle,
      cls: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-bold tracking-tight">Dispute Resolution Desk</h2>
          <p className="text-white/40 text-sm mt-1">
            Resolve transaction conflicts with AI-assisted insights and full administrative oversight
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, idx) => (
          <Card key={idx} className="bg-[#13151e] border-white/5">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white/40 text-xs font-medium tracking-wide uppercase">
                  {s.label}
                </p>
                <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
                <p className="text-white/30 text-xs font-normal">{s.description}</p>
              </div>
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.cls}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs & Filters */}
      <Card className="bg-[#13151e] border-white/5">
        <div className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            {/* View Mode Switcher */}
            <div className="flex bg-[#0a0c10] p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => updateQuery({ tab: "unassigned" })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "unassigned"
                    ? "bg-[#181b24] text-white shadow-lg"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Unassigned Queue
                {unassignedData?.count && unassignedData.count > 0 ? (
                  <Badge className="ml-1.5 bg-[#0091e5] hover:bg-[#0091e5] text-white rounded-full px-2 py-0.5 text-xs font-semibold border-0">
                    {unassignedData.count}
                  </Badge>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => updateQuery({ tab: "assigned" })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "assigned"
                    ? "bg-[#181b24] text-white shadow-lg"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                My Workspace
                {assignedData?.count && assignedData.count > 0 ? (
                  <Badge className="ml-1.5 bg-amber-400/20 text-amber-400 rounded-full px-2 py-0.5 text-xs font-semibold border-0">
                    {assignedData.count}
                  </Badge>
                ) : null}
              </button>
            </div>

            {/* Sub filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Confidence Band Filter */}
              <Select
                value={searchParams.get("confidence") ?? "all"}
                onValueChange={(val) =>
                  updateQuery({ confidence: val === "all" ? null : val })
                }
              >
                <SelectTrigger className="w-[160px] bg-[#0a0c10] border-white/5 text-white/80 rounded-xl h-10">
                  <SelectValue placeholder="AI Confidence" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d27] border-white/10 text-white rounded-xl">
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="0.70">High (≥ 70%)</SelectItem>
                  <SelectItem value="0.40">Medium (40-69%)</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter (Assigned Only) */}
              {activeTab === "assigned" && (
                <Select
                  value={searchParams.get("status") ?? "all"}
                  onValueChange={(val) =>
                    updateQuery({ status: val === "all" ? null : val })
                  }
                >
                  <SelectTrigger className="w-[150px] bg-[#0a0c10] border-white/5 text-white/80 rounded-xl h-10">
                    <SelectValue placeholder="Dispute Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1d27] border-white/10 text-white rounded-xl">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending_kyc">Awaiting Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="text"
                placeholder="Search by order ID, product name, claimant name..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-[#0a0c10] border-white/5 text-white pl-10 pr-4 rounded-xl h-11 focus-visible:ring-[#0091e5]/50 placeholder:text-white/20"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#181b24] hover:bg-[#202532] text-white border border-white/5 px-6 rounded-xl h-11"
            >
              Search
            </Button>
          </form>

          {/* Table / List */}
          <div className="pt-2 space-y-3">
            {activeTab === "unassigned" ? (
              /* UNASSIGNED QUEUE */
              !unassignedData || unassignedData.results.length === 0 ? (
                <div className="py-16 text-center">
                  <ShieldCheck className="w-12 h-12 text-[#0091e5]/30 mx-auto mb-3" />
                  <p className="text-white font-medium text-base">Clean Workspace</p>
                  <p className="text-white/40 text-xs max-w-sm mx-auto mt-1">
                    No unassigned disputes waiting in the queue. You are all caught up!
                  </p>
                </div>
              ) : (
                unassignedData.results.map((d) => {
                  const badge = AI_STATUS_CONFIG[d.ai_status] ?? AI_STATUS_CONFIG.uncertain;
                  return (
                    <div
                      key={d.id}
                      className="group bg-[#0f1117] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-white font-semibold text-sm">
                            {d.product_name}
                          </span>
                          <span className="text-white/40 font-mono text-xs bg-white/5 px-2 py-0.5 rounded">
                            {d.order_id}
                          </span>
                          <span className="text-white/30 text-xs">•</span>
                          <span className="text-white/40 text-xs">
                            {new Date(d.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-white/50 text-xs leading-relaxed max-w-2xl">
                          <strong className="text-white/60">Reason:</strong> {d.reason}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-white/40">
                            Escrow Value:{" "}
                            <strong className="text-[#0091e5] font-semibold">
                              ${d.escrow_price}
                            </strong>
                          </span>
                          <span className="text-white/20">|</span>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#0091e5]" />
                            <span className="text-white/40">AI Diagnosis:</span>
                            <span
                              className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <Button
                          disabled={isPending}
                          onClick={() => handleClaim(d.id)}
                          className="bg-[#0091e5] hover:bg-[#007acc] text-white font-semibold rounded-xl px-5 h-10 shadow-lg shadow-[#0091e5]/10"
                        >
                          {isPending ? "Assigning..." : "Claim Case"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* MY WORKSPACE (ASSIGNED) */
              !assignedData || assignedData.results.length === 0 ? (
                <div className="py-16 text-center">
                  <UserCheck className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-white font-medium text-base">No Assigned Cases</p>
                  <p className="text-white/40 text-xs max-w-sm mx-auto mt-1">
                    No disputes are currently assigned to you. Go to the queue to claim active cases.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider font-semibold">
                        <th className="text-left px-5 py-3.5 font-medium">Specialist</th>
                        <th className="text-left px-5 py-3.5 font-medium">Transaction ID</th>
                        <th className="text-left px-5 py-3.5 font-medium">Claim Type</th>
                        <th className="text-left px-5 py-3.5 font-medium">Amount</th>
                        <th className="text-left px-5 py-3.5 font-medium">AI Match</th>
                        <th className="text-left px-5 py-3.5 font-medium">Status</th>
                        <th className="text-right px-5 py-3.5 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedData.results.map((d) => {
                        const status = STATUS_CONFIG[d.current_status] ?? STATUS_CONFIG.pending_kyc;
                        const matchPct = Math.round(d.ai_confidence * 100);
                        const matchCls =
                          d.ai_confidence >= 0.7
                            ? "text-emerald-400"
                            : d.ai_confidence >= 0.4
                            ? "text-amber-400"
                            : "text-rose-400";

                        return (
                          <tr
                            key={d.id}
                            className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-5 py-4 text-white font-medium">{d.kyc_name}</td>
                            <td className="px-5 py-4 text-white/60 font-mono text-xs">
                              {d.transaction_id}
                            </td>
                            <td className="px-5 py-4 text-white/70 font-medium">
                              {d.claim_type}
                            </td>
                            <td className="px-5 py-4 text-[#0091e5] font-semibold">
                              ${d.escrow_amount}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`font-semibold ${matchCls}`}>{matchPct}%</span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.cls}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <Link href={`/dashboard/disputes/${d.id}`}>
                                <Button className="bg-[#181b24] hover:bg-[#202532] text-white font-semibold rounded-xl h-9 px-4 inline-flex items-center gap-1 text-xs">
                                  <span>View Detail</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>

        {/* Pagination */}
        {currentCount > PAGE_SIZE && (
          <div className="border-t border-white/5 py-4 px-5">
            <Pagination totalCount={currentCount} pageSize={PAGE_SIZE} paramKey="page" />
          </div>
        )}
      </Card>
    </div>
  );
}
