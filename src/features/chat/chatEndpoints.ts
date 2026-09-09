export const chatEndpoints = {
  conversations: "/conversations",
  conversation: (conversationId: string) =>
    `/conversations/${encodeURIComponent(conversationId)}`,
  messages: (conversationId: string, page = 1, limit = 50) =>
    `/conversations/${encodeURIComponent(conversationId)}/messages?page=${page}&limit=${limit}`,
  sendMessage: (conversationId: string) =>
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
} as const;
