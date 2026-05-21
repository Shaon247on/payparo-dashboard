"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X, AlertCircle, CheckCircle, XCircle, RotateCw, Maximize2 } from "lucide-react";
import type { PendingKycSubmission } from "@/actions/kyc.action";

interface KYCReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: PendingKycSubmission;
  onReview: (action: "approve" | "reject", reason?: string) => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function KYCReviewModal({
  isOpen,
  onClose,
  submission,
  onReview,
  isSubmitting,
  error,
}: KYCReviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [expandedImage, setExpandedImage] = useState<{ url: string; id: string; document_type: string } | null>(null);

  const rotateImage = (id: string, document_type: string) => {
    setRotations((prev) => {
      const current = prev[id] !== undefined ? prev[id] : (document_type.startsWith("face_") ? 90 : 0);
      return {
        ...prev,
        [id]: current + 90,
      };
    });
  };

  const getRotation = (id: string, document_type: string) => {
    if (id in rotations) return rotations[id];
    if (document_type.startsWith("face_")) return 270;
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div>
            <h3 className="text-xl font-bold text-white">Review KYC Submission</h3>
            <p className="text-white/40 text-sm mt-0.5">
              User: <span className="text-white/80">{submission.user_name} ({submission.user_email})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Identity Info */}
            <div className="space-y-6 lg:col-span-1">
              <h4 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Identity Details</h4>

              <div className="space-y-4">
                <DetailItem label="Full Name" value={submission.identity?.full_name} />
                <DetailItem label="ID Number" value={submission.identity?.id_number} />
                <DetailItem label="Date of Birth" value={submission.identity?.date_of_birth} />
                <DetailItem label="Gender" value={submission.identity?.gender} />
                <DetailItem label="Father's Name" value={submission.identity?.father_name} />
                <DetailItem label="Mother's Name" value={submission.identity?.mother_name} />

                <div className="space-y-1">
                  <span className="text-white/40 text-xs uppercase tracking-wider block">Present Address</span>
                  <p className="text-white/90 text-sm bg-white/5 p-3 rounded-lg">{submission.identity?.present_address || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-white/40 text-xs uppercase tracking-wider block">Permanent Address</span>
                  <p className="text-white/90 text-sm bg-white/5 p-3 rounded-lg">{submission.identity?.permanent_address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-6 lg:col-span-2">
              <h4 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Documents & Photos</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submission.documents?.map((doc) => (
                  <div key={doc.id} className="space-y-2">
                    <span className="text-white/60 text-sm font-medium capitalize flex items-center justify-between">
                      {doc.document_type.replace('_', ' ')}
                      {doc.url && (
                        <button
                          onClick={() => rotateImage(doc.id, doc.document_type)}
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title="Rotate Image"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                    <div
                      className="aspect-[4/3] rounded-xl bg-black/50 border border-white/10 overflow-hidden relative group cursor-pointer"
                      onClick={() => doc.url && setExpandedImage({ url: doc.url, id: doc.id, document_type: doc.document_type })}
                    >
                      {doc.url ? (
                        <>
                          <div
                            className="w-full h-full p-2 transition-transform duration-300"
                            style={{ transform: `rotate(${getRotation(doc.id, doc.document_type)}deg)` }}
                          >
                            <img
                              src={doc.url}
                              alt={doc.document_type}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                          Image not found
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 bg-white/5 px-6 py-4">
          {isRejecting ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this KYC was rejected..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsRejecting(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onReview("reject", rejectReason)}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="px-6 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-lg shadow-rose-500/20"
                >
                  {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsRejecting(true)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => onReview("approve")}
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? "Approving..." : "Approve KYC"}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Lightbox for Expanded Image */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-6 right-6 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-full max-h-full">
            <img
              src={expandedImage.url}
              alt="Expanded view"
              className="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-300"
              style={{ transform: `rotate(${getRotation(expandedImage.id, expandedImage.document_type)}deg)` }}
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                rotateImage(expandedImage.id, expandedImage.document_type);
              }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium flex items-center gap-2 transition-colors border border-white/20 shadow-xl"
            >
              <RotateCw className="w-4 h-4" />
              Rotate Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white/90 font-medium text-sm text-right">{value || "N/A"}</span>
    </div>
  );
}
