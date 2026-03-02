"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Brain,
  CheckCircle2,
  User2,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────
type AIResult = "Need Human Review" | "Favor Buyer" | "Favor Seller";
type Confidence = "High" | "Medium" | "Low";

interface Dispute {
  id: string;
  dispute: string;
  transaction: string;
  claimType: string;
  amount: string;
  confidence: Confidence;
  result: AIResult;
}

// ── Data ───────────────────────────────────────────────────────────────
const ALL_DISPUTES: Dispute[] = [
  { id: "1",  dispute: "Dispute001", transaction: "Transaction Tnx001", claimType: "Not as Described", amount: "$1250", confidence: "High",   result: "Need Human Review" },
  { id: "2",  dispute: "Dispute002", transaction: "Transaction Tnx002", claimType: "Missing product",  amount: "$1250", confidence: "High",   result: "Favor Buyer" },
  { id: "3",  dispute: "Dispute003", transaction: "Transaction Tnx003", claimType: "Fake Product",     amount: "$1250", confidence: "High",   result: "Favor Seller" },
  { id: "4",  dispute: "Dispute004", transaction: "Transaction Tnx004", claimType: "Not as Described", amount: "$1250", confidence: "High",   result: "Need Human Review" },
  { id: "5",  dispute: "Dispute005", transaction: "Transaction Tnx005", claimType: "Item Damaged",     amount: "$5897", confidence: "Medium", result: "Favor Buyer" },
  { id: "6",  dispute: "Dispute006", transaction: "Transaction Tnx006", claimType: "Wrong Item",       amount: "$9687", confidence: "Low",    result: "Favor Seller" },
  { id: "7",  dispute: "Dispute007", transaction: "Transaction Tnx007", claimType: "Not as Described", amount: "$3200", confidence: "Medium", result: "Need Human Review" },
  { id: "8",  dispute: "Dispute008", transaction: "Transaction Tnx008", claimType: "Missing product",  amount: "$4100", confidence: "High",   result: "Favor Buyer" },
  { id: "9",  dispute: "Dispute009", transaction: "Transaction Tnx009", claimType: "Fake Product",     amount: "$7500", confidence: "Low",    result: "Favor Seller" },
  { id: "10", dispute: "Dispute010", transaction: "Transaction Tnx010", claimType: "Item Damaged",     amount: "$2300", confidence: "High",   result: "Need Human Review" },
  { id: "11", dispute: "Dispute011", transaction: "Transaction Tnx011", claimType: "Wrong Item",       amount: "$6100", confidence: "Medium", result: "Favor Buyer" },
  { id: "12", dispute: "Dispute012", transaction: "Transaction Tnx012", claimType: "Not as Described", amount: "$1850", confidence: "High",   result: "Need Human Review" },
  { id: "13", dispute: "Dispute013", transaction: "Transaction Tnx013", claimType: "Missing product",  amount: "$9200", confidence: "Low",    result: "Favor Seller" },
  { id: "14", dispute: "Dispute014", transaction: "Transaction Tnx014", claimType: "Fake Product",     amount: "$3750", confidence: "High",   result: "Favor Buyer" },
  { id: "15", dispute: "Dispute015", transaction: "Transaction Tnx015", claimType: "Item Damaged",     amount: "$5050", confidence: "Medium", result: "Need Human Review" },
];

// ── Config ─────────────────────────────────────────────────────────────
const stats = [
  { label: "Ai Reviewing",    value: "7", icon: Brain,        iconColor: "text-[#0099ff]",   iconBg: "bg-[#0099ff]/10" },
  { label: "Ai Resolved",     value: "3", icon: Brain,        iconColor: "text-[#0099ff]",   iconBg: "bg-[#0099ff]/10" },
  { label: "Needs Human",     value: "1", icon: User2,        iconColor: "text-white/60",    iconBg: "bg-white/10" },
  { label: "Total Completed", value: "1", icon: CheckCircle2, iconColor: "text-emerald-400", iconBg: "bg-emerald-400/10" },
];

const resultConfig: Record<AIResult, string> = {
  "Need Human Review": "border-amber-500/50 text-amber-400",
  "Favor Buyer":       "border-[#0099ff]/50 text-[#0099ff]",
  "Favor Seller":      "border-emerald-500/50 text-emerald-400",
};

const PAGE_SIZE_OPTIONS = [5, 10, 15];

// ── Page ───────────────────────────────────────────────────────────────
export default function KycAllDisputesPage() {
  const [search, setSearch]                     = useState("");
  const [resultFilter, setResultFilter]         = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [page, setPage]                         = useState(1);
  const [pageSize, setPageSize]                 = useState(5);

  // ── Filtered list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return ALL_DISPUTES.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.dispute.toLowerCase().includes(q) ||
        d.transaction.toLowerCase().includes(q) ||
        d.claimType.toLowerCase().includes(q);
      const matchResult     = resultFilter     === "all" || d.result     === resultFilter;
      const matchConfidence = confidenceFilter === "all" || d.confidence === confidenceFilter;
      return matchSearch && matchResult && matchConfidence;
    });
  }, [search, resultFilter, confidenceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetPage =
    (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  // Sliding window of page numbers (max 5)
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, safePage - delta);
      i <= Math.min(totalPages, safePage + delta);
      i++
    ) range.push(i);
    return range;
  }, [safePage, totalPages]);

  return (
    <div className="space-y-6">

      {/* Title */}
      <div>
        <h2 className="text-white text-2xl font-bold">Dispute Management</h2>
        <p className="text-white/40 text-sm mt-1">
          AI-powered dispute resolution with human oversight
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <Card key={label} className="bg-[#13151e] border-white/5">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`p-1.5 rounded-md ${iconBg}`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <span className="text-white/50 text-sm font-medium">{label}</span>
              </div>
              <p className="text-white font-bold text-2xl">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disputes card */}
      <Card className="bg-[#13151e] border-white/5">

        {/* ── Header: title + search + filters ── */}
        <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base font-semibold">
              All Disputes
              <span className="ml-2 text-white/30 font-normal text-sm">
                ({filtered.length} result{filtered.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <Input
                className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 pl-10 h-10 focus-visible:ring-0 focus-visible:border-white/20"
                placeholder="Search dispute, transaction, claim type..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* AI Result filter */}
            <div className="relative sm:w-[190px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 z-10 pointer-events-none" />
              <Select value={resultFilter} onValueChange={resetPage(setResultFilter)}>
                <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/60 pl-9 h-10 focus:ring-0 focus:border-white/20 text-sm">
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="Need Human Review">Need Human Review</SelectItem>
                  <SelectItem value="Favor Buyer">Favor Buyer</SelectItem>
                  <SelectItem value="Favor Seller">Favor Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confidence filter */}
            <div className="relative sm:w-[165px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 z-10 pointer-events-none" />
              <Select value={confidenceFilter} onValueChange={resetPage(setConfidenceFilter)}>
                <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/60 pl-9 h-10 focus:ring-0 focus:border-white/20 text-sm">
                  <SelectValue placeholder="All Confidence" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* ── Dispute rows ── */}
        <CardContent className="p-4 space-y-3">
          {paginated.length > 0 ? (
            paginated.map((d) => (
              <Card
                key={d.id}
                className="bg-[#0f1117] border-white/5 hover:border-white/10 transition-colors"
              >
                <CardContent className="px-5 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-4 items-center">
                    <div>
                      <p className="text-white/35 text-xs mb-1">{d.dispute}</p>
                      <p className="text-white text-sm font-medium">{d.transaction}</p>
                    </div>
                    <div>
                      <p className="text-white/35 text-xs mb-1">Claim Type</p>
                      <p className="text-white text-sm font-medium">{d.claimType}</p>
                    </div>
                    <div>
                      <p className="text-white/35 text-xs mb-1">Escrow Amount</p>
                      <p className="text-white text-sm font-medium">{d.amount}</p>
                    </div>
                    <div>
                      <p className="text-white/35 text-xs mb-1">AI Confident</p>
                      <p className={`text-sm font-medium ${
                        d.confidence === "High"   ? "text-emerald-400" :
                        d.confidence === "Medium" ? "text-amber-400"   : "text-red-400"
                      }`}>
                        {d.confidence}
                      </p>
                    </div>

                    {/* Result badge */}
                    <div className="col-span-2 md:col-span-1 flex items-center">
                      <span className={`inline-block border rounded-full px-4 py-1.5 text-xs font-semibold ${resultConfig[d.result]}`}>
                        {d.result}
                      </span>
                    </div>

                    {/* 3-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-white/30 hover:text-white hover:bg-white/10 flex-shrink-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1a1d27] border-white/10 text-white min-w-[150px]"
                      >
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer hover:text-white hover:bg-white/5 focus:bg-white/5"
                        >
                          <Link href={`/kyc/my-disputes/${d.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast.success("Dispute Assigned")}
                          className="cursor-pointer hover:text-white hover:bg-white/5 focus:bg-white/5"
                        >
                          Assign to Me
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-14 text-center text-white/25 text-sm">
              No disputes match your search or filters.
            </div>
          )}
        </CardContent>

        {/* ── Pagination footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-white/5">

          {/* Left — count + rows per page */}
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span>
              {filtered.length === 0
                ? "No results"
                : `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(
                    safePage * pageSize,
                    filtered.length
                  )} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-xs">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
              >
                <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/60 h-8 w-16 text-xs focus:ring-0 focus:border-white/20 px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d27] border-white/10 text-white min-w-[64px]">
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right — page buttons */}
          <div className="flex items-center gap-1">
            {/* First */}
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25"
              disabled={safePage === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            {/* Prev */}
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Numbered window */}
            {pageNumbers.map((n) => (
              <Button
                key={n}
                variant="ghost" size="icon"
                className={`w-8 h-8 text-sm font-medium transition-colors ${
                  n === safePage
                    ? "bg-[#0099ff] text-white hover:bg-[#007acc]"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            ))}

            {/* Next */}
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Last */}
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25"
              disabled={safePage === totalPages}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}