"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  MessageCircle,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  FileText,
  AlertCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import type { DisputeDetail } from "@/types/kyc/dispute.type";
import type { ChatConversation } from "@/types/kyc/messaging.type";
import { useDisputeSocket } from "@/lib/hooks/useDisputeSocket";
import { resolveDisputeAction } from "@/actions/kyc/dispute.action";
import ChatPanel from "@/components/dashboard/keyDashboard/ChatPanel";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ─── Confidence display ───────────────────────────────────────────────────────

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls =
    value >= 0.7
      ? "text-emerald-400"
      : value >= 0.4
        ? "text-amber-400"
        : "text-rose-400";
  const label = value >= 0.7 ? "High" : value >= 0.4 ? "Medium" : "Low";
  return (
    <span className={`text-sm font-semibold ${cls}`}>
      {label} ({pct}%)
    </span>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <Image
          width={800}
          height={600}
          src={images[index]}
          alt={`Evidence ${index + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-xl"
        />
        <p className="text-center text-white/40 text-sm mt-3">
          {index + 1} / {images.length}
        </p>
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Image grid ───────────────────────────────────────────────────────────────

function ImageGrid({
  images,
  onOpen,
  emptyLabel,
}: {
  images: string[];
  onOpen: (i: number) => void;
  emptyLabel: string;
}) {
  if (!images || images.length === 0) {
    return <div className="py-12 text-center text-white/20 text-sm">{emptyLabel}</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {images.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`View image ${i + 1}`}
          className="group aspect-[4/3] bg-[#1a1d27] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all relative"
        >
          <Image
            width={300}
            height={225}
            src={src}
            alt={`Photo ${i + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Chat button with unread badge ────────────────────────────────────────────

function ChatButton({
  userName,
  unread,
  onClick,
}: {
  userName: string;
  unread: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Chat with ${userName}`}
      className="relative w-8 h-8 rounded-full bg-[#0091e5] hover:bg-[#007acc] flex items-center justify-center transition-colors"
    >
      <MessageCircle className="w-4 h-4 text-white" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}

type PhotoTab = "evidence" | "escrow";

interface DisputeDetailPageProps {
  dispute: DisputeDetail;
  accessToken: string | null;
  currentUserId: string | null;
  buyerConversationId: string;
  sellerConversationId: string;
}

export default function DisputeDetailPage({
  dispute,
  accessToken,
  currentUserId,
  buyerConversationId,
  sellerConversationId,
}: DisputeDetailPageProps) {
  const router = useRouter();
  const [photoTab, setPhotoTab] = useState<PhotoTab>("evidence");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [openChat, setOpenChat] = useState<ChatConversation | null>(null);

  // Resolution Form Modal State
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [decision, setDecision] = useState<"buyer_correct" | "seller_correct">("buyer_correct");
  const [reason, setReason] = useState("");
  const [isResolving, startResolveTransition] = useTransition();

  // ── WebSocket Chat logic ───────────────────────────────────────────────────
  const {
    messagesByConversation,
    unreadCounts,
    sendMessage,
    markRead,
    status: wsStatus,
  } = useDisputeSocket(accessToken, currentUserId ?? "");

  const activeImages =
    photoTab === "evidence"
      ? dispute.escrow_info.images ?? []
      : dispute.escrow_info.main_images ?? [];

  const openChatFor = (conversation: ChatConversation) => {
    setOpenChat(conversation);
  };

  const statusLabel = dispute.current_status === "resolved" ? "Resolved" : "Awaiting Review";
  const statusCls =
    dispute.current_status === "resolved"
      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
      : "border-amber-500/30 text-amber-400 bg-amber-500/5";

  const aiDecisionLabel =
    dispute.ai_result.decision === "buyer_likely_correct"
      ? "Favor Buyer"
      : dispute.ai_result.decision === "seller_likely_correct"
        ? "Favor Seller"
        : dispute.ai_result.decision === "need_human_review"
          ? "Needs Specialist Review"
          : "Uncertain";

  const aiDecisionCls =
    dispute.ai_result.decision === "buyer_likely_correct"
      ? "border-[#0091e5]/30 text-[#0091e5] bg-[#0091e5]/5"
      : dispute.ai_result.decision === "seller_likely_correct"
        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
        : "border-amber-500/30 text-amber-400 bg-amber-500/5";

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please input a formal justification / resolution note.");
      return;
    }

    startResolveTransition(async () => {
      const res = await resolveDisputeAction(dispute.id, decision, reason);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(res.data.message || "Dispute resolved successfully!");
      setShowResolveModal(false);
      router.refresh();
    });
  };

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Live Chat Panel */}
      {openChat && (
        <ChatPanel
          participantName={openChat.participantName}
          conversationId={openChat.conversationId}
          currentUserId={currentUserId ?? ""}
          messages={messagesByConversation[openChat.conversationId] ?? []}
          unreadCount={unreadCounts[openChat.conversationId] ?? 0}
          wsStatus={wsStatus}
          onSend={sendMessage}
          onMarkRead={markRead}
          onClose={() => setOpenChat(null)}
        />
      )}

      {/* Resolution Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="bg-[#13151e] border-white/10 max-w-lg w-full overflow-hidden shadow-2xl rounded-2xl">
            <CardHeader className="px-5 pt-5 pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0091e5]" />
                Submit Formal Resolution
              </CardTitle>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <form onSubmit={handleResolveSubmit}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                    Administrative Ruling
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision("buyer_correct")}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${decision === "buyer_correct"
                        ? "bg-[#0091e5]/10 border-[#0091e5] text-white"
                        : "bg-white/5 border-white/5 text-white/50 hover:bg-white/[0.08]"
                        }`}
                    >
                      Favor Buyer (Refund)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision("seller_correct")}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${decision === "seller_correct"
                        ? "bg-emerald-500/10 border-emerald-500 text-white"
                        : "bg-white/5 border-white/5 text-white/50 hover:bg-white/[0.08]"
                        }`}
                    >
                      Favor Seller (Payout)
                    </button>
                  </div>
                </div>

                {decision === "buyer_correct" && (
                  <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      The buyer will be fully refunded. If the seller previously contested the AI diagnosis, they will be charged a $10 manual review fee.
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                    Formal Resolution Note
                  </label>
                  <Textarea
                    placeholder="Provide a comprehensive statement explaining the case facts and reasoning behind this ruling. This will be recorded on the official transaction history."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-[#0a0c10] border-white/5 text-white rounded-xl placeholder:text-white/20 focus-visible:ring-[#0091e5]/50 min-h-[120px]"
                    required
                  />
                </div>
              </CardContent>
              <div className="px-5 py-4 bg-[#0a0c10]/40 border-t border-white/5 flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="bg-transparent hover:bg-white/5 text-white/70 hover:text-white border border-white/5 rounded-xl h-10 px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isResolving}
                  className="bg-[#0091e5] hover:bg-[#007acc] text-white font-semibold rounded-xl h-10 px-6"
                >
                  {isResolving ? "Resolving..." : "Submit Decision"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-white text-2xl font-bold tracking-tight">Dispute Room</h2>
            <p className="text-white/40 text-sm mt-1 font-mono flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Order ID: {dispute.escrow_info.order_id}
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span
              className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusCls}`}
            >
              {statusLabel}
            </span>
            {dispute.current_status !== "resolved" && (
              <Button
                onClick={() => setShowResolveModal(true)}
                className="bg-[#0091e5] cursor-pointer hover:bg-[#007acc] text-white font-semibold h-9 px-5 rounded-xl shadow-lg shadow-[#0091e5]/10 flex items-center gap-1.5 text-xs transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Resolve Case
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Left Area */}
          <div className="space-y-5">
            {/* Case Details */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">
                  Dispute Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Product Listing</p>
                    <p className="text-white text-sm font-semibold">
                      {dispute.escrow_info.product_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Escrow Total</p>
                    <p className="text-white text-sm font-semibold">
                      ${dispute.escrow_info.price} {dispute.escrow_info.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Dispute Reason</p>
                    <p className="text-white text-sm font-semibold">{dispute.reason}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Opened On</p>
                    <p className="text-white text-sm font-semibold">
                      {new Date(dispute.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-white/5 my-2" />

                {dispute.note && (
                  <div>
                    <p className="text-white/40 text-xs mb-1">Claim Statement</p>
                    <p className="text-white/70 text-sm leading-relaxed bg-[#0a0c10]/40 p-4 rounded-xl border border-white/5">
                      {dispute.note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photos & Listing Evidence */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">Media Evidence</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {/* Photo Tab switcher */}
                <div className="flex bg-[#0f1117] p-1 rounded-xl w-fit">
                  {(["evidence", "escrow"] as PhotoTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPhotoTab(tab)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${photoTab === tab
                        ? "bg-[#181b24] text-white shadow"
                        : "text-white/40 hover:text-white/70"
                        }`}
                    >
                      {tab === "evidence" ? "Claimant Evidence" : "Original Listing"}
                      <span className="ml-1.5 text-xs text-white/30">
                        (
                        {tab === "evidence"
                          ? dispute.escrow_info.images?.length ?? 0
                          : dispute.escrow_info.main_images?.length ?? 0}
                        )
                      </span>
                    </button>
                  ))}
                </div>

                <ImageGrid
                  images={activeImages}
                  onOpen={(idx) => setLightbox({ images: activeImages, index: idx })}
                  emptyLabel={
                    photoTab === "evidence"
                      ? "No evidence photos provided by claimant."
                      : "No original listing photos recorded."
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Area */}
          <div className="space-y-5">
            {/* Involved Parties */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">Active Parties</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {[
                  {
                    label: "Seller (Counterparty)",
                    user: dispute.seller,
                    conversationId: sellerConversationId,
                  },
                  {
                    label: "Buyer (Claimant)",
                    user: dispute.buyer,
                    conversationId: buyerConversationId,
                  },
                ].map(({ label, user, conversationId }) => (
                  <div key={label} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0091e5]/10 rounded-xl">
                          <User className="w-4 h-4 text-[#0091e5]" />
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">
                            {label}
                          </p>
                          <p className="text-white text-sm font-semibold">
                            {user?.full_name || "Unknown User"}
                          </p>
                          <p className="text-white/30 text-xs truncate max-w-[150px]">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      {conversationId && (
                        <ChatButton
                          userName={user?.full_name || "User"}
                          unread={unreadCounts[conversationId] ?? 0}
                          onClick={() =>
                            openChatFor({
                              conversationId,
                              participantName: user?.full_name || "User",
                              participantId: user?.id || "",
                            })
                          }
                        />
                      )}
                    </div>
                    {label.startsWith("Seller") && <div className="h-px bg-white/5 mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Diagnostics */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0091e5]" />
                  AI Co-Pilot Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <div>
                  <p className="text-white/40 text-xs mb-1.5">Diagnosis Confidence</p>
                  <ConfidenceBadge value={dispute.ai_result.confidence} />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1.5">Automated Verdict</p>
                  <span
                    className={`inline-block border rounded-full px-3 py-1 text-xs font-bold ${aiDecisionCls}`}
                  >
                    {aiDecisionLabel}
                  </span>
                </div>
                {dispute.ai_result.summary && (
                  <div>
                    <p className="text-white/40 text-xs mb-1.5">Verdict Justification</p>
                    <p className="text-white/50 text-xs leading-relaxed bg-[#0a0c10]/40 p-3 rounded-xl border border-white/5">
                      {dispute.ai_result.summary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resolution Console */}
            {dispute.current_status !== "resolved" && (
              <Card className="bg-[#13151e] border-[#0091e5]/20 shadow-lg shadow-[#0091e5]/5">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-white text-base font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0091e5]" />
                    Resolution Console
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  <p className="text-white/40 text-xs leading-relaxed">
                    Review is active. Real-time buyer/seller conversations are ready. Select administrative ruling to resolve this case.
                  </p>
                  <Button
                    onClick={() => setShowResolveModal(true)}
                    className="w-full bg-[#0091e5] hover:bg-[#007acc] text-white font-semibold h-10 rounded-xl shadow-lg shadow-[#0091e5]/10 flex items-center justify-center gap-1.5 text-xs transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Resolve Case
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}