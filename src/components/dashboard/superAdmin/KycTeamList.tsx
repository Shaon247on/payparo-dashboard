"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import {
  resendInviteAction,
  removeKycAdminAction,
} from "@/actions/kyc.action";
import type {
  KycAdmin,
  PaginatedKycAdminResponse,
} from "@/types/kyc.type";
import { toast } from "sonner";

interface KycTeamListProps {
  data: PaginatedKycAdminResponse;
}

const PAGE_SIZE = 10;

function getInitials(name: string): string {
  if (!name || name === "Pending...") return "?";

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function KycTeamList({
  data,
}: KycTeamListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleResend = async (member: KycAdmin) => {
    setLoadingId(`resend-${member.id}`);

    const result = await resendInviteAction(member.id);

    setLoadingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.data.message);
  };

  const handleRemove = async (member: KycAdmin) => {
    setLoadingId(`remove-${member.id}`);

    const result = await removeKycAdminAction(member.id);

    setLoadingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Member removed.");
    router.refresh();
  };

  return (
    <Card className="bg-[#13151e] border-white/5 overflow-hidden">
      <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5">
        <CardTitle className="text-white text-base font-semibold">
          Admin & Agent Team
          <span className="ml-2 text-white/30 font-normal text-sm">
            ({data.count})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {data.results.length === 0 ? (
          <div className="py-10 text-center text-white/30 text-sm">
            No team members yet
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/2">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-white/40 h-12 pl-5">
                    Member
                  </TableHead>

                  <TableHead className="text-white/40">
                    Role
                  </TableHead>

                  <TableHead className="text-white/40">
                    Status
                  </TableHead>

                  <TableHead className="text-white/40 text-center">
                    Resolved
                  </TableHead>

                  <TableHead className="text-white/40 text-right pr-5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.results.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-white/5 hover:bg-white/2"
                  >
                    {/* Member */}
                    <TableCell className="pl-5 py-4">
                      <div className="flex items-center gap-3 min-w-60">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-[#2a2d3e] text-white/60 text-xs font-semibold">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {member.name === "Pending..." ? (
                              <span className="text-white/35 italic">
                                Pending…
                              </span>
                            ) : (
                              member.name
                            )}
                          </p>

                          <p className="text-white/35 text-xs truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <span className="text-white/60 text-sm capitalize">
                        {member.role}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {member.status === "pending" ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />

                            <span className="text-amber-400 text-xs font-medium">
                              Pending
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />

                            <span className="text-emerald-400 text-xs font-medium capitalize">
                              {member.status}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>

                    {/* Resolved */}
                    <TableCell className="text-center">
                      <span className="text-white text-sm font-medium">
                        {member.issue_resolved_count}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end gap-2">
                        {member.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-white/15 text-white/50 hover:bg-white/5 hover:text-white hover:border-white/25 bg-transparent"
                            onClick={() => handleResend(member)}
                            disabled={
                              loadingId === `resend-${member.id}`
                            }
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${
                                loadingId === `resend-${member.id}`
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />

                            <span>Resend</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/60 bg-transparent"
                          onClick={() => handleRemove(member)}
                          disabled={
                            loadingId === `remove-${member.id}`
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />

                          <span>Remove</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Pagination
        totalCount={data.count}
        pageSize={PAGE_SIZE}
        paramKey="page"
      />
    </Card>
  );
}