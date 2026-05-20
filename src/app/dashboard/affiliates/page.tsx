import { Suspense } from "react";
import { AlertCircle, Link2, Users, DollarSign, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminAffiliatesAction } from "@/actions/affiliate.admin.action";
import type { AffiliateStatus, AdminAffiliateApplication } from "@/types/affiliate.type";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import Link from "next/link";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

const STATUS_COLORS: Record<AffiliateStatus, string> = {
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  approved: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  rejected: "bg-red-400/10 text-red-400 border-red-400/20",
  suspended: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminAffiliatesPage({ searchParams }: PageProps) {
  const { q, status, page } = await searchParams;

  const result = await getAdminAffiliatesAction({
    q: q ?? undefined,
    status: status ?? undefined,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Affiliate Management</h2>
        <p className="text-white/40 text-sm mt-1">
          Review applications, manage payouts, and monitor performance
        </p>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Applications", href: "/dashboard/affiliates", icon: Users, color: "text-[#00d4aa]", bg: "bg-[#00d4aa]/10" },
          { label: "Withdrawals", href: "/dashboard/affiliates/withdrawals", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Budget Cap", href: "/dashboard/affiliates/budget", icon: Link2, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Fraud Flags", href: "/dashboard/affiliates/fraud", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-400/10" },
        ].map(({ label, href, icon: Icon, color, bg }) => (
          <Link key={href} href={href}>
            <Card className="bg-[#13151e] border-white/5 hover:border-white/10 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-md ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-white/70 text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Search + Filter */}
      <Suspense fallback={<div className="h-11" />}>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput paramKey="q" placeholder="Search by name, email or community" />
          <StatusFilter paramKey="status" options={STATUS_OPTIONS} allValue="all" allLabel="All Status" />
        </div>
      </Suspense>

      {/* Error state */}
      {!result.success ? (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : (
        <AffiliateTable applications={result.data.results} />
      )}
    </div>
  );
}

function AffiliateTable({ applications }: { applications: AdminAffiliateApplication[] }) {
  if (applications.length === 0) {
    return (
      <Card className="bg-[#13151e] border-white/5">
        <CardContent className="p-12 text-center">
          <Link2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No affiliate applications found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3.5 text-white/40 font-medium">Applicant</th>
                <th className="text-left px-5 py-3.5 text-white/40 font-medium">Community</th>
                <th className="text-left px-5 py-3.5 text-white/40 font-medium">Platform</th>
                <th className="text-left px-5 py-3.5 text-white/40 font-medium">Status</th>
                <th className="text-left px-5 py-3.5 text-white/40 font-medium">Applied</th>
                <th className="text-left px-5 py-3.5 text-white/40 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-white font-medium">{app.full_name}</p>
                      <p className="text-white/40 text-xs">{app.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white/80">{app.community_name}</p>
                    <p className="text-white/40 text-xs">{app.community_member_count.toLocaleString()} members</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-white/60 capitalize">{app.platform}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={`capitalize border text-xs ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-white/40">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/dashboard/affiliates/${app.id}`}
                      className="text-[#00d4aa] text-xs hover:underline font-medium"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
