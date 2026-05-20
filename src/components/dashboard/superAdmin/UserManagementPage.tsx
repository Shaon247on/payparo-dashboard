"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/Pagination";
import { UserSuspendButton } from "./UserSuspendButton";
import type { PaginatedUsersResponse, User } from "@/types/users.type";
import { Users, ShieldCheck, Clock } from "lucide-react";

const PAGE_SIZE = 10;

const kycBadge: Record<string, { text: string; cls: string }> = {
  approved:     { text: "Approved",     cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  under_review: { text: "Under Review", cls: "bg-amber-500/10  text-amber-400  border-amber-500/20"  },
  pending:      { text: "Pending",      cls: "bg-amber-500/10  text-amber-400  border-amber-500/20"  },
  rejected:     { text: "Rejected",     cls: "bg-rose-500/10   text-rose-400   border-rose-500/20"   },
  not_submitted:{ text: "Not Submitted",cls: "bg-white/5       text-white/35   border-white/5"       },
};

const roleBadge: Record<string, string> = {
  user:      "text-sky-400",
  admin:     "text-purple-400",
  kyc:       "text-violet-400",
  affiliate: "text-teal-400",
};

function Avatar({ name, suspended }: { name: string; suspended: boolean }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        suspended
          ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
          : "bg-[#0091e5]/10 text-[#0091e5] ring-1 ring-[#0091e5]/20"
      }`}
    >
      {initials || "?"}
    </div>
  );
}

function JoinedDate({ iso }: { iso: string }) {
  try {
    const d = new Date(iso);
    return (
      <span className="text-white/35 text-xs flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
      </span>
    );
  } catch {
    return <span className="text-white/25 text-xs">—</span>;
  }
}

interface UserManagementPageProps {
  data: PaginatedUsersResponse;
}

export default function UserManagementPage({ data }: UserManagementPageProps) {
  const { results, count } = data;

  const suspended = results.filter((u) => u.is_suspended).length;
  const kyc_approved = results.filter((u) => u.kyc_status === "approved").length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Users", value: count, icon: Users, color: "text-white/70", bg: "bg-white/5" },
          { label: "KYC Approved", value: kyc_approved, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Suspended", value: suspended, icon: ShieldCheck, color: "text-rose-400", bg: "bg-rose-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-[#13151e] border-white/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`p-1.5 rounded-md ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-white/40 text-xs">{label}</p>
                <p className="text-white font-bold text-lg leading-none mt-0.5">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle className="text-white text-base font-semibold">
            All Users
            <span className="ml-2 text-white/30 font-normal text-sm">({count})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/35 font-medium px-5 w-[260px]">User</TableHead>
                <TableHead className="text-white/35 font-medium w-[180px]">Joined</TableHead>
                <TableHead className="text-white/35 font-medium w-[80px]">Role</TableHead>
                <TableHead className="text-white/35 font-medium w-[140px]">KYC Status</TableHead>
                <TableHead className="text-white/35 font-medium text-center w-[100px]">Transactions</TableHead>
                <TableHead className="text-white/35 font-medium text-right pr-5 w-[150px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center text-white/30 py-16 text-sm">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((user: User) => {
                  const badge = kycBadge[user.kyc_status] ?? kycBadge["not_submitted"];
                  return (
                    <TableRow
                      key={user.id}
                      className={`border-white/5 hover:bg-white/[0.02] transition-colors ${
                        user.is_suspended ? "opacity-60" : ""
                      }`}
                    >
                      {/* User */}
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.full_name} suspended={user.is_suspended} />
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate leading-none">
                              {user.full_name}
                            </p>
                            <p className="text-white/40 text-xs truncate mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Joined */}
                      <TableCell className="py-3.5">
                        <JoinedDate iso={user.date_joined} />
                      </TableCell>

                      {/* Role */}
                      <TableCell className="py-3.5">
                        <span className={`text-xs font-semibold capitalize ${roleBadge[user.role] ?? "text-white/40"}`}>
                          {user.role}
                        </span>
                      </TableCell>

                      {/* KYC */}
                      <TableCell className="py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.cls}`}>
                          {badge.text}
                        </span>
                      </TableCell>

                      {/* Transactions */}
                      <TableCell className="text-white/60 text-sm text-center py-3.5">
                        {user.transaction_count}
                      </TableCell>

                      {/* Suspend action */}
                      <TableCell className="pr-5 py-3.5 text-right">
                        {user.role !== "admin" && user.role !== "kyc" ? (
                          <div className="flex justify-end">
                            <UserSuspendButton
                              userId={user.id}
                              isSuspended={user.is_suspended}
                              userName={user.full_name}
                            />
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs italic">Protected</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Pagination totalCount={count} pageSize={PAGE_SIZE} paramKey="page" />
        </CardContent>
      </Card>
    </div>
  );
}