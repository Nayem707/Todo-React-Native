export const MIN_USER_SEARCH_LENGTH = 2;

export type FriendRequestStatus =
  | "none"
  | "request_sent"
  | "request_received"
  | "friends";

export type DirectoryUser = {
  id: string;
  name: string;
  email?: string;
  username?: string;
  bio?: string;
  avatar: string | null;
  coverUrl?: string | null;
  presence?: string;
  isOnline: boolean;
};

export type Person = DirectoryUser & {
  status: FriendRequestStatus;
  requestId: string | null;
};

export type FriendActionArg = {
  userId: string;
  requestId?: string | null;
};

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";
