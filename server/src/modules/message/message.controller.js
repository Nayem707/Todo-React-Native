import { asyncHandler } from "../../utils/asyncHandler.js";
import { messageService } from "./message.service.js";
import { created, ok } from "../../utils/httpResponse.js";
import { ValidationError } from "../../errors/AppError.js";

const emitToConversation = (req, event, payload) => {
  const io = req.app.get("io");
  io?.to(`conversation:${req.params.id}`).emit(event, payload);
};

export const messageController = {
  list: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    ok(
      res,
      await messageService.list(req.params.id, page, limit, req.user.id),
    );
  }),

  create: asyncHandler(async (req, res) => {
    const payload = await messageService.create({
      conversationId: req.params.id,
      senderId: req.user.id,
      content: req.body.content,
    });
    emitToConversation(req, "new_message", { message: payload });
    created(res, payload);
  }),

  createWithAttachment: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ValidationError("No file uploaded.");
    }
    const payload = await messageService.create({
      conversationId: req.params.id,
      senderId: req.user.id,
      content: req.body?.content || "",
      attachmentUrl: `/uploads/${req.file.filename}`,
      attachmentName: req.file.originalname,
      attachmentSize: req.file.size,
      attachmentMime: req.file.mimetype,
    });
    emitToConversation(req, "new_message", { message: payload });
    created(res, payload);
  }),

  update: asyncHandler(async (req, res) => {
    const payload = await messageService.update(
      req.params.id,
      req.params.messageId,
      req.user.id,
      req.body.content,
    );
    emitToConversation(req, "message_edited", { message: payload });
    ok(res, payload);
  }),

  remove: asyncHandler(async (req, res) => {
    const payload = await messageService.delete(
      req.params.id,
      req.params.messageId,
      req.user.id,
    );
    emitToConversation(req, "message_deleted", {
      messageId: payload.id,
      conversationId: req.params.id,
    });
    ok(res, { message: "Message deleted." });
  }),
};
