export type ConversationType = "DIRECT" | "GROUP";

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Conversation = {
  id: string;
  type: ConversationType;
  title: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};
