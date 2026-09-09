import { AuthError } from "../../features/auth/errors";
import { mapHttpError } from "./errors";
import { axiosInstance } from "./instance";
import type { ApiRequestOptions } from "./types";
import { joinApiUrl } from "./url";

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = false,
    retryOnExpired = true,
  } = options;

  try {
    const response = await axiosInstance.request<T>({
      url: joinApiUrl(path),
      method,
      data: body,
      withAuth: auth,
      retryOnExpired,
    });

    return response.data;
  } catch (error) {
    throw error instanceof AuthError ? error : mapHttpError(error);
  }
}

export const apiClient = {
  request,
};
