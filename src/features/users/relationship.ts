import type { FriendshipRecord } from "./friendsTypes";
import type { DirectoryUser, FriendRequestStatus, Person } from "./usersTypes";

export function toUiStatus(
  record: FriendshipRecord | undefined,
): FriendRequestStatus {
  if (!record) {
    return "none";
  }

  if (record.status === "ACCEPTED") {
    return "friends";
  }

  if (record.status === "PENDING") {
    return record.isRequester ? "request_sent" : "request_received";
  }

  return "none";
}

export function toPerson(
  user: DirectoryUser,
  record: FriendshipRecord | undefined,
): Person {
  return {
    ...user,
    status: toUiStatus(record),
    requestId: record?.requestId ?? null,
  };
}
