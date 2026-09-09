import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { login, logout, register } from "../auth/authSlice";
import { toAuthErrorMessage } from "../auth/errors";
import { friendsApi } from "./friendsApi";
import type {
  FriendGraph,
  FriendRequestRecord,
  FriendshipRecord,
} from "./friendsTypes";
import { usersApi } from "./usersApi";
import {
  MIN_USER_SEARCH_LENGTH,
  type DirectoryUser,
  type FriendActionArg,
  type LoadStatus,
} from "./usersTypes";

type UsersState = {
  entities: Record<string, DirectoryUser>;
  friendIds: string[];
  incoming: FriendRequestRecord[];
  sent: FriendRequestRecord[];
  statuses: Record<string, FriendshipRecord>;
  searchIds: string[];
  searchQuery: string;
  isFindPeopleOpen: boolean;
  graphStatus: LoadStatus;
  searchStatus: LoadStatus;
  isRefreshing: boolean;
  graphError: string | null;
  searchError: string | null;
  actionPendingUserId: string | null;
  actionError: string | null;
};

type SearchPayload = {
  query: string;
  users: DirectoryUser[];
  statuses: Array<{ userId: string; record: FriendshipRecord }>;
};

type FriendMutationPayload = {
  userId: string;
  record: FriendshipRecord;
};

function getInitialState(): UsersState {
  return {
    entities: {},
    friendIds: [],
    incoming: [],
    sent: [],
    statuses: {},
    searchIds: [],
    searchQuery: "",
    isFindPeopleOpen: false,
    graphStatus: "idle",
    searchStatus: "idle",
    isRefreshing: false,
    graphError: null,
    searchError: null,
    actionPendingUserId: null,
    actionError: null,
  };
}

function upsertUser(state: UsersState, user: DirectoryUser) {
  state.entities[user.id] = user;
}

function applyRecord(
  state: UsersState,
  userId: string,
  record: FriendshipRecord,
) {
  state.statuses[userId] = record;

  if (record.status === "ACCEPTED") {
    if (!state.friendIds.includes(userId)) {
      state.friendIds.push(userId);
    }
    return;
  }

  state.friendIds = state.friendIds.filter((id) => id !== userId);
}

function applyGraph(state: UsersState, graph: FriendGraph) {
  const friendIdSet = new Set(graph.friends.map((friend) => friend.id));

  for (const friend of graph.friends) {
    upsertUser(state, friend);
    state.statuses[friend.id] = {
      status: "ACCEPTED",
      requestId: state.statuses[friend.id]?.requestId ?? null,
      isRequester: false,
    };
  }

  for (const [userId, record] of Object.entries(state.statuses)) {
    if (record.status === "ACCEPTED" && !friendIdSet.has(userId)) {
      state.statuses[userId] = {
        status: "NONE",
        requestId: null,
        isRequester: false,
      };
    }
  }

  for (const request of [...graph.incoming, ...graph.sent]) {
    if (!request.peer) {
      continue;
    }

    upsertUser(state, request.peer);
    state.statuses[request.peer.id] = {
      status: request.status,
      requestId: request.requestId,
      isRequester: request.isRequester,
    };
  }

  state.friendIds = graph.friends.map((friend) => friend.id);
  state.incoming = graph.incoming;
  state.sent = graph.sent;
}

function currentUserId(getState: () => unknown): string | undefined {
  const state = getState() as { auth?: { user?: { id?: string } | null } };
  return state.auth?.user?.id;
}

export const fetchFriendGraph = createAsyncThunk<
  FriendGraph,
  { silent?: boolean } | void,
  { rejectValue: string }
>("users/fetchFriendGraph", async (_arg, { getState, rejectWithValue }) => {
  try {
    const userId = currentUserId(getState);
    const graph = await friendsApi.getGraph(userId);

    if (currentUserId(getState) !== userId) {
      return rejectWithValue("STALE");
    }

    return graph;
  } catch (error) {
    return rejectWithValue(
      toAuthErrorMessage(error, "Unable to load friends."),
    );
  }
});

export const searchDirectory = createAsyncThunk<
  SearchPayload,
  string,
  { rejectValue: string }
>(
  "users/searchDirectory",
  async (query, { rejectWithValue }) => {
    const normalized = query.trim();

    try {
      const users = await usersApi.search(normalized);
      const statuses = await Promise.all(
        users.map(async (user) => {
          try {
            return {
              userId: user.id,
              record: await friendsApi.getStatus(user.id),
            };
          } catch {
            return {
              userId: user.id,
              record: {
                status: "NONE" as const,
                requestId: null,
                isRequester: false,
              },
            };
          }
        }),
      );

      return { query: normalized, users, statuses };
    } catch (error) {
      return rejectWithValue(toAuthErrorMessage(error, "Unable to search users."));
    }
  },
  {
    condition: (query) => query.trim().length >= MIN_USER_SEARCH_LENGTH,
  },
);

export const sendFriendRequest = createAsyncThunk<
  FriendMutationPayload,
  FriendActionArg,
  { rejectValue: string }
>("users/sendFriendRequest", async ({ userId }, { dispatch, rejectWithValue }) => {
  try {
    const record = await friendsApi.sendRequest(userId);
    void dispatch(fetchFriendGraph({ silent: true }));
    return { userId, record: { ...record, isRequester: true } };
  } catch (error) {
    try {
      const record = await friendsApi.getStatus(userId);
      if (record.status === "ACCEPTED" || record.status === "PENDING") {
        void dispatch(fetchFriendGraph({ silent: true }));
        return { userId, record };
      }
    } catch {
      // Keep the original send error.
    }

    return rejectWithValue(
      toAuthErrorMessage(error, "Unable to send friend request."),
    );
  }
});

export const acceptFriendRequest = createAsyncThunk<
  FriendMutationPayload,
  FriendActionArg,
  { rejectValue: string }
>(
  "users/acceptFriendRequest",
  async ({ userId, requestId }, { dispatch, rejectWithValue }) => {
    try {
      const id = await friendsApi.resolveRequestId(userId, requestId);
      const record = await friendsApi.accept(id);
      void dispatch(fetchFriendGraph({ silent: true }));
      return {
        userId,
        record: {
          ...record,
          status: "ACCEPTED",
          isRequester: false,
        },
      };
    } catch (error) {
      return rejectWithValue(
        toAuthErrorMessage(error, "Unable to confirm friend request."),
      );
    }
  },
);

export const declineFriendRequest = createAsyncThunk<
  FriendMutationPayload,
  FriendActionArg,
  { rejectValue: string }
>(
  "users/declineFriendRequest",
  async ({ userId, requestId }, { dispatch, rejectWithValue }) => {
    try {
      const id = await friendsApi.resolveRequestId(userId, requestId);
      const record = await friendsApi.reject(id);
      void dispatch(fetchFriendGraph({ silent: true }));
      return {
        userId,
        record: {
          ...record,
          status: "REJECTED",
          isRequester: false,
        },
      };
    } catch (error) {
      return rejectWithValue(
        toAuthErrorMessage(error, "Unable to decline friend request."),
      );
    }
  },
);

export const cancelFriendRequest = createAsyncThunk<
  FriendMutationPayload,
  FriendActionArg,
  { rejectValue: string }
>(
  "users/cancelFriendRequest",
  async ({ userId, requestId }, { dispatch, rejectWithValue }) => {
    try {
      const id = await friendsApi.resolveRequestId(userId, requestId);
      const record = await friendsApi.cancel(id);
      void dispatch(fetchFriendGraph({ silent: true }));
      return {
        userId,
        record: {
          ...record,
          status: "CANCELLED",
          isRequester: true,
        },
      };
    } catch (error) {
      return rejectWithValue(
        toAuthErrorMessage(error, "Unable to cancel friend request."),
      );
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: getInitialState(),
  reducers: {
    openFindPeople(state) {
      state.isFindPeopleOpen = true;
      state.actionError = null;
    },
    closeFindPeople(state) {
      state.isFindPeopleOpen = false;
      state.searchIds = [];
      state.searchQuery = "";
      state.searchStatus = "idle";
      state.searchError = null;
      state.actionError = null;
    },
    clearSearch(state) {
      state.searchIds = [];
      state.searchQuery = "";
      state.searchStatus = "idle";
      state.searchError = null;
    },
    clearActionError(state) {
      state.actionError = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFriendGraph.pending, (state, action) => {
        const silent = action.meta.arg?.silent === true;
        state.graphError = null;
        if (silent || state.friendIds.length > 0 || state.incoming.length > 0) {
          state.isRefreshing = true;
        } else {
          state.graphStatus = "loading";
        }
      })
      .addCase(fetchFriendGraph.fulfilled, (state, action) => {
        applyGraph(state, action.payload);
        state.graphStatus = "succeeded";
        state.isRefreshing = false;
        state.graphError = null;
      })
      .addCase(fetchFriendGraph.rejected, (state, action) => {
        state.isRefreshing = false;
        if (action.payload === "STALE") {
          return;
        }

        state.graphStatus = "failed";
        state.graphError = action.payload ?? "Unable to load friends.";
      })
      .addCase(searchDirectory.pending, (state, action) => {
        state.searchStatus = "loading";
        state.searchQuery = action.meta.arg.trim();
        state.searchError = null;
      })
      .addCase(searchDirectory.fulfilled, (state, action) => {
        if (action.payload.query !== state.searchQuery) {
          return;
        }

        state.searchStatus = "succeeded";
        state.searchIds = action.payload.users.map((user) => user.id);
        for (const user of action.payload.users) {
          upsertUser(state, user);
        }
        for (const item of action.payload.statuses) {
          state.statuses[item.userId] = item.record;
        }
      })
      .addCase(searchDirectory.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.searchError = action.payload ?? "Unable to search users.";
      })
      .addCase(sendFriendRequest.pending, (state, action) => {
        state.actionPendingUserId = action.meta.arg.userId;
        state.actionError = null;
      })
      .addCase(acceptFriendRequest.pending, (state, action) => {
        state.actionPendingUserId = action.meta.arg.userId;
        state.actionError = null;
      })
      .addCase(declineFriendRequest.pending, (state, action) => {
        state.actionPendingUserId = action.meta.arg.userId;
        state.actionError = null;
      })
      .addCase(cancelFriendRequest.pending, (state, action) => {
        state.actionPendingUserId = action.meta.arg.userId;
        state.actionError = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        applyRecord(state, action.payload.userId, action.payload.record);
        state.actionPendingUserId = null;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        applyRecord(state, action.payload.userId, action.payload.record);
        state.actionPendingUserId = null;
      })
      .addCase(declineFriendRequest.fulfilled, (state, action) => {
        applyRecord(state, action.payload.userId, action.payload.record);
        state.actionPendingUserId = null;
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        applyRecord(state, action.payload.userId, action.payload.record);
        state.actionPendingUserId = null;
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.actionPendingUserId = null;
        state.actionError = action.payload ?? "Unable to send friend request.";
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.actionPendingUserId = null;
        state.actionError =
          action.payload ?? "Unable to confirm friend request.";
      })
      .addCase(declineFriendRequest.rejected, (state, action) => {
        state.actionPendingUserId = null;
        state.actionError =
          action.payload ?? "Unable to decline friend request.";
      })
      .addCase(cancelFriendRequest.rejected, (state, action) => {
        state.actionPendingUserId = null;
        state.actionError =
          action.payload ?? "Unable to cancel friend request.";
      })
      .addCase(login.fulfilled, getInitialState)
      .addCase(register.fulfilled, getInitialState)
      .addCase(logout.fulfilled, getInitialState)
      .addCase(logout.rejected, getInitialState);
  },
});

export const {
  openFindPeople,
  closeFindPeople,
  clearSearch,
  clearActionError,
} = usersSlice.actions;

export default usersSlice.reducer;
