import { MessageModel } from "./message.model.js";

export const messageRepository = {
  async countByConversation(conversationId) {
    return MessageModel.countDocuments({
      conversation: conversationId,
      deletedAt: null,
    });
  },

  async listByConversation({ conversationId, page = 1, limit = 20 }) {
    const skip = (Number(page) - 1) * Number(limit);
    return MessageModel.find({
      conversation: conversationId,
      deletedAt: null,
    })
      .populate("sender")
      .populate("reads.user")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
  },

  async create({
    conversationId,
    senderId,
    content,
    type = "TEXT",
    status = "SENT",
    attachmentUrl,
    attachmentName,
    attachmentSize,
    attachmentMime,
  }) {
    const message = await MessageModel.create({
      conversation: conversationId,
      sender: senderId,
      content: content || "",
      type,
      status,
      reads: [{ user: senderId, readAt: new Date() }],
      ...(attachmentUrl && {
        attachmentUrl,
        attachmentName,
        attachmentSize,
        attachmentMime,
      }),
    });

    const withSender = await message.populate("sender");
    const populated = await withSender.populate("reads.user");
    return populated.toObject ? populated.toObject() : populated;
  },

  async findById(id) {
    return MessageModel.findById(id).lean();
  },

  async updateById(id, updates) {
    return MessageModel.findByIdAndUpdate(id, updates, { new: true })
      .populate("sender")
      .populate("reads.user")
      .lean();
  },
};
