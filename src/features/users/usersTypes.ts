export type FriendRequestStatus =
  | "none"
  | "request_sent"
  | "request_received"
  | "friends";

export type DirectoryUser = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  isOnline: boolean;
};

export type Person = DirectoryUser & {
  status: FriendRequestStatus;
};
