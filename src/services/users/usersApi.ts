import { apiClient } from "../http/client";
import { mapDirectoryUsers } from "./mapDirectoryUser";
import type { DirectoryUser } from "../../features/users/usersTypes";

const USERS = {
  search: (query: string) =>
    `/users/search?q=${encodeURIComponent(query)}`,
} as const;

export const usersApi = {
  async search(query: string): Promise<DirectoryUser[]> {
    const data = await apiClient.request<unknown>(USERS.search(query), {
      method: "GET",
      auth: true,
    });

    return mapDirectoryUsers(data);
  },
};
