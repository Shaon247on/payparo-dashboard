"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type {
  WsInboundEvent,
  WsMessage,
  WsSendMessagePayload,
  WsSendReadReceiptPayload,
} from "@/types/kyc/messaging.type";

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://10.10.13.69:9000";

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

  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, WsMessage[]>
  >({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");

  // Track which conversation panel is currently open so we don't count those
  const openConversationRef = useRef<string | null>(null);

  // ── Connect on mount, disconnect on unmount ────────────────────────────────
  useEffect(() => {
    if (!accessToken) {
      console.error("[WS] Missing access token");
      setStatus("error");
      return;
    }

    const url = `${WS_BASE}/ws/user/?token=${accessToken}`;

    console.log("[WS] Connecting to:", url);

    const ws = new WebSocket(url);

    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      console.log("[WS] Connected successfully");
      setStatus("connected");
    };

    ws.onclose = (e) => {
      console.warn("[WS] Connection closed", {
        code: e.code,
        reason: e.reason,
        wasClean: e.wasClean,
      });

      setStatus("disconnected");
      wsRef.current = null;
    };

    ws.onerror = (error) => {
      console.error("[WS] Connection error:", error);
      setStatus("error");
    };

    ws.onmessage = (event) => {
      console.log("[WS] Message received:", event.data);

      let parsed: WsInboundEvent;

      try {
        parsed = JSON.parse(event.data) as WsInboundEvent;
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
        return;
      }

      if (parsed.type === "chat_message") {
        const msg = parsed.message;
        const convId = msg.conversation;

        console.log("[WS] New chat message:", {
          conversationId: convId,
          senderId: msg.sender.id,
          messageId: msg.id,
        });

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
        console.log("[WS] Read receipt received:", parsed);

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

    return () => {
      console.log("[WS] Cleaning up websocket connection");

      ws.close(1000, "Page unmounted");
      wsRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]); // only re-run if token changes

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

      // Clear local unread count immediately
      setUnreadCounts((prev) => ({ ...prev, [conversationId]: 0 }));

      // Track this as the open panel so incoming messages don't increment
      openConversationRef.current = conversationId;

      // Send read receipt to server
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
export function setActiveChatConversation(conversationId: string | null) {
  // This is handled via the openConversationRef inside the hook.
  // Components call markRead() on open, which sets openConversationRef internally.
}
