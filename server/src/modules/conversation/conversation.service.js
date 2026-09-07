import { conversationRepository } from "./conversation.repository.js";
import { friendshipRepository } from "../friends/friendship.repository.js";
import { assertMembership, memberUserId } from "./conversation.members.js";
import { ForbiddenError, ValidationError } from "../../errors/AppError.js";
import { toId } from "../../utils/ids.js";

const buildMemberMeta = (member) => {
  const user = member.user || member.userId;
  const id = memberUserId(member);
  return {
    id,
    userId: id,
    name: user?.displayName || user?.name || "Unknown",
    email: user?.email || "",
    role: member.role,
    status: user?.isOnline ? "online" : "offline",
    avatar: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
  };
};

export const buildConversationPayload = (conversation, currentUserId) => {
  const activeMembers = (conversation.members || []).filter(
    (member) => !member.leftAt,
  );
  const peer = activeMembers.find(
    (member) => memberUserId(member) !== currentUserId,
  );
  const title =
    conversation.type === "DIRECT"
      ? peer?.user?.displayName || "Direct chat"
      : conversation.name || "Group";

  return {
    id: toId(conversation),
    type: conversation.type,
    name: title,
    title,
    description: conversation.description || "",
    avatar:
      conversation.type === "DIRECT"
        ? peer?.user?.avatarUrl || ""
        : conversation.avatarUrl || "",
    members: activeMembers.map((member) => memberUserId(member)),
    membersMeta: activeMembers.map(buildMemberMeta),
    status: activeMembers.some((member) => member.user?.isOnline)
      ? "online"
      : "offline",
    unreadCount: 0,
    lastMessage: null,
    lastMessageAt: conversation.lastMessageAt || null,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

const toPayload = (conversation, userId) => {
  assertMembership(conversation, userId);
  return buildConversationPayload(conversation, userId);
};

export const conversationService = {
  async getForUser(userId) {
    const conversations = await conversationRepository.listForUser(userId);
    return conversations.map((conversation) =>
      buildConversationPayload(conversation, userId),
    );
  },

  async getByIdForUser(id, userId) {
    const conversation = await conversationRepository.findById(id);
    return toPayload(conversation, userId);
  },

  async createDirect(userId, otherUserId) {
    if (userId === otherUserId) {
      throw new ValidationError("You cannot start a conversation with yourself.");
    }

    const friends = await friendshipRepository.areFriends(userId, otherUserId);
    if (!friends) {
      throw new ForbiddenError(
        "You can only start a direct conversation with accepted friends.",
      );
    }

    const directKey = [userId, otherUserId].sort().join(":");
    const existing = await conversationRepository.findByDirectKey(directKey);
    if (existing) return toPayload(existing, userId);

    const created = await conversationRepository.createDirect({
      userId,
      otherUserId,
      directKey,
    });
    return toPayload(created, userId);
  },
};
