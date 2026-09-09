import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import chatReducer from "../features/chat/chatSlice";
import usersReducer from "../features/users/usersSlice";
import appReducer from "./appSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    chat: chatReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
