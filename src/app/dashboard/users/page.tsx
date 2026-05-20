import { Suspense } from "react";
import UserManagementPage from "@/components/dashboard/superAdmin/UserManagementPage";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import { getUsersAction } from "@/actions/users.action";
import type { KycStatus } from "@/types/users.type";
import { AlertCircle, Users } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "Approved",     value: "approved"      },
  { label: "Pending",      value: "pending"       },
  { label: "Under Review", value: "under_review"  },
  { label: "Rejected",     value: "rejected"      },
  { label: "Not Submitted",value: "not_submitted" },
];

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { q, status, page } = await searchParams;

  const result = await getUsersAction({
    q:      q ?? undefined,
    status: (status as KycStatus) ?? undefined,
    page:   page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#0091e5]/10">
              <Users className="w-4 h-4 text-[#0091e5]" />
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight">User Management</h2>
          </div>
          <p className="text-white/40 text-sm mt-1 ml-0.5">
            View, search and manage platform user accounts
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <Suspense fallback={<div className="h-11" />}>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput paramKey="q" placeholder="Search by name, email or ID…" />
          <StatusFilter
            paramKey="status"
            options={STATUS_OPTIONS}
            allValue="all"
            allLabel="All KYC Statuses"
          />
        </div>
      </Suspense>

      {/* Error state */}
      {!result.success ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : (
        <UserManagementPage data={result.data} />
      )}
    </div>
  );
}