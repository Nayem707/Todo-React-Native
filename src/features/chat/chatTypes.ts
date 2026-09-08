export type ConversationType = "DIRECT" | "GROUP";

export type ConversationMemberMeta = {
  userId: string;
  name?: string;
  role?: string;
  status?: string;
  avatar?: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  type?: string;
  status?: string;
  readBy: string[];
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt?: string;
  editedAt?: string | null;
  deletedAt?: string | null;
};

export type Conversation = {
  id: string;
  type?: ConversationType | string;
  name: string;
  title?: string;
  description?: string;
  avatar: string | null;
  members: string[];
  membersMeta: ConversationMemberMeta[];
  status?: string;
  unreadCount: number;
  lastMessage: ChatMessage | null;
  lastMessageAt: string | null;
};

export type MessagesPage = {
  items: ChatMessage[];
  total?: number;
  page: number;
  limit: number;
  totalPages?: number;
};

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";
