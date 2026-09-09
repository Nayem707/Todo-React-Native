import { apiClient } from "../../services/http";
import { AuthError } from "../auth/errors";
import { friendsEndpoints } from "./friendsEndpoints";
import { mapFriendshipStatus, mapFriendRequests } from "./friendsMappers";
import type {
  FriendGraph,
  FriendRequestRecord,
  FriendshipRecord,
} from "./friendsTypes";
import { mapDirectoryUsers } from "./mapDirectoryUser";
import type { DirectoryUser } from "./usersTypes";

export const friendsApi = {
  async listFriends(): Promise<DirectoryUser[]> {
    const data = await apiClient.request<unknown>(friendsEndpoints.list, {
      method: "GET",
      auth: true,
    });

    return mapDirectoryUsers(data);
  },

  async listIncoming(currentUserId?: string): Promise<FriendRequestRecord[]> {
    const data = await apiClient.request<unknown>(friendsEndpoints.incoming, {
      method: "GET",
      auth: true,
    });

    return mapFriendRequests(data, currentUserId);
  },

  async listSent(currentUserId?: string): Promise<FriendRequestRecord[]> {
    const data = await apiClient.request<unknown>(friendsEndpoints.sent, {
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
    const data = await apiClient.request<unknown>(
      friendsEndpoints.status(peerUserId),
      {
        method: "GET",
        auth: true,
      },
    );

    return mapFriendshipStatus(data);
  },

  async sendRequest(recipientId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(friendsEndpoints.request, {
      method: "POST",
      auth: true,
      body: { recipientId },
    });

    return mapFriendshipStatus(data);
  },

  async accept(requestId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(
      friendsEndpoints.accept(requestId),
      {
        method: "PATCH",
        auth: true,
      },
    );

    return mapFriendshipStatus(data);
  },

  async reject(requestId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(
      friendsEndpoints.reject(requestId),
      {
        method: "PATCH",
        auth: true,
      },
    );

    return mapFriendshipStatus(data);
  },

  async cancel(requestId: string): Promise<FriendshipRecord> {
    const data = await apiClient.request<unknown>(
      friendsEndpoints.cancel(requestId),
      {
        method: "DELETE",
        auth: true,
      },
    );

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
