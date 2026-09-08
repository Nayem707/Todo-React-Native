import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Conversation } from "./types";

type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
};

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
  },
});

export const { setActiveConversation } = chatSlice.actions;
export default chatSlice.reducer;
