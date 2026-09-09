import { getApiBaseUrl } from "../../constants/env";
import type {
  ChatMessage,
  Conversation,
  ConversationMemberMeta,
  MessagesPage,
} from "./chatTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function unwrapPayload(value: unknown): unknown {
  if (isRecord(value) && "data" in value) {
    return value.data;
  }

  return value;
}

function resolveMediaUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  try {
    const origin = new URL(getApiBaseUrl()).origin;
    return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  } catch {
    return trimmed;
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

export function mapChatMessage(value: unknown): ChatMessage | null {
  const raw = unwrapPayload(value);
  if (!isRecord(raw)) {
    return null;
  }

  const id = asString(raw.id) ?? asString(raw._id);
  const conversationId = asString(raw.conversationId);
  const senderId = asString(raw.senderId);
  const content = asString(raw.content) ?? asString(raw.text) ?? "";

  if (!id || !conversationId || !senderId) {
    return null;
  }

  const readBy = Array.isArray(raw.readBy)
    ? raw.readBy.filter((item): item is string => typeof item === "string")
    : [];

  const attachmentUrl = asString(raw.attachmentUrl);

  return {
    id,
    conversationId,
    senderId,
    senderName: asString(raw.senderName),
    content,
    type: asString(raw.type),
    status: asString(raw.status),
    readBy,
    attachmentUrl: attachmentUrl ? resolveMediaUrl(attachmentUrl) : null,
    attachmentName: asString(raw.attachmentName),
    createdAt: asString(raw.createdAt),
    editedAt: asString(raw.editedAt) ?? null,
    deletedAt: asString(raw.deletedAt) ?? null,
  };
}

function mapMemberMeta(value: unknown): ConversationMemberMeta | null {
  if (!isRecord(value)) {
    return null;
  }

  const userId = asString(value.userId) ?? asString(value.id);
  if (!userId) {
    return null;
  }

  const avatar = asString(value.avatar);

  return {
    userId,
    name: asString(value.name),
    role: asString(value.role),
    status: asString(value.status),
    avatar: avatar ? resolveMediaUrl(avatar) : null,
  };
}

export function mapConversation(value: unknown): Conversation | null {
  const raw = unwrapPayload(value);
  if (!isRecord(raw)) {
    return null;
  }

  const id = asString(raw.id) ?? asString(raw._id);
  const name =
    asString(raw.name) ?? asString(raw.title) ?? asString(raw.username);

  if (!id || !name) {
    return null;
  }

  const members = Array.isArray(raw.members)
    ? raw.members.filter((item): item is string => typeof item === "string")
    : [];

  const membersMeta = Array.isArray(raw.membersMeta)
    ? raw.membersMeta
        .map(mapMemberMeta)
        .filter((item): item is ConversationMemberMeta => item !== null)
    : [];

  const avatar = asString(raw.avatar);
  const lastMessage = raw.lastMessage ? mapChatMessage(raw.lastMessage) : null;

  return {
    id,
    type: asString(raw.type),
    name,
    title: asString(raw.title),
    description: asString(raw.description),
    avatar: avatar ? resolveMediaUrl(avatar) : null,
    members,
    membersMeta,
    status: asString(raw.status),
    unreadCount: typeof raw.unreadCount === "number" ? raw.unreadCount : 0,
    lastMessage,
    lastMessageAt:
      asString(raw.lastMessageAt) ?? lastMessage?.createdAt ?? null,
  };
}

export function mapConversations(value: unknown): Conversation[] {
  const raw = unwrapPayload(value);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(mapConversation)
    .filter((item): item is Conversation => item !== null);
}

export function mapMessagesPage(value: unknown): MessagesPage {
  const raw = unwrapPayload(value);

  if (Array.isArray(raw)) {
    const items = raw
      .map(mapChatMessage)
      .filter((item): item is ChatMessage => item !== null);
    return { items, page: 1, limit: items.length };
  }

  if (!isRecord(raw) || !Array.isArray(raw.items)) {
    return { items: [], page: 1, limit: 50 };
  }

  return {
    items: raw.items
      .map(mapChatMessage)
      .filter((item): item is ChatMessage => item !== null),
    total: typeof raw.total === "number" ? raw.total : undefined,
    page: typeof raw.page === "number" ? raw.page : 1,
    limit: typeof raw.limit === "number" ? raw.limit : 50,
    totalPages: typeof raw.totalPages === "number" ? raw.totalPages : undefined,
  };
}

export function mapPresencePayload(
  value: unknown,
): { userId: string; isOnline: boolean } | null {
  const raw = unwrapPayload(value);
  if (!isRecord(raw)) {
    return null;
  }

  const userId =
    asString(raw.userId) ?? asString(raw.id) ?? asString(raw.user_id);

  if (!userId) {
    return null;
  }

  if (typeof raw.isOnline === "boolean") {
    return { userId, isOnline: raw.isOnline };
  }

  const status = asString(raw.status);
  if (status === "online" || status === "offline") {
    return { userId, isOnline: status === "online" };
  }

  return { userId, isOnline: true };
}

export function mapTypingPayload(value: unknown): {
  conversationId: string;
  userId?: string;
  isTyping: boolean;
} | null {
  const raw = unwrapPayload(value);
  if (!isRecord(raw)) {
    return null;
  }

  const conversationId = asString(raw.conversationId);
  if (!conversationId) {
    return null;
  }

  return {
    conversationId,
    userId: asString(raw.userId) ?? asString(raw.senderId),
    isTyping: raw.isTyping !== false,
  };
}

export function mapDeletedMessage(value: unknown): {
  id?: string;
  conversationId?: string;
} | null {
  const raw = unwrapPayload(value);
  if (!isRecord(raw)) {
    return null;
  }

  return {
    id: asString(raw.id) ?? asString(raw.messageId),
    conversationId: asString(raw.conversationId),
  };
}
