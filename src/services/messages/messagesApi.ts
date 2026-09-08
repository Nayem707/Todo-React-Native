import { apiClient } from "../http/client";
import { mapChatMessage, mapMessagesPage } from "../../features/chat/chatMappers";
import type { ChatMessage, MessagesPage } from "../../features/chat/chatTypes";
import { AuthError } from "../auth/errors";

export const messagesApi = {
  async list(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<MessagesPage> {
    const data = await apiClient.request<unknown>(
      `/conversations/${encodeURIComponent(conversationId)}/messages?page=${page}&limit=${limit}`,
      { method: "GET", auth: true },
    );

    return mapMessagesPage(data);
  },

  async send(conversationId: string, content: string): Promise<ChatMessage> {
    const data = await apiClient.request<unknown>(
      `/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        auth: true,
        body: { content },
      },
    );
    const message = mapChatMessage(data);

    if (!message) {
      throw new AuthError("Invalid message response.");
    }

    return message;
  },
};
