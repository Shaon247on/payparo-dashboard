"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FileText, Search, UserCheck } from "lucide-react";

import type { PaginatedPendingKycResponse, PendingKycSubmission } from "@/actions/kyc.action";
import { reviewKycAction } from "@/actions/kyc.action";
import KYCReviewModal from "./KYCReviewModal";

export default function PendingKycPage({ data, initialStatus }: { data: PaginatedPendingKycResponse, initialStatus: string }) {
  const router = useRouter();
  const [selectedSubmission, setSelectedSubmission] = useState<PendingKycSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(initialStatus);

  const openModal = (submission: PendingKycSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
    setError(null);
  };

  const handleReview = async (action: "approve" | "reject", reason?: string) => {
    if (!selectedSubmission) return;
    setIsSubmitting(true);
    setError(null);

    const result = await reviewKycAction(selectedSubmission.id, action, reason);

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      setSelectedSubmission(null);
      router.refresh();
    } else {
      setError(result.error || "Failed to process review.");
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setFilter(newStatus);
    router.push(`/dashboard/kyc-pending?status=${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            Pending KYC Approvals
          </h2>
          <p className="text-white/40 text-sm mt-1">
            Review user identities and documents.
          </p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-fit">
          <button
            onClick={() => handleFilterChange("pending")}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              filter === "pending"
                ? "bg-emerald-500/20 text-emerald-300 font-medium"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleFilterChange("under_review")}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              filter === "under_review"
                ? "bg-amber-500/20 text-amber-300 font-medium"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            Under Review
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Submitted</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.results.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/40">
                    No KYC submissions found.
                  </td>
                </tr>
              ) : (
                data.results.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.user_name}</div>
                      <div className="text-white/40 text-xs mt-0.5">{item.user_email}</div>
                    </td>
                    <td className="px-6 py-4 text-white/60 whitespace-nowrap">
                      {format(new Date(item.submitted_at), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.status === "pending"
                            ? "bg-white/10 text-white/80"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {item.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(item)}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <KYCReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          submission={selectedSubmission}
          onReview={handleReview}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  );
}
