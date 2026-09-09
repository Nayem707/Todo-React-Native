import { mapDirectoryUser } from "./mapDirectoryUser";
import {
  API_FRIENDSHIP_STATUSES,
  type ApiFriendshipStatus,
  type FriendRequestRecord,
  type FriendshipRecord,
} from "./friendsTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isApiFriendshipStatus(value: unknown): value is ApiFriendshipStatus {
  return (
    typeof value === "string" &&
    (API_FRIENDSHIP_STATUSES as readonly string[]).includes(value)
  );
}

export function mapFriendshipStatus(value: unknown): FriendshipRecord {
  const raw = isRecord(value) ? value : {};
  const status = isApiFriendshipStatus(raw.status) ? raw.status : "NONE";
  const requestId =
    typeof raw.requestId === "string"
      ? raw.requestId
      : typeof raw.id === "string" && status !== "NONE"
        ? raw.id
        : null;

  return {
    status,
    requestId,
    isRequester: raw.isRequester === true,
  };
}

export function mapFriendRequest(
  value: unknown,
  currentUserId?: string,
): FriendRequestRecord | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  const requester = mapDirectoryUser(value.requester);
  const recipient = mapDirectoryUser(value.recipient);
  const status = isApiFriendshipStatus(value.status) ? value.status : "PENDING";
  const isRequester =
    typeof value.isRequester === "boolean" ? value.isRequester : false;

  let peer = requester ?? recipient ?? null;

  if (currentUserId) {
    if (requester && requester.id !== currentUserId) {
      peer = requester;
    } else if (recipient && recipient.id !== currentUserId) {
      peer = recipient;
    }
  } else if (isRequester && recipient) {
    peer = recipient;
  } else if (!isRequester && requester) {
    peer = requester;
  }

  return {
    requestId: value.id,
    status,
    isRequester,
    peer,
  };
}

export function mapFriendRequests(
  value: unknown,
  currentUserId?: string,
): FriendRequestRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => mapFriendRequest(item, currentUserId))
    .filter((item): item is FriendRequestRecord => item !== null);
}
