import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { logout } from "../../store/slices/authSlice";
import { dummyUsers, getInitialRelationships } from "./dummyUsers";
import type { DirectoryUser, FriendRequestStatus } from "./usersTypes";

type UsersState = {
  directory: DirectoryUser[];
  relationships: Record<string, FriendRequestStatus>;
  isFindPeopleOpen: boolean;
};

const initialState: UsersState = {
  directory: dummyUsers,
  relationships: getInitialRelationships(),
  isFindPeopleOpen: false,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    openFindPeople(state) {
      state.isFindPeopleOpen = true;
    },
    closeFindPeople(state) {
      state.isFindPeopleOpen = false;
    },
    sendFriendRequest(state, action: PayloadAction<string>) {
      const current = state.relationships[action.payload] ?? "none";
      if (current === "none") {
        state.relationships[action.payload] = "request_sent";
      }
    },
    cancelFriendRequest(state, action: PayloadAction<string>) {
      if (state.relationships[action.payload] === "request_sent") {
        state.relationships[action.payload] = "none";
      }
    },
    acceptFriendRequest(state, action: PayloadAction<string>) {
      if (state.relationships[action.payload] === "request_received") {
        state.relationships[action.payload] = "friends";
      }
    },
    declineFriendRequest(state, action: PayloadAction<string>) {
      if (state.relationships[action.payload] === "request_received") {
        state.relationships[action.payload] = "none";
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState);
  },
});

export const {
  openFindPeople,
  closeFindPeople,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} = usersSlice.actions;

export default usersSlice.reducer;
