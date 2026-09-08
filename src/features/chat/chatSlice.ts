import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { conversationsApi } from "../../services/conversations";
import { messagesApi } from "../../services/messages";
import { toAuthErrorMessage } from "../../services/auth/errors";
import { login, logout, register } from "../../store/slices/authSlice";
import type {
  ChatMessage,
  Conversation,
  LoadStatus,
} from "./chatTypes";

type ChatState = {
  conversations: Record<string, Conversation>;
  conversationIds: string[];
  messages: Record<string, ChatMessage[]>;
  presence: Record<string, boolean>;
  typing: Record<string, string[]>;
  activeConversationId: string | null;
  listStatus: LoadStatus;
  listError: string | null;
  isRefreshing: boolean;
  messagesStatus: Record<string, LoadStatus>;
  messagesError: Record<string, string | null>;
  sendPending: Record<string, boolean>;
};

function getInitialState(): ChatState {
  return {
    conversations: {},
    conversationIds: [],
    messages: {},
    presence: {},
    typing: {},
    activeConversationId: null,
    listStatus: "idle",
    listError: null,
    isRefreshing: false,
    messagesStatus: {},
    messagesError: {},
    sendPending: {},
  };
}

function upsertConversation(state: ChatState, conversation: Conversation) {
  state.conversations[conversation.id] = {
    ...state.conversations[conversation.id],
    ...conversation,
  };

  if (!state.conversationIds.includes(conversation.id)) {
    state.conversationIds.unshift(conversation.id);
  }
}

function sortConversationIds(state: ChatState) {
  state.conversationIds.sort((left, right) => {
    const a = state.conversations[left]?.lastMessageAt ?? "";
    const b = state.conversations[right]?.lastMessageAt ?? "";
    return b.localeCompare(a);
  });
}

function upsertMessage(state: ChatState, message: ChatMessage) {
  const existing = state.messages[message.conversationId] ?? [];
  const index = existing.findIndex((item) => item.id === message.id);
  const next =
    index === -1
      ? [...existing, message]
      : existing.map((item) => (item.id === message.id ? { ...item, ...message } : item));

  next.sort((left, right) =>
    (left.createdAt ?? "").localeCompare(right.createdAt ?? ""),
  );
  state.messages[message.conversationId] = next;

  const conversation = state.conversations[message.conversationId];
  const preview = {
    lastMessage: message,
    lastMessageAt: message.createdAt ?? conversation?.lastMessageAt ?? null,
  };

  if (conversation) {
    const isActive = state.activeConversationId === message.conversationId;
    const alreadyCounted = index !== -1;
    state.conversations[message.conversationId] = {
      ...conversation,
      ...preview,
      unreadCount:
        isActive || alreadyCounted
          ? conversation.unreadCount
          : conversation.unreadCount + 1,
    };
  } else {
    state.conversations[message.conversationId] = {
      id: message.conversationId,
      name: message.senderName ?? "Chat",
      avatar: null,
      members: [message.senderId],
      membersMeta: [],
      unreadCount: state.activeConversationId === message.conversationId ? 0 : 1,
      lastMessage: message,
      lastMessageAt: message.createdAt ?? null,
    };
    if (!state.conversationIds.includes(message.conversationId)) {
      state.conversationIds.unshift(message.conversationId);
    }
  }

  sortConversationIds(state);
}

export const fetchConversations = createAsyncThunk<
  Conversation[],
  { silent?: boolean } | void,
  { rejectValue: string }
>("chat/fetchConversations", async (_arg, { rejectWithValue }) => {
  try {
    return await conversationsApi.list();
  } catch (error) {
    return rejectWithValue(
      toAuthErrorMessage(error, "Unable to load conversations."),
    );
  }
});

export const fetchConversation = createAsyncThunk<
  Conversation,
  string,
  { rejectValue: string }
>("chat/fetchConversation", async (conversationId, { rejectWithValue }) => {
  try {
    return await conversationsApi.get(conversationId);
  } catch (error) {
    return rejectWithValue(
      toAuthErrorMessage(error, "Unable to load conversation."),
    );
  }
});

export const openDirectConversation = createAsyncThunk<
  Conversation,
  string,
  { rejectValue: string }
>("chat/openDirectConversation", async (userId, { rejectWithValue }) => {
  try {
    return await conversationsApi.createDirect(userId);
  } catch (error) {
    return rejectWithValue(
      toAuthErrorMessage(error, "Unable to start conversation."),
    );
  }
});

export const fetchMessages = createAsyncThunk<
  { conversationId: string; page: MessagesPageLike },
  { conversationId: string; page?: number },
  { rejectValue: string }
>(
  "chat/fetchMessages",
  async ({ conversationId, page = 1 }, { rejectWithValue }) => {
    try {
      const result = await messagesApi.list(conversationId, page, 50);
      return { conversationId, page: result };
    } catch (error) {
      return rejectWithValue(
        toAuthErrorMessage(error, "Unable to load messages."),
      );
    }
  },
);

type MessagesPageLike = Awaited<ReturnType<typeof messagesApi.list>>;

export const sendMessage = createAsyncThunk<
  ChatMessage,
  { conversationId: string; content: string },
  { rejectValue: string }
>(
  "chat/sendMessage",
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      return await messagesApi.send(conversationId, content);
    } catch (error) {
      return rejectWithValue(
        toAuthErrorMessage(error, "Unable to send message."),
      );
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState: getInitialState(),
  reducers: {
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
      if (action.payload && state.conversations[action.payload]) {
        state.conversations[action.payload].unreadCount = 0;
      }
    },
    messageReceived(state, action: PayloadAction<ChatMessage>) {
      upsertMessage(state, action.payload);
    },
    messageEdited(
      state,
      action: PayloadAction<{ id: string; content: string; editedAt?: string }>,
    ) {
      for (const conversationId of Object.keys(state.messages)) {
        state.messages[conversationId] = state.messages[conversationId].map(
          (message) =>
            message.id === action.payload.id
              ? {
                  ...message,
                  content: action.payload.content,
                  editedAt: action.payload.editedAt ?? message.editedAt,
                }
              : message,
        );
      }
    },
    messageDeleted(
      state,
      action: PayloadAction<{ id?: string; conversationId?: string }>,
    ) {
      const { id, conversationId } = action.payload;
      if (!id) {
        return;
      }

      const targets = conversationId
        ? [conversationId]
        : Object.keys(state.messages);

      for (const target of targets) {
        state.messages[target] = (state.messages[target] ?? []).filter(
          (message) => message.id !== id,
        );
      }
    },
    typingUpdated(
      state,
      action: PayloadAction<{
        conversationId: string;
        userId?: string;
        isTyping: boolean;
      }>,
    ) {
      const { conversationId, userId, isTyping } = action.payload;
      if (!userId) {
        return;
      }

      const current = state.typing[conversationId] ?? [];
      if (isTyping) {
        state.typing[conversationId] = current.includes(userId)
          ? current
          : [...current, userId];
        return;
      }

      state.typing[conversationId] = current.filter((id) => id !== userId);
    },
    presenceUpdated(
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean }>,
    ) {
      state.presence[action.payload.userId] = action.payload.isOnline;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchConversations.pending, (state, action) => {
        state.listError = null;
        const silent =
          typeof action.meta.arg === "object" &&
          action.meta.arg?.silent === true;
        if (silent || state.conversationIds.length > 0) {
          state.isRefreshing = true;
        } else {
          state.listStatus = "loading";
        }
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.isRefreshing = false;
        state.conversations = {};
        state.conversationIds = [];
        for (const conversation of action.payload) {
          upsertConversation(state, conversation);
        }
        sortConversationIds(state);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isRefreshing = false;
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "Unable to load conversations.";
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        upsertConversation(state, action.payload);
        sortConversationIds(state);
      })
      .addCase(openDirectConversation.fulfilled, (state, action) => {
        upsertConversation(state, action.payload);
        sortConversationIds(state);
      })
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.messagesStatus[conversationId] = "loading";
        state.messagesError[conversationId] = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, page } = action.payload;
        state.messagesStatus[conversationId] = "succeeded";
        const incoming = page.items;
        const existing = state.messages[conversationId] ?? [];
        const byId = new Map(existing.map((item) => [item.id, item]));
        for (const message of incoming) {
          byId.set(message.id, { ...byId.get(message.id), ...message });
        }
        state.messages[conversationId] = [...byId.values()].sort((left, right) =>
          (left.createdAt ?? "").localeCompare(right.createdAt ?? ""),
        );
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.messagesStatus[conversationId] = "failed";
        state.messagesError[conversationId] =
          action.payload ?? "Unable to load messages.";
      })
      .addCase(sendMessage.pending, (state, action) => {
        state.sendPending[action.meta.arg.conversationId] = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendPending[action.payload.conversationId] = false;
        upsertMessage(state, action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendPending[action.meta.arg.conversationId] = false;
        state.messagesError[action.meta.arg.conversationId] =
          action.payload ?? "Unable to send message.";
      })
      .addCase(login.fulfilled, getInitialState)
      .addCase(register.fulfilled, getInitialState)
      .addCase(logout.fulfilled, getInitialState)
      .addCase(logout.rejected, getInitialState);
  },
});

export const {
  setActiveConversation,
  messageReceived,
  messageEdited,
  messageDeleted,
  typingUpdated,
  presenceUpdated,
} = chatSlice.actions;

export default chatSlice.reducer;
