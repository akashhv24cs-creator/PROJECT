export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface SendChatMessageParams {
  message: string;
  conversationId: string;
  uid: string;
}

export interface SendChatMessageResponse {
  reply: string;
}
