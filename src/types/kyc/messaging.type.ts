// ─── Inbound WS message shapes (from server) ─────────────────────────────────

export interface WsMessage {
  id: string;
  conversation: string;       // conversation UUID
  sender: {
    id: string;
    username: string;
    full_name: string;
  };
  body: string;
  image: string | null;
  reply_to: string | null;
  reply_to_info?: ReplyToInfo | null;
  is_read: boolean;
  created_at: string;
}

export interface WsChatMessageEvent {
  type: "chat_message";
  message: WsMessage;
}

export interface WsReadReceiptEvent {
  type: "read_receipt";
  message_ids: string[];
  reader_id: string;
}

export interface WsErrorEvent {
  type: "error";
  message: string;
}

export type WsInboundEvent =
  | WsChatMessageEvent
  | WsReadReceiptEvent
  | WsErrorEvent;

// ─── Outbound WS message shapes (to server) ──────────────────────────────────

export interface WsSendMessagePayload {
  type: "message";
  conversation_id: string;
  body: string;
  image_url?: string;
  reply_to_id?: string;
}

export interface WsSendReadReceiptPayload {
  type: "read_receipt";
  conversation_id: string;
  message_ids: string[];
}

// ─── Local conversation state ─────────────────────────────────────────────────

export interface ChatConversation {
  conversationId: string;
  participantName: string;
  participantId: string;
}




export interface ConversationMessageSenderInfo {
  id: string;
  username: string;
  full_name: string;
  profile_pic: string | null;
}

export interface ReplyToInfo {
  id: string;
  body: string;
  image: string | null;
  sender_id: string;
}

export interface ConversationMessage {
  id: string;
  conversation: string;
  sender: string;
  sender_info: ConversationMessageSenderInfo;
  body: string;
  image: string | null;
  reply_to: string | null;
  reply_to_info: ReplyToInfo | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedConversationMessagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ConversationMessage[];
}

export interface ConversationMessagesParams {
  page?: number;
}
