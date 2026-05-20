"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type {
  WsInboundEvent,
  WsMessage,
  WsSendMessagePayload,
  WsSendReadReceiptPayload,
} from "@/types/kyc/messaging.type";

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:9000";

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 1000; // 1 s → 2 s → 4 s → …

export interface UseDisputeSocketReturn {
  /** All messages keyed by conversation_id */
  messagesByConversation: Record<string, WsMessage[]>;
  /** Unread count per conversation_id */
  unreadCounts: Record<string, number>;
  /** Send a text message to a conversation */
  sendMessage: (conversationId: string, body: string) => void;
  /** Mark all messages in a conversation as read */
  markRead: (conversationId: string, messageIds: string[]) => void;
  /** WebSocket connection status */
  status: "connecting" | "connected" | "disconnected" | "error";
}

export function useDisputeSocket(
  accessToken: string | null,
  /** The current user's own ID — used to distinguish sent vs received */
  currentUserId: string,
): UseDisputeSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, WsMessage[]>
  >({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");

  // Track which conversation panel is currently open so we don't count those
  const openConversationRef = useRef<string | null>(null);

  // ── Connect (and reconnect) ────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!accessToken || !isMountedRef.current) return;

    const url = `${WS_BASE}/ws/user/?token=${accessToken}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      if (!isMountedRef.current) { ws.close(1000, "Component unmounted"); return; }
      reconnectAttemptRef.current = 0; // reset on successful connection
      setStatus("connected");
    };

    ws.onclose = (e) => {
      wsRef.current = null;
      if (!isMountedRef.current) return; // deliberate cleanup — don't reconnect

      setStatus("disconnected");

      // Only reconnect on unexpected closes (not a clean 1000/1001)
      const isAbnormal = e.code !== 1000 && e.code !== 1001;
      if (isAbnormal && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = BASE_BACKOFF_MS * Math.pow(2, reconnectAttemptRef.current);
        reconnectAttemptRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      // onerror always fires right before onclose; actual close handling is done above
      if (isMountedRef.current) setStatus("error");
      ws.close();
    };

    ws.onmessage = (event) => {
      let parsed: WsInboundEvent;
      try {
        parsed = JSON.parse(event.data) as WsInboundEvent;
      } catch {
        return;
      }

      if (parsed.type === "chat_message") {
        const msg = parsed.message;
        const convId = msg.conversation;

        setMessagesByConversation((prev) => ({
          ...prev,
          [convId]: [...(prev[convId] ?? []), msg],
        }));

        const isFromSelf = msg.sender.id === currentUserId;
        const isPanelOpen = openConversationRef.current === convId;

        if (!isFromSelf && !isPanelOpen) {
          setUnreadCounts((prev) => ({
            ...prev,
            [convId]: (prev[convId] ?? 0) + 1,
          }));
        }
      }

      if (parsed.type === "read_receipt") {
        const { message_ids } = parsed;
        setMessagesByConversation((prev) => {
          const updated = { ...prev };
          for (const convId of Object.keys(updated)) {
            updated[convId] = updated[convId].map((m) =>
              message_ids.includes(m.id) ? { ...m, is_read: true } : m,
            );
          }
          return updated;
        });
      }
    };
  }, [accessToken, currentUserId]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) {
      setStatus("error");
      return;
    }

    isMountedRef.current = true;
    reconnectAttemptRef.current = 0;
    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close(1000, "Page unmounted");
      wsRef.current = null;
    };
  }, [accessToken, connect]);

  // ── Send a message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback((conversationId: string, body: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const payload: WsSendMessagePayload = {
      type: "message",
      conversation_id: conversationId,
      body,
    };
    wsRef.current.send(JSON.stringify(payload));
  }, []);

  // ── Mark messages as read ──────────────────────────────────────────────────
  const markRead = useCallback(
    (conversationId: string, messageIds: string[]) => {
      if (messageIds.length === 0) return;
      setUnreadCounts((prev) => ({ ...prev, [conversationId]: 0 }));
      openConversationRef.current = conversationId;

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const payload: WsSendReadReceiptPayload = {
          type: "read_receipt",
          conversation_id: conversationId,
          message_ids: messageIds,
        };
        wsRef.current.send(JSON.stringify(payload));
      }
    },
    [],
  );

  return {
    messagesByConversation,
    unreadCounts,
    sendMessage,
    markRead,
    status,
  };
}

/** Call this when a chat panel opens/closes so unread tracking knows */
export function setActiveChatConversation(_conversationId: string | null) {
  // Handled via openConversationRef inside the hook — components call markRead() on open.
}
