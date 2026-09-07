import { messageRepository } from "./message.repository.js";
import { conversationRepository } from "../conversation/conversation.repository.js";
import { friendshipRepository } from "../friends/friendship.repository.js";
import {
  assertMembership,
  memberUserId,
} from "../conversation/conversation.members.js";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../errors/AppError.js";
import { toId } from "../../utils/ids.js";

const normalizeMessage = (message) => {
  if (!message) return null;

  const sender =
    message.sender && typeof message.sender === "object"
      ? message.sender
      : null;
  const senderId =
    sender?.id || sender?._id?.toString?.() || message.sender?.toString?.();

  return {
    id: message._id?.toString?.() ?? message.id,
    conversationId:
      message.conversation?.toString?.() ?? message.conversationId,
    senderId,
    senderName: sender?.displayName || sender?.name || "Unknown user",
    senderAvatar: sender?.avatarUrl || sender?.avatar || "",
    text: message.content,
    content: message.content,
    type: message.type,
    status: message.status,
    attachmentUrl: message.attachmentUrl || null,
    attachmentName: message.attachmentName || null,
    attachmentSize: message.attachmentSize || null,
    attachmentMime: message.attachmentMime || null,
    createdAt: message.createdAt
      ? new Date(message.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: message.updatedAt
      ? new Date(message.updatedAt).toISOString()
      : null,
    editedAt: message.editedAt
      ? new Date(message.editedAt).toISOString()
      : null,
    deletedAt: message.deletedAt
      ? new Date(message.deletedAt).toISOString()
      : null,
    readBy: Array.isArray(message.reads)
      ? message.reads
          .map(
            (read) =>
              read.user?.id ||
              read.user?._id?.toString?.() ||
              read.user?.toString?.(),
          )
          .filter(Boolean)
      : [],
  };
};

const requireConversation = async (conversationId, userId) => {
  const conversation = await conversationRepository.findById(conversationId);
  assertMembership(conversation, userId);
  return conversation;
};

const requireOwnedMessage = async (conversationId, messageId, senderId) => {
  await requireConversation(conversationId, senderId);
  const existing = await messageRepository.findById(messageId);
  if (!existing || toId(existing.conversation) !== conversationId) {
    throw new NotFoundError("Message not found.");
  }
  if (toId(existing.sender) !== senderId) {
    throw new ForbiddenError("You can only change your own messages.");
  }
  return existing;
};

export const messageService = {
  async list(conversationId, page, limit, currentUserId) {
    await requireConversation(conversationId, currentUserId);

    const [total, items] = await Promise.all([
      messageRepository.countByConversation(conversationId),
      messageRepository.listByConversation({
        conversationId,
        page,
        limit,
      }),
    ]);

    return {
      items: items.map(normalizeMessage),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.max(1, Math.ceil(total / Number(limit))),
    };
  },

  async create({
    conversationId,
    senderId,
    content,
    attachmentUrl,
    attachmentName,
    attachmentSize,
    attachmentMime,
  }) {
    const conversation = await requireConversation(conversationId, senderId);

    if (conversation.type === "DIRECT") {
      const otherId = (conversation.members || [])
        .map((member) => memberUserId(member))
        .find((id) => id && id !== senderId);
      if (otherId) {
        const friends = await friendshipRepository.areFriends(senderId, otherId);
        if (!friends) {
          throw new ForbiddenError(
            "You can only send messages to accepted friends.",
          );
        }
      }
    }

    const trimmed = content ? String(content).trim() : "";
    if (!trimmed && !attachmentUrl) {
      throw new ValidationError("A message is required.");
    }

    const type = attachmentUrl
      ? attachmentMime?.startsWith("image/")
        ? "IMAGE"
        : "FILE"
      : "TEXT";

    const message = await messageRepository.create({
      conversationId,
      senderId,
      content: trimmed,
      type,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      attachmentMime,
    });

    await conversationRepository.updateById(conversationId, {
      lastMessageAt: new Date(),
    });
    return normalizeMessage(message);
  },

  async update(conversationId, messageId, senderId, content) {
    await requireOwnedMessage(conversationId, messageId, senderId);
    const updated = await messageRepository.updateById(messageId, {
      content: String(content).trim(),
      editedAt: new Date(),
      editedBy: senderId,
    });
    return normalizeMessage(updated);
  },

  async delete(conversationId, messageId, senderId) {
    await requireOwnedMessage(conversationId, messageId, senderId);
    const updated = await messageRepository.updateById(messageId, {
      deletedAt: new Date(),
      content: "[deleted]",
    });
    return normalizeMessage(updated);
  },
};
