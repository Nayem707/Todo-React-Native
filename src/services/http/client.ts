import { getApiBaseUrl } from "../../constants/env";
import type { AuthApiErrorDetail } from "../../features/auth/authTypes";
import { AuthError } from "../auth/errors";
import { mapAuthUser } from "../auth/mapUser";
import { loadSession, updateSession } from "../auth/sessionStorage";
import type { HttpMethod } from "../index";

type ApiFailure = {
  success?: boolean;
  message?: string;
  code?: string;
  details?: AuthApiErrorDetail[];
};

type RefreshPayload = {
  accessToken: string;
  refreshToken: string;
  user?: unknown;
};

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  retryOnExpired?: boolean;
};

let refreshInFlight: Promise<void> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function toAuthError(payload: ApiFailure, status: number): AuthError {
  const message =
    payload.message ||
    (status === 401
      ? "Authentication required."
      : "Request failed.");

  return new AuthError(message, payload.code, payload.details);
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new AuthError("Unable to reach the server.");
  }
}

async function rotateTokens(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const session = await loadSession();

      if (!session?.refreshToken) {
        throw new AuthError(
          "Authentication required.",
          "AUTH_UNAUTHENTICATED",
        );
      }

      const data = await sendRequest<RefreshPayload>("/auth/refresh", {
        method: "POST",
        body: { refreshToken: session.refreshToken },
        auth: false,
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

async function sendRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = false,
    retryOnExpired = true,
  } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const session = await loadSession();
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }

  let response: Response;

  let baseUrl: string;

  try {
    baseUrl = getApiBaseUrl();
  } catch (error) {
    throw new AuthError(
      error instanceof Error ? error.message : "API URL is not configured.",
    );
  }

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AuthError("Unable to reach the server.");
  }

  const payload = await parseJson(response);

  if (
    auth &&
    retryOnExpired &&
    response.status === 401 &&
    isRecord(payload) &&
    payload.code === "AUTH_TOKEN_EXPIRED"
  ) {
    await rotateTokens();
    return sendRequest<T>(path, { ...options, retryOnExpired: false });
  }

  if (!response.ok || (isRecord(payload) && payload.success === false)) {
    const failure = isRecord(payload) ? (payload as ApiFailure) : {};
    throw toAuthError(failure, response.status);
  }

  if (!isRecord(payload) || !("data" in payload)) {
    throw new AuthError("Invalid server response.");
  }

  return payload.data as T;
}

export const apiClient = {
  request: sendRequest,
};
