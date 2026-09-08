import { apiClient } from "../http/client";
import {
  mapConversation,
  mapConversations,
} from "../../features/chat/chatMappers";
import type { Conversation } from "../../features/chat/chatTypes";
import { AuthError } from "../auth/errors";

export const conversationsApi = {
  async list(): Promise<Conversation[]> {
    const data = await apiClient.request<unknown>("/conversations", {
      method: "GET",
      auth: true,
    });

    return mapConversations(data);
  },

  async get(conversationId: string): Promise<Conversation> {
    const data = await apiClient.request<unknown>(
      `/conversations/${encodeURIComponent(conversationId)}`,
      { method: "GET", auth: true },
    );
    const conversation = mapConversation(data);

    if (!conversation) {
      throw new AuthError("Conversation not found.");
    }

    return conversation;
  },

  async createDirect(userId: string): Promise<Conversation> {
    const data = await apiClient.request<unknown>("/conversations", {
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
};
