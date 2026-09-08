import type { DirectoryUser } from "../../features/users/usersTypes";

export const API_FRIENDSHIP_STATUSES = [
  "NONE",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
] as const;

export type ApiFriendshipStatus = (typeof API_FRIENDSHIP_STATUSES)[number];

export type FriendshipRecord = {
  status: ApiFriendshipStatus;
  requestId: string | null;
  isRequester: boolean;
};

export type FriendRequestRecord = {
  requestId: string;
  status: ApiFriendshipStatus;
  isRequester: boolean;
  peer: DirectoryUser | null;
};

export type FriendGraph = {
  friends: DirectoryUser[];
  incoming: FriendRequestRecord[];
  sent: FriendRequestRecord[];
};
