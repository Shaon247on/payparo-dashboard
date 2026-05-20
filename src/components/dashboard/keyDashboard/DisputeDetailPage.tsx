"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  MessageCircle,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { DisputeDetail } from "@/types/kyc/dispute.type";
import type { ChatConversation } from "@/types/kyc/messaging.type";
import { useDisputeSocket } from "@/lib/hooks/useDisputeSocket";
import ChatPanel from "./ChatPanel";
import Image from "next/image";

// ─── Confidence display ───────────────────────────────────────────────────────

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const [cls] =
    value >= 0.7
      ? ["text-emerald-400"]
      : value >= 0.4
        ? ["text-amber-400"]
        : ["text-red-400"];
  const label = value >= 0.7 ? "High" : value >= 0.4 ? "Medium" : "Low";
  return (
    <span className={`text-sm font-medium ${cls}`}>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
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
          width={500}
          height={400}
          src={images[index]}
          alt={`Image ${index + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-lg"
        />
        <p className="text-center text-white/40 text-sm mt-3">
          {index + 1} / {images.length}
        </p>
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
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
  if (images.length === 0) {
    return (
      <div className="py-10 text-center text-white/25 text-sm">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {images.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`View image ${i + 1}`}
          className="group aspect-[4/3] bg-[#1a1d27] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors relative"
        >
          <Image
            width={500}
            height={400}
            src={src}
            alt={`Photo ${i + 1}`}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
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
      className="relative w-8 h-8 rounded-full bg-[#0099ff] hover:bg-[#007acc] flex items-center justify-center transition-colors"
    >
      <MessageCircle className="w-4 h-4 text-white" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type PhotoTab = "evidence" | "escrow";

interface DisputeDetailPageProps {
  dispute: DisputeDetail;
  /** Access token passed from the RSC via server action — never from localStorage */
  accessToken: string | null;
  /** Current user's ID for distinguishing own messages */
  currentUserId: string | null;
  /**
   * Conversation IDs for buyer and seller.
   * The backend creates these when the dispute is assigned.
   * Shape: { buyerConversationId: string; sellerConversationId: string }
   */
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
  const [photoTab, setPhotoTab] = useState<PhotoTab>("evidence");
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  // Which chat panel is open — null = none
  const [openChat, setOpenChat] = useState<ChatConversation | null>(null);

  // ── WebSocket — connects on mount, disconnects on unmount ─────────────────
  const {
    messagesByConversation,
    unreadCounts,
    sendMessage,
    markRead,
    status: wsStatus,
  } = useDisputeSocket(accessToken, currentUserId ?? "");

  const activeImages =
    photoTab === "evidence"
      ? dispute.escrow_info.images
      : dispute.escrow_info.main_images;

  const aiDecisionLabel =
    dispute.ai_result.decision === "favor_buyer"
      ? "Favor Buyer"
      : dispute.ai_result.decision === "favor_seller"
        ? "Favor Seller"
        : dispute.ai_result.decision === "need_human_review"
          ? "Need Human Review"
          : "Uncertain";

  const statusLabel =
    dispute.current_status === "resolved" ? "Resolved" : "Pending Review";
  const statusCls =
    dispute.current_status === "resolved"
      ? "border-emerald-500/40 text-emerald-400 bg-emerald-400/5"
      : "border-amber-500/40 text-amber-400 bg-amber-400/5";

  const openChatFor = (conversation: ChatConversation) => {
    setOpenChat(conversation);
  };

  const closeChat = () => setOpenChat(null);

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

      {/* Chat panel — renders when a chat is open */}
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
          onClose={closeChat}
        />
      )}

      <div className="space-y-5 pb-24">
        {/* Header */}
        <div>
          <h2 className="text-white text-2xl font-bold">Dispute Management</h2>
          <p className="text-white/40 text-sm mt-1 font-mono">
            {dispute.escrow_info.order_id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* ── Left ─────────────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Summary */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base font-semibold">
                    Dispute Summary
                  </CardTitle>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCls}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Product</p>
                    <p className="text-white text-sm font-medium">
                      {dispute.escrow_info.product_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Escrow Amount</p>
                    <p className="text-white text-sm font-medium">
                      ${dispute.escrow_info.price}{" "}
                      {dispute.escrow_info.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Reason</p>
                    <p className="text-white text-sm font-medium">
                      {dispute.reason}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Submitted</p>
                    <p className="text-white text-sm font-medium">
                      {new Date(dispute.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                {dispute.note && (
                  <div>
                    <p className="text-white/40 text-xs mb-1">
                      Additional Note
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {dispute.note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Buyer claim + photo tabs */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">
                  Buyer Claim
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <p className="text-white/60 text-sm leading-relaxed">
                  {dispute.reason}
                </p>

                {/* Tab switcher */}
                <div className="flex gap-1 p-1 bg-[#0f1117] rounded-lg w-fit">
                  {(["evidence", "escrow"] as PhotoTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPhotoTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        photoTab === tab
                          ? "bg-[#1a1d27] text-white"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {tab === "evidence" ? "Evidence Photos" : "Escrow Photos"}
                      <span className="ml-1.5 text-xs text-white/30">
                        (
                        {tab === "evidence"
                          ? dispute.escrow_info.images?.length
                          : dispute.escrow_info.main_images?.length}
                        )
                      </span>
                    </button>
                  ))}
                </div>

                <ImageGrid
                  images={activeImages}
                  onOpen={(i) =>
                    setLightbox({ images: activeImages, index: i })
                  }
                  emptyLabel={
                    photoTab === "evidence"
                      ? "No evidence photos provided."
                      : "No escrow listing photos available."
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* ── Right ────────────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Parties with live chat buttons */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {[
                  {
                    label: "Seller",
                    user: dispute.seller,
                    conversationId: sellerConversationId,
                  },
                  {
                    label: "Buyer",
                    user: dispute.buyer,
                    conversationId: buyerConversationId,
                  },
                ].map(({ label, user, conversationId }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#0099ff]/10 rounded-md">
                          <User className="w-4 h-4 text-[#0099ff]" />
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">{label}</p>
                          <p className="text-white text-sm font-medium">
                            {user.full_name}
                          </p>
                          <p className="text-white/35 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <ChatButton
                        userName={user.full_name}
                        unread={unreadCounts[conversationId] ?? 0}
                        onClick={() =>
                          openChatFor({
                            conversationId,
                            participantName: user.full_name,
                            participantId: user.id,
                          })
                        }
                      />
                    </div>
                    {label === "Seller" && (
                      <div className="h-px bg-white/5 mt-4" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Case information */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">
                  Case Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <div>
                  <p className="text-white/40 text-xs mb-1">AI Confidence</p>
                  <ConfidenceBadge value={dispute.ai_result.confidence} />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Evidence Items</p>
                  <p className="text-white text-sm font-medium">
                    {dispute.escrow_info.images.length} photo
                    {dispute.escrow_info.images.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Item Type</p>
                  <p className="text-white text-sm font-medium capitalize">
                    {dispute.escrow_info.item_type}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI result */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">
                  AI Result
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <span
                  className={`inline-block border rounded-full px-5 py-2 text-sm font-semibold ${
                    dispute.ai_result.decision === "favor_buyer"
                      ? "border-[#0099ff]/50 text-[#0099ff]"
                      : dispute.ai_result.decision === "favor_seller"
                        ? "border-emerald-500/50 text-emerald-400"
                        : "border-amber-500/50 text-amber-400"
                  }`}
                >
                  {aiDecisionLabel}
                </span>
                {dispute.ai_result.summary && (
                  <p className="text-white/50 text-xs leading-relaxed mt-2">
                    {dispute.ai_result.summary}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 right-0 left-0 md:left-[220px] lg:left-[240px] bg-[#0f1117]/80 backdrop-blur-sm border-t border-white/5 px-4 md:px-6 lg:px-8 py-4 flex justify-end z-10">
        <Button
          disabled
          className="bg-[#0099ff] hover:bg-[#007acc] text-white font-semibold h-11 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Resolution API coming soon"
        >
          Resolve Case
        </Button>
      </div>
    </>
  );
}
