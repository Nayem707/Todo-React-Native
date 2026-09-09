import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "../../store";
import type { ChatMessage, Conversation } from "./chatTypes";

const EMPTY_MESSAGES: ChatMessage[] = [];
const EMPTY_TYPING_IDS: string[] = [];

export const selectChatState = (state: RootState) => state.chat;

export const selectConversations = createSelector(
  [selectChatState],
  (chat): Conversation[] =>
    chat.conversationIds
      .map((id) => chat.conversations[id])
      .filter((item): item is Conversation => Boolean(item)),
);

export const selectConversationById = (
  state: RootState,
  conversationId: string | undefined,
) => {
  if (!conversationId) {
    return undefined;
  }

  return state.chat.conversations[conversationId];
};

export const selectMessagesByConversation = (
  state: RootState,
  conversationId: string | undefined,
) => {
  if (!conversationId) {
    return EMPTY_MESSAGES;
  }

  return state.chat.messages[conversationId] ?? EMPTY_MESSAGES;
};

export const selectConversationListStatus = (state: RootState) =>
  state.chat.listStatus;
export const selectConversationListError = (state: RootState) =>
  state.chat.listError;
export const selectConversationsRefreshing = (state: RootState) =>
  state.chat.isRefreshing;

export const selectMessagesStatus = (
  state: RootState,
  conversationId: string | undefined,
) => (conversationId ? state.chat.messagesStatus[conversationId] : "idle");

export const selectMessagesError = (
  state: RootState,
  conversationId: string | undefined,
) => (conversationId ? state.chat.messagesError[conversationId] : null);

export const selectSendPending = (
  state: RootState,
  conversationId: string | undefined,
) => Boolean(conversationId && state.chat.sendPending[conversationId]);

export const selectTypingUserIds = (
  state: RootState,
  conversationId: string | undefined,
) =>
  conversationId
    ? state.chat.typing[conversationId] ?? EMPTY_TYPING_IDS
    : EMPTY_TYPING_IDS;

export const selectUserPresence = (state: RootState, userId: string | undefined) => {
  if (!userId) {
    return undefined;
  }

  return state.chat.presence[userId];
};
