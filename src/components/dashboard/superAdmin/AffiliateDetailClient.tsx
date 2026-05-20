"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle, XCircle, PauseCircle, ChevronLeft, ExternalLink, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import type { AdminAffiliateApplication, AffiliateNote } from "@/types/affiliate.type";
import { updateAffiliateStatusAction, addAffiliateNoteAction } from "@/actions/affiliate.admin.action";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  application: AdminAffiliateApplication;
}

export default function AffiliateDetailClient({ application }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [slug, setSlug] = useState(application.desired_slug || "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notes, setNotes] = useState<AffiliateNote[]>(application.notes ?? []);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleApprove = () => {
    if (!slug.trim()) { setError("A vanity slug is required."); return; }
    setError("");
    startTransition(async () => {
      const result = await updateAffiliateStatusAction(application.id, {
        status: "approved",
        slug: slug.trim(),
      });
      if (result.success) {
        setSuccess("Affiliate approved successfully.");
        router.refresh();
        setShowApproveForm(false);
      } else {
        setError(result.error);
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await updateAffiliateStatusAction(application.id, {
        status: "rejected",
        rejection_reason: rejectionReason,
      });
      if (result.success) {
        setSuccess("Application rejected.");
        router.refresh();
        setShowRejectForm(false);
      } else {
        setError(result.error);
      }
    });
  };

  const handleSuspend = () => {
    startTransition(async () => {
      const result = await updateAffiliateStatusAction(application.id, { status: "suspended" });
      if (result.success) {
        setSuccess("Affiliate suspended.");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    startTransition(async () => {
      const result = await addAffiliateNoteAction(application.id, noteContent.trim());
      if (result.success) {
        setNotes([result.data as unknown as AffiliateNote, ...notes]);
        setNoteContent("");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/affiliates">
          <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-white text-2xl font-bold">{application.full_name}</h2>
          <p className="text-white/40 text-sm">{application.email}</p>
        </div>
        <Badge className={`ml-auto capitalize border text-xs ${
          application.status === "approved" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
          application.status === "pending" ? "bg-amber-400/10 text-amber-400 border-amber-400/20" :
          "bg-red-400/10 text-red-400 border-red-400/20"
        }`}>
          {application.status}
        </Badge>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-3 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 text-sm text-emerald-400">
          <CheckCircle className="w-4 h-4" />{success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Community Info */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="pb-3">
              <h3 className="text-white font-semibold text-sm">Community Information</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Community Name" value={application.community_name} />
              <InfoRow label="Platform" value={<span className="capitalize">{application.platform}</span>} />
              <InfoRow label="Members" value={application.community_member_count?.toLocaleString()} />
              <InfoRow label="Community URL" value={
                <a href={application.community_url} target="_blank" rel="noopener noreferrer"
                   className="text-[#00d4aa] hover:underline flex items-center gap-1">
                  View Community <ExternalLink className="w-3 h-3" />
                </a>
              } />
              {application.community_description && (
                <div>
                  <p className="text-white/40 text-xs mb-1">Description</p>
                  <p className="text-white/70 text-sm">{application.community_description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax & Bank Info */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="pb-3">
              <h3 className="text-white font-semibold text-sm">Tax & Banking</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="RFC / Tax ID" value={application.tax_id || "—"} />
              <InfoRow label="Business Name" value={application.business_name || "—"} />
              <InfoRow label="Country" value={application.country} />
              <InfoRow label="Bank Name" value={application.bank_name || "—"} />
              <InfoRow label="CLABE" value={application.clabe || "—"} />
              <InfoRow label="Account Holder" value={application.account_holder_name || "—"} />
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="pb-3">
              <h3 className="text-white font-semibold text-sm">Documents</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              {[
                { label: "Government ID", url: application.id_document_url },
                { label: "Tax Document", url: application.tax_document_url },
                { label: "Bank Statement", url: application.bank_statement_url },
              ].map(({ label, url }) => (
                <div key={label} className="rounded-lg border border-white/10 p-3 text-center">
                  <FileText className="w-6 h-6 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50 text-xs mb-2">{label}</p>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                       className="text-[#00d4aa] text-xs hover:underline">View →</a>
                  ) : (
                    <span className="text-white/20 text-xs">Not uploaded</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column — actions & notes */}
        <div className="space-y-4">
          {/* Actions */}
          {application.status === "pending" && (
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="pb-3">
                <h3 className="text-white font-semibold text-sm">Review Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {!showApproveForm && !showRejectForm && (
                  <>
                    <Button onClick={() => setShowApproveForm(true)}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button onClick={() => setShowRejectForm(true)}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20">
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </>
                )}

                {showApproveForm && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Vanity Slug <span className="text-red-400">*</span></label>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                        placeholder="e.g. sneakerheads-mx"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                      <p className="text-white/30 text-xs mt-1">payparo.com/p/{slug || "..."}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleApprove} disabled={isPending}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm">
                        {isPending ? "Approving..." : "Confirm Approve"}
                      </Button>
                      <Button onClick={() => setShowApproveForm(false)} variant="ghost" className="text-white/50 text-sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {showRejectForm && (
                  <div className="space-y-3">
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Rejection reason (optional)"
                      className="bg-white/5 border-white/10 text-white text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleReject} disabled={isPending}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm">
                        {isPending ? "Rejecting..." : "Confirm Reject"}
                      </Button>
                      <Button onClick={() => setShowRejectForm(false)} variant="ghost" className="text-white/50 text-sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {application.status === "approved" && (
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="pb-3">
                <h3 className="text-white font-semibold text-sm">Management Actions</h3>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSuspend} disabled={isPending}
                  className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20">
                  <PauseCircle className="w-4 h-4 mr-2" />
                  {isPending ? "Processing..." : "Suspend Affiliate"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="pb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-white/40" /> Internal Notes
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-white/30 text-xs text-center py-4">No notes yet.</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/80 text-xs">{note.content}</p>
                      <p className="text-white/30 text-xs mt-1">{note.author_name} • {new Date(note.created_at).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="bg-white/5 border-white/10 text-white text-xs"
                />
                <Button onClick={handleAddNote} disabled={isPending || !noteContent.trim()}
                  size="sm" className="bg-white/10 hover:bg-white/20 text-white">
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-white/40 text-xs">{label}</span>
      <span className="text-white/80 text-xs text-right max-w-[60%]">{value}</span>
    </div>
  );
}
