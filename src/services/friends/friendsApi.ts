import { AuthError } from "../auth/errors";
import { apiClient } from "../http/client";
import { mapDirectoryUsers } from "../users/mapDirectoryUser";
import { mapFriendshipStatus, mapFriendRequests } from "./mappers";
import type {
  FriendGraph,
  FriendRequestRecord,
  FriendshipRecord,
} from "./types";
import type { DirectoryUser } from "../../features/users/usersTypes";

const FRIENDS = {
  list: "/friends",
  request: "/friends/request",
  incoming: "/friends/requests/incoming",
  sent: "/friends/requests/sent",
  status: (peerUserId: string) =>
    `/friends/status/${encodeURIComponent(peerUserId)}`,
  accept: (requestId: string) =>
    `/friends/${encodeURIComponent(requestId)}/accept`,
  reject: (requestId: string) =>
    `/friends/${encodeURIComponent(requestId)}/reject`,
  cancel: (requestId: string) => `/friends/${encodeURIComponent(requestId)}`,
} as const;

export const friendsApi = {
  async listFriends(): Promise<DirectoryUser[]> {
    const data = await apiClient.request<unknown>(FRIENDS.list, {
      method: "GET",
      auth: true,
    });

    return mapDirectoryUsers(data);
  },

  async listIncoming(currentUserId?: string): Promise<FriendRequestRecord[]> {
    const data = await apiClient.request<unknown>(FRIENDS.incoming, {
      method: "GET",
      auth: true,
    });

    return mapFriendRequests(data, currentUserId);
  },

  async listSent(currentUserId?: string): Promise<FriendRequestRecord[]> {
    const data = await apiClient.request<unknown>(FRIENDS.sent, {
      method: "GET",
      auth: true,
    });

    return mapFriendRequests(data, currentUserId);
  },

  async getGraph(currentUserId?: string): Promise<FriendGraph> {
    const [friends, incoming, sent] = await Promise.all([
      friendsApi.listFriends(),
      friendsApi.listIncoming(currentUserId),
      friendsApi.listSent(currentUserId),
    ]);

    return { friends, incoming, sent };
  },

  async getStatus(peerUserId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(FRIENDS.status(peerUserId), {
      method: "GET",
      auth: true,
    });

    return mapFriendshipStatus(data);
  },

  async sendRequest(recipientId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(FRIENDS.request, {
      method: "POST",
      auth: true,
      body: { recipientId },
    });

    return mapFriendshipStatus(data);
  },

  async accept(requestId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(FRIENDS.accept(requestId), {
      method: "PATCH",
      auth: true,
    });

    return mapFriendshipStatus(data);
  },

  async reject(requestId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(FRIENDS.reject(requestId), {
      method: "PATCH",
      auth: true,
    });

    return mapFriendshipStatus(data);
  },

  async cancel(requestId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(FRIENDS.cancel(requestId), {
      method: "DELETE",
      auth: true,
    });

    return mapFriendshipStatus(data);
  },

  async resolveRequestId(
    peerUserId: string,
    requestId?: string | null,
  ): Promise<string> {
    if (requestId) {
      return requestId;
    }

    const status = await friendsApi.getStatus(peerUserId);

    if (!status.requestId) {
      throw new AuthError("No pending friend request found.");
    }

    return status.requestId;
  },
};
