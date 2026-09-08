import { configureStore } from "@reduxjs/toolkit";

import usersReducer from "../features/users/usersSlice";
import { appReducer, authReducer } from "./slices";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
