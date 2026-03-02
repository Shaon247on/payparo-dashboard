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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Brain,
  CheckCircle2,
  User2,
  Clock,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────
type DisputeStatus = "Pending" | "Resolved" | "Needs Human" | "Ai Resolved";
type Confidence = "High" | "Medium" | "Low";

interface Dispute {
  id: string;
  dispute: string;
  transaction: string;
  claimType: string;
  amount: string;
  confidence: Confidence;
  status: DisputeStatus;
}

// ── Dummy data ─────────────────────────────────────────────────────────
const ALL_DISPUTES: Dispute[] = [
  { id: "1",  dispute: "Dispute001", transaction: "Tnx001", claimType: "Not as Described", amount: "$1250",  confidence: "High",   status: "Needs Human" },
  { id: "2",  dispute: "Dispute002", transaction: "Tnx002", claimType: "Missing product",  amount: "$1250",  confidence: "High",   status: "Ai Resolved" },
  { id: "3",  dispute: "Dispute003", transaction: "Tnx003", claimType: "Fake Product",     amount: "$5698",  confidence: "High",   status: "Resolved" },
  { id: "4",  dispute: "Dispute004", transaction: "Tnx004", claimType: "Not as Described", amount: "$8963",  confidence: "Medium", status: "Pending" },
  { id: "5",  dispute: "Dispute005", transaction: "Tnx005", claimType: "Item Damaged",     amount: "$5897",  confidence: "High",   status: "Pending" },
  { id: "6",  dispute: "Dispute006", transaction: "Tnx006", claimType: "Wrong Item",       amount: "$9687",  confidence: "Low",    status: "Resolved" },
  { id: "7",  dispute: "Dispute007", transaction: "Tnx007", claimType: "Not as Described", amount: "$3200",  confidence: "Medium", status: "Needs Human" },
  { id: "8",  dispute: "Dispute008", transaction: "Tnx008", claimType: "Missing product",  amount: "$4100",  confidence: "High",   status: "Pending" },
  { id: "9",  dispute: "Dispute009", transaction: "Tnx009", claimType: "Fake Product",     amount: "$7500",  confidence: "Low",    status: "Ai Resolved" },
  { id: "10", dispute: "Dispute010", transaction: "Tnx010", claimType: "Item Damaged",     amount: "$2300",  confidence: "High",   status: "Resolved" },
  { id: "11", dispute: "Dispute011", transaction: "Tnx011", claimType: "Wrong Item",       amount: "$6100",  confidence: "Medium", status: "Pending" },
  { id: "12", dispute: "Dispute012", transaction: "Tnx012", claimType: "Not as Described", amount: "$1850",  confidence: "High",   status: "Needs Human" },
  { id: "13", dispute: "Dispute013", transaction: "Tnx013", claimType: "Missing product",  amount: "$9200",  confidence: "Low",    status: "Resolved" },
  { id: "14", dispute: "Dispute014", transaction: "Tnx014", claimType: "Fake Product",     amount: "$3750",  confidence: "High",   status: "Ai Resolved" },
  { id: "15", dispute: "Dispute015", transaction: "Tnx015", claimType: "Item Damaged",     amount: "$5050",  confidence: "Medium", status: "Pending" },
];

// ── Config ─────────────────────────────────────────────────────────────
const stats = [
  { label: "Pending Dispute", value: "7",  icon: Clock,         iconColor: "text-[#0099ff]",    iconBg: "bg-[#0099ff]/10" },
  { label: "Ai Resolved",     value: "3",  icon: Brain,         iconColor: "text-[#0099ff]",    iconBg: "bg-[#0099ff]/10" },
  { label: "Needs Human",     value: "1",  icon: User2,         iconColor: "text-white/60",     iconBg: "bg-white/10" },
  { label: "Case Resolved",   value: "1",  icon: CheckCircle2,  iconColor: "text-emerald-400",  iconBg: "bg-emerald-400/10" },
];

const statusConfig: Record<DisputeStatus, { label: string; className: string }> = {
  Pending:       { label: "Pending",      className: "border-amber-500/40   text-amber-400    bg-amber-400/5" },
  Resolved:      { label: "Resolved",     className: "border-emerald-500/40 text-emerald-400  bg-emerald-400/5" },
  "Needs Human": { label: "Needs Human",  className: "border-red-500/40     text-red-400      bg-red-400/5" },
  "Ai Resolved": { label: "Ai Resolved",  className: "border-[#0099ff]/40   text-[#0099ff]    bg-[#0099ff]/5" },
};

const PAGE_SIZE_OPTIONS = [5, 10, 15];

// ── Component ──────────────────────────────────────────────────────────
export default function MyDisputesPage() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(5);

  // Filter
  const filtered = useMemo(() => {
    return ALL_DISPUTES.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.dispute.toLowerCase().includes(q) ||
        d.transaction.toLowerCase().includes(q) ||
        d.claimType.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || d.status === statusFilter;
      const matchConfidence =
        confidenceFilter === "all" || d.confidence === confidenceFilter;
      return matchSearch && matchStatus && matchConfidence;
    });
  }, [search, statusFilter, confidenceFilter]);

  // Reset to page 1 whenever filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  // Page window (max 5 page buttons)
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
        <h2 className="text-white text-2xl font-bold">My Disputes</h2>
        <p className="text-white/40 text-sm mt-1">
          Your assigned disputes and resolution progress
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

      {/* Table card */}
      <Card className="bg-[#13151e] border-white/5">
        {/* Card header — title + search + filters */}
        <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-white text-base font-semibold">
              My Assigned Disputes
              <span className="ml-2 text-white/30 font-normal text-sm">
                ({filtered.length} result{filtered.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </div>

          {/* Search + Filters row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <Input
                className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 pl-10 h-10 focus-visible:ring-0 focus-visible:border-white/20"
                placeholder="Search dispute, transaction, claim type..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status filter */}
            <div className="relative sm:w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 z-10 pointer-events-none" />
              <Select
                value={statusFilter}
                onValueChange={handleFilterChange(setStatusFilter)}
              >
                <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/60 pl-9 h-10 focus:ring-0 focus:border-white/20 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Needs Human">Needs Human</SelectItem>
                  <SelectItem value="Ai Resolved">Ai Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confidence filter */}
            <div className="relative sm:w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 z-10 pointer-events-none" />
              <Select
                value={confidenceFilter}
                onValueChange={handleFilterChange(setConfidenceFilter)}
              >
                <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/60 pl-9 h-10 focus:ring-0 focus:border-white/20 text-sm">
                  <SelectValue placeholder="Confidence" />
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

        {/* Table */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/35 font-medium px-5">Dispute</TableHead>
                <TableHead className="text-white/35 font-medium">Transaction</TableHead>
                <TableHead className="text-white/35 font-medium">Claim Type</TableHead>
                <TableHead className="text-white/35 font-medium">Escrow Amount</TableHead>
                <TableHead className="text-white/35 font-medium">AI Confident</TableHead>
                <TableHead className="text-white/35 font-medium">Status</TableHead>
                <TableHead className="text-white/35 font-medium text-right pr-5">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((d) => {
                  const s = statusConfig[d.status];
                  return (
                    <TableRow
                      key={d.id}
                      className="border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="text-white font-medium px-5 py-4">{d.dispute}</TableCell>
                      <TableCell className="text-white/70">{d.transaction}</TableCell>
                      <TableCell className="text-white/70">{d.claimType}</TableCell>
                      <TableCell className="text-white/70">{d.amount}</TableCell>
                      <TableCell>
                        <span className={
                          d.confidence === "High"
                            ? "text-emerald-400 font-medium text-sm"
                            : d.confidence === "Medium"
                            ? "text-amber-400 font-medium text-sm"
                            : "text-red-400 font-medium text-sm"
                        }>
                          {d.confidence}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>
                          {s.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <Link href={`/kyc/my-disputes/${d.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-md"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-16 text-white/25 text-sm">
                    No disputes match your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-white/5">
          {/* Left — showing X–Y of Z + rows per page */}
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span>
              {filtered.length === 0
                ? "No results"
                : `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`}
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
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25"
              disabled={safePage === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            {/* Prev */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            {pageNumbers.map((n) => (
              <Button
                key={n}
                variant="ghost"
                size="icon"
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
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Last */}
            <Button
              variant="ghost"
              size="icon"
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