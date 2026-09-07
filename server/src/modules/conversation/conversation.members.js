import { toId } from "../../utils/ids.js";
import { MEMBER_ROLE } from "../../constants/index.js";
import { ForbiddenError, NotFoundError } from "../../errors/AppError.js";

export const MANAGER_ROLES = [MEMBER_ROLE.OWNER, MEMBER_ROLE.ADMIN];

export const memberUserId = (member) =>
  toId(member?.user) ?? member?.userId ?? null;

export const findActiveMember = (conversation, userId) =>
  (conversation?.members || []).find(
    (member) => memberUserId(member) === userId && !member.leftAt,
  );

export const assertMembership = (
  conversation,
  userId,
  notFoundMessage = "Conversation not found.",
) => {
  if (!conversation) throw new NotFoundError(notFoundMessage);
  const member = findActiveMember(conversation, userId);
  if (!member) throw new NotFoundError(notFoundMessage);
  return member;
};

export const assertRole = (
  member,
  roles,
  message = "You do not have permission to perform this action.",
) => {
  if (!roles.includes(member.role)) throw new ForbiddenError(message);
  return member;
};
