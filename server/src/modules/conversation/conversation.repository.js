import { ConversationModel } from "./conversation.model.js";
import { memberUserId } from "./conversation.members.js";

const populate = (query) =>
  query.populate("members.user").populate("createdBy");

export const conversationRepository = {
  async findById(id) {
    try {
      return await populate(ConversationModel.findById(id)).lean();
    } catch (error) {
      if (error instanceof Error && error.name === "CastError") {
        return null;
      }
      throw error;
    }
  },

  async findByDirectKey(directKey) {
    return populate(ConversationModel.findOne({ directKey })).lean();
  },

  async listForUser(userId) {
    return populate(
      ConversationModel.find({
        members: {
          $elemMatch: {
            user: userId,
            $or: [{ leftAt: null }, { leftAt: { $exists: false } }],
          },
        },
      }),
    )
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();
  },

  async createDirect({ userId, otherUserId, directKey }) {
    const created = await ConversationModel.create({
      type: "DIRECT",
      directKey,
      createdBy: userId,
      members: [
        { user: userId, role: "OWNER" },
        { user: otherUserId, role: "MEMBER" },
      ],
    });
    return conversationRepository.findById(created._id);
  },

  async createGroup({ userId, name, description, memberIds }) {
    const created = await ConversationModel.create({
      type: "GROUP",
      name,
      description,
      createdBy: userId,
      members: [
        { user: userId, role: "OWNER" },
        ...memberIds.map((memberId) => ({ user: memberId, role: "MEMBER" })),
      ],
    });
    return conversationRepository.findById(created._id);
  },

  async updateById(id, updates) {
    await ConversationModel.findByIdAndUpdate(id, updates, { new: true });
    return conversationRepository.findById(id);
  },

  async addMembers(conversationId, memberIds) {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) return null;

    const toRejoin = [];
    const toInsert = [];

    for (const memberId of memberIds) {
      const existing = (conversation.members || []).find(
        (member) => memberUserId(member) === memberId,
      );
      if (!existing) {
        toInsert.push({ user: memberId, role: "MEMBER", joinedAt: new Date() });
      } else if (existing.leftAt) {
        toRejoin.push(memberId);
      }
    }

    if (toRejoin.length) {
      await ConversationModel.updateOne(
        { _id: conversationId },
        { $unset: { "members.$[m].leftAt": "" } },
        { arrayFilters: [{ "m.user": { $in: toRejoin } }] },
      );
    }

    if (toInsert.length) {
      await ConversationModel.updateOne(
        { _id: conversationId },
        { $push: { members: { $each: toInsert } } },
      );
    }

    return conversationRepository.findById(conversationId);
  },

  async leaveMember(conversationId, memberId) {
    await ConversationModel.updateOne(
      { _id: conversationId, "members.user": memberId },
      { $set: { "members.$.leftAt": new Date() } },
    );
    return conversationRepository.findById(conversationId);
  },

  async promoteToOwner(conversationId, memberId) {
    await ConversationModel.updateOne(
      { _id: conversationId, "members.user": memberId },
      { $set: { "members.$.role": "OWNER" } },
    );
    return conversationRepository.findById(conversationId);
  },
};
