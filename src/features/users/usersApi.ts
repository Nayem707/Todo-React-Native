import { apiClient } from "../../services/http";
import { mapDirectoryUsers } from "./mapDirectoryUser";
import { usersEndpoints } from "./usersEndpoints";
import type { DirectoryUser } from "./usersTypes";

export const usersApi = {
  async search(query: string): Promise<DirectoryUser[]> {
    const data = await apiClient.request<unknown>(
      usersEndpoints.search(query),
      {
        method: "GET",
        auth: true,
      },
    );

    return mapDirectoryUsers(data);
  },
};
