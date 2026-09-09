import { apiClient } from "../../services/http";
import { AuthError } from "../auth/errors";
import { chatEndpoints } from "./chatEndpoints";
import {
  mapChatMessage,
  mapConversation,
  mapConversations,
  mapMessagesPage,
} from "./chatMappers";
import type { ChatMessage, Conversation, MessagesPage } from "./chatTypes";

export const chatApi = {
  async listConversations(): Promise<Conversation[]> {
    const data = await apiClient.request<unknown>(chatEndpoints.conversations, {
      method: "GET",
      auth: true,
    });

    return mapConversations(data);
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const data = await apiClient.request<unknown>(
      chatEndpoints.conversation(conversationId),
      { method: "GET", auth: true },
    );
    const conversation = mapConversation(data);

    if (!conversation) {
      throw new AuthError("Conversation not found.");
    }

    return conversation;
  },

  async createDirect(userId: string): Promise<Conversation> {
    const data = await apiClient.request<unknown>(chatEndpoints.conversations, {
      method: "POST",
      auth: true,
      body: { userId, type: "DIRECT" },
    });
    const conversation = mapConversation(data);

    if (!conversation) {
      throw new AuthError("Invalid conversation response.");
    }

    return conversation;
  },

  async listMessages(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<MessagesPage> {
    const data = await apiClient.request<unknown>(
      chatEndpoints.messages(conversationId, page, limit),
      { method: "GET", auth: true },
    );

    return mapMessagesPage(data);
  },

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<ChatMessage> {
    const data = await apiClient.request<unknown>(
      chatEndpoints.sendMessage(conversationId),
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
