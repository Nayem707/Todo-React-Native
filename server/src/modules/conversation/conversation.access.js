import { asyncHandler } from "../../utils/asyncHandler.js";
import { NotFoundError } from "../../errors/AppError.js";
import { conversationRepository } from "./conversation.repository.js";
import {
  MANAGER_ROLES,
  assertMembership,
  assertRole,
} from "./conversation.members.js";

export {
  MANAGER_ROLES,
  assertMembership,
  assertRole,
  findActiveMember,
  memberUserId,
} from "./conversation.members.js";

const loadConversation = async (id, userId, notFoundMessage) => {
  const conversation = await conversationRepository.findById(id);
  const member = assertMembership(conversation, userId, notFoundMessage);
  return { conversation, member };
};

export const requireConversationMember = asyncHandler(async (req, _res, next) => {
  const loaded = await loadConversation(req.params.id, req.user.id);
  req.conversation = loaded.conversation;
  req.member = loaded.member;
  next();
});

export const requireGroupMember = asyncHandler(async (req, _res, next) => {
  const loaded = await loadConversation(
    req.params.id,
    req.user.id,
    "Group not found.",
  );
  if (loaded.conversation.type !== "GROUP") {
    throw new NotFoundError("Group not found.");
  }
  req.conversation = loaded.conversation;
  req.member = loaded.member;
  next();
});

export const requireGroupManager = asyncHandler(async (req, _res, next) => {
  const loaded = await loadConversation(
    req.params.id,
    req.user.id,
    "Group not found.",
  );
  if (loaded.conversation.type !== "GROUP") {
    throw new NotFoundError("Group not found.");
  }
  assertRole(loaded.member, MANAGER_ROLES);
  req.conversation = loaded.conversation;
  req.member = loaded.member;
  next();
});
