"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Send,
  WifiOff,
  Loader2,
  Reply,
} from "lucide-react";
import type { WsMessage } from "@/types/kyc/messaging.type";
import Image from "next/image";

// ─── Connection status ────────────────────────────────────────────────────────

function ConnectionPill({ status }: { status: string }) {
  if (status === "connected") return null;

  return (
    <div
      className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
        status === "connecting"
          ? "bg-amber-500/10 text-amber-400"
          : "bg-red-500/10 text-red-400"
      }`}
    >
      {status === "connecting" ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}

      {status === "connecting"
        ? "Connecting…"
        : "Disconnected"}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isSelf,
  onReply,
}: {
  message: WsMessage;
  isSelf: boolean;
  onReply: (message: WsMessage) => void;
}) {
  const time = new Date(message.created_at).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );

  return (
    <div
      className={`flex flex-col ${
        isSelf ? "items-end" : "items-start"
      }`}
    >
      {!isSelf && (
        <span className="text-white/35 text-xs mb-1 px-1">
          {message.sender.full_name}
        </span>
      )}

      <div
        className={`group relative max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isSelf
            ? "bg-[#0099ff] text-white rounded-br-sm"
            : "bg-[#1a1d27] text-white/90 rounded-bl-sm"
        }`}
      >
        {/* Reply preview */}
        {message.reply_to_info && (
          <div className="mb-2 border-l-2 border-white/20 pl-2 py-1 bg-black/10 rounded">
            <p className="text-[11px] text-white/50 mb-0.5">
              Replying to
            </p>

            <p className="text-xs text-white/70 line-clamp-2">
              {message.reply_to_info.body || "Image"}
            </p>
          </div>
        )}

        {message.image && (
          <Image
            width={220}
            height={220}
            src={message.image}
            alt="attachment"
            className="rounded-lg mb-2 max-w-full object-cover"
          />
        )}

        {message.body}

        {/* Reply button */}
        <button
          onClick={() => onReply(message)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Reply className="w-3.5 h-3.5 text-white/60 hover:text-white" />
        </button>
      </div>

      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-white/20 text-xs">
          {time}
        </span>

        {isSelf && (
          <span className="text-[10px] text-white/20">
            {message.is_read ? "Seen" : "Sent"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface ChatPanelProps {
  participantName: string;
  conversationId: string;
  currentUserId: string;
  messages: WsMessage[];
  unreadCount: number;
  wsStatus: "connecting" | "connected" | "disconnected" | "error";
  onSend: (
    conversationId: string,
    body: string,
    replyToId?: string | null
  ) => void;
  onMarkRead: (
    conversationId: string,
    messageIds: string[]
  ) => void;
  onClose: () => void;
}

export default function ChatPanel({
  participantName,
  conversationId,
  currentUserId,
  messages,
  wsStatus,
  onSend,
  onMarkRead,
  onClose,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] =
    useState<WsMessage | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ─── Sort messages correctly ───────────────────────────────────────────────

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    );
  }, [messages]);

  // ─── Mark read ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const unreadIds = sortedMessages
      .filter(
        (m) =>
          !m.is_read &&
          m.sender.id !== currentUserId
      )
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      onMarkRead(conversationId, unreadIds);
    }
  }, [
    sortedMessages,
    currentUserId,
    onMarkRead,
    conversationId,
  ]);

  // ─── Auto scroll ────────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [sortedMessages.length]);

  // ─── Send message ───────────────────────────────────────────────────────────

  const handleSend = () => {
    const trimmed = input.trim();

    if (!trimmed || wsStatus !== "connected") {
      return;
    }

    onSend(
      conversationId,
      trimmed,
      replyingTo?.id ?? null
    );

    setInput("");
    setReplyingTo(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-[72px] right-4 md:right-6 lg:right-8 w-[360px] max-h-[560px] flex flex-col rounded-2xl border border-white/10 bg-[#13151e] shadow-2xl z-40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0099ff]/20 flex items-center justify-center">
            <span className="text-[#0099ff] text-xs font-bold">
              {participantName
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <div>
            <p className="text-white text-sm font-semibold">
              {participantName}
            </p>

            <p className="text-white/35 text-xs">
              Dispute chat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionPill status={wsStatus} />

          <button
            onClick={onClose}
            className="text-white/30 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {sortedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-white/25 text-sm text-center">
              No messages yet.
            </p>
          </div>
        ) : (
          sortedMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSelf={
                msg.sender.id === currentUserId
              }
              onReply={setReplyingTo}
            />
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-3 pt-3">
          <div className="bg-[#1a1d27] border border-white/10 rounded-xl p-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-[#0099ff] mb-1">
                Replying to{" "}
                {replyingTo.sender.full_name}
              </p>

              <p className="text-xs text-white/70 line-clamp-2">
                {replyingTo.body || "Image"}
              </p>
            </div>

            <button
              onClick={() => setReplyingTo(null)}
              className="text-white/40 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-10 focus-visible:ring-0 focus-visible:border-white/20 text-sm"
            disabled={wsStatus !== "connected"}
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={
              !input.trim() ||
              wsStatus !== "connected"
            }
            className="h-10 w-10 shrink-0 bg-[#0099ff] hover:bg-[#007acc]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {wsStatus !== "connected" && (
          <p className="text-white/25 text-xs mt-1.5 text-center">
            Reconnect to send messages
          </p>
        )}
      </div>
    </div>
  );
}