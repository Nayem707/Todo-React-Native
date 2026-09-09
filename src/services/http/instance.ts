import axios, { AxiosHeaders } from "axios";

import { getApiBaseUrl } from "../../constants/env";
import { authEndpoints } from "../../features/auth/authEndpoints";
import { AuthError } from "../../features/auth/errors";
import { mapAuthUser } from "../../features/auth/mapUser";
import { loadSession, updateSession } from "../../features/auth/sessionStorage";
import { isRecord, mapHttpError, toApiError } from "./errors";
import type { ApiEnvelope } from "./types";
import { joinApiUrl } from "./url";

export const HTTP_TIMEOUT_MS = 15_000;

type RefreshPayload = {
  accessToken: string;
  refreshToken: string;
  user?: unknown;
};

let refreshInFlight: Promise<void> | null = null;

export const axiosInstance = axios.create({
  adapter: "fetch",
  timeout: HTTP_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

function isRefreshRequest(url?: string) {
  return Boolean(url?.includes(authEndpoints.refresh));
}

async function resolveBaseUrl() {
  try {
    return getApiBaseUrl();
  } catch (error) {
    throw new AuthError(
      error instanceof Error ? error.message : "API URL is not configured.",
    );
  }
}

async function rotateTokens() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const session = await loadSession();

      if (!session?.refreshToken) {
        throw new AuthError(
          "Authentication required.",
          "AUTH_UNAUTHENTICATED",
        );
      }

      const { data } = await axiosInstance.request<RefreshPayload>({
        url: joinApiUrl(authEndpoints.refresh),
        method: "POST",
        data: { refreshToken: session.refreshToken },
        withAuth: false,
        retryOnExpired: false,
      });

      await updateSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user ? mapAuthUser(data.user) : session.user,
      });
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  await refreshInFlight;
}

axiosInstance.interceptors.request.use(async (config) => {
  if (!/^https?:\/\//i.test(config.url ?? "")) {
    config.baseURL = await resolveBaseUrl();
  }

  const headers = AxiosHeaders.from(config.headers ?? {});
  config.headers = headers;

  if (config.data !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (config.withAuth) {
    const session = await loadSession();

    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope;

    if (isRecord(payload) && payload.success === false) {
      throw toApiError(payload, response.status);
    }

    if (!isRecord(payload) || !("data" in payload)) {
      throw new AuthError("Invalid server response.");
    }

    response.data = payload.data;
    return response;
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config || !error.response) {
      throw mapHttpError(error);
    }

    const { config, response } = error;
    const payload = isRecord(response.data)
      ? (response.data as ApiEnvelope)
      : {};

    const canRefresh =
      config.withAuth !== false &&
      config.retryOnExpired !== false &&
      !isRefreshRequest(config.url) &&
      response.status === 401 &&
      payload.code === "AUTH_TOKEN_EXPIRED";

    if (canRefresh) {
      await rotateTokens();
      return axiosInstance.request({
        ...config,
        retryOnExpired: false,
      });
    }

    throw toApiError(payload, response.status);
  },
);
