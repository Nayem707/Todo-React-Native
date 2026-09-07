import { conversationRepository } from "../conversation/conversation.repository.js";
import { friendshipRepository } from "../friends/friendship.repository.js";
import {
  assertMembership,
  findActiveMember,
  memberUserId,
} from "../conversation/conversation.members.js";
import { buildConversationPayload } from "../conversation/conversation.service.js";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../errors/AppError.js";
import { MEMBER_ROLE } from "../../constants/index.js";

const asGroup = (conversation, userId) => {
  const member = assertMembership(conversation, userId, "Group not found.");
  if (conversation.type !== "GROUP") {
    throw new NotFoundError("Group not found.");
  }
  return { conversation, member, payload: buildConversationPayload(conversation, userId) };
};

export const groupService = {
  async create(userId, { name, description, memberIds = [] }) {
    const uniqueIds = Array.from(new Set(memberIds.filter((id) => id !== userId)));

    const friendChecks = await Promise.all(
      uniqueIds.map((id) => friendshipRepository.areFriends(userId, id)),
    );
    if (friendChecks.some((isFriend) => !isFriend)) {
      throw new ForbiddenError("You can only add accepted friends to a group.");
    }

    const created = await conversationRepository.createGroup({
      userId,
      name: name.trim(),
      description: description?.trim() || "",
      memberIds: uniqueIds,
    });
    return asGroup(created, userId).payload;
  },

  async getById(userId, groupId) {
    const conversation = await conversationRepository.findById(groupId);
    return asGroup(conversation, userId).payload;
  },

  async update(userId, groupId, { name, description }) {
    const conversation = await conversationRepository.findById(groupId);
    asGroup(conversation, userId);
    const updated = await conversationRepository.updateById(groupId, {
      ...(name ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
    });
    return asGroup(updated, userId).payload;
  },

  async addMembers(userId, groupId, memberIds) {
    const conversation = await conversationRepository.findById(groupId);
    asGroup(conversation, userId);

    const uniqueIds = Array.from(new Set(memberIds.filter((id) => id !== userId)));
    const friendChecks = await Promise.all(
      uniqueIds.map((id) => friendshipRepository.areFriends(userId, id)),
    );
    if (friendChecks.some((isFriend) => !isFriend)) {
      throw new ForbiddenError("You can only add accepted friends to a group.");
    }

    const updated = await conversationRepository.addMembers(groupId, uniqueIds);
    return asGroup(updated, userId).payload;
  },

  async removeMember(actorId, groupId, memberId) {
    const conversation = await conversationRepository.findById(groupId);
    asGroup(conversation, actorId);

    if (actorId === memberId) {
      throw new ValidationError("Use the leave endpoint to leave a group.");
    }

    const target = findActiveMember(conversation, memberId);
    if (!target) throw new NotFoundError("Member not found.");
    if (target.role === MEMBER_ROLE.OWNER) {
      throw new ForbiddenError("The group owner cannot be removed.");
    }

    const updated = await conversationRepository.leaveMember(groupId, memberId);
    return asGroup(updated, actorId).payload;
  },

  async leave(userId, groupId) {
    const conversation = await conversationRepository.findById(groupId);
    const { member } = asGroup(conversation, userId);

    if (member.role === MEMBER_ROLE.OWNER) {
      const successor = (conversation.members || []).find(
        (candidate) =>
          !candidate.leftAt &&
          memberUserId(candidate) !== userId,
      );
      if (successor) {
        await conversationRepository.promoteToOwner(
          groupId,
          memberUserId(successor),
        );
      }
    }

    await conversationRepository.leaveMember(groupId, userId);
    return { message: "Left the group." };
  },
};
