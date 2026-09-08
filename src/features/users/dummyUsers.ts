import type { DirectoryUser, FriendRequestStatus } from "./usersTypes";

/**
 * Local directory only. Replace this module with API user results later.
 */
export const dummyUsers: DirectoryUser[] = [
  {
    id: "user-alex",
    name: "Alex Johnson",
    username: "alexj",
    avatar: null,
    isOnline: true,
  },
  {
    id: "user-sarah",
    name: "Sarah Wilson",
    username: "sarahw",
    avatar: null,
    isOnline: true,
  },
  {
    id: "user-michael",
    name: "Michael Brown",
    username: "mikeb",
    avatar: null,
    isOnline: false,
  },
  {
    id: "user-emma",
    name: "Emma Davis",
    username: "emmad",
    avatar: null,
    isOnline: true,
  },
  {
    id: "user-daniel",
    name: "Daniel Smith",
    username: "dansmith",
    avatar: null,
    isOnline: false,
  },
  {
    id: "user-olivia",
    name: "Olivia Martin",
    username: "oliviam",
    avatar: null,
    isOnline: true,
  },
];

/** Seeded incoming requests so Confirm / Decline can be exercised locally. */
export const dummyIncomingRequestIds: string[] = [
  "user-sarah",
  "user-michael",
];

export function getInitialRelationships(): Record<string, FriendRequestStatus> {
  return Object.fromEntries(
    dummyUsers.map((user) => [
      user.id,
      dummyIncomingRequestIds.includes(user.id)
        ? "request_received"
        : "none",
    ]),
  );
}
