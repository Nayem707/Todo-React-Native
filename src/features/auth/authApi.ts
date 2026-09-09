import { apiClient } from "../../services/http";
import type {
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from "./authTypes";
import { authEndpoints } from "./authEndpoints";
import { AuthError } from "./errors";
import { mapAuthUser } from "./mapUser";
import {
  clearSession,
  loadSession,
  saveSession,
} from "./sessionStorage";

type AuthTokensPayload = {
  accessToken: string;
  refreshToken: string;
  user: unknown;
  message?: string;
};

async function persistAuthPayload(payload: AuthTokensPayload): Promise<AuthUser> {
  const user = mapAuthUser(payload.user);

  if (!payload.accessToken || !payload.refreshToken) {
    throw new AuthError("Invalid authentication response.");
  }

  await saveSession({
    user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });

  return user;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const payload = await apiClient.request<AuthTokensPayload>(
      authEndpoints.login,
      {
        method: "POST",
        body: {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        },
      },
    );

    return persistAuthPayload(payload);
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const response = await apiClient.request<AuthTokensPayload>(
      authEndpoints.register,
      {
        method: "POST",
        body: {
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
        },
      },
    );

    return persistAuthPayload(response);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.request(authEndpoints.logout, {
        method: "POST",
        auth: true,
      });
    } catch {
      // Always clear the local session so the user can leave a broken state.
    } finally {
      await clearSession();
    }
  },

  async restoreSession(): Promise<AuthUser | null> {
    const session = await loadSession();

    if (!session) {
      return null;
    }

    try {
      const me = await apiClient.request<unknown>(authEndpoints.me, {
        method: "GET",
        auth: true,
      });
      const user = mapAuthUser(me);
      const latest = await loadSession();

      if (!latest) {
        return user;
      }

      await saveSession({
        ...latest,
        user,
      });
      return user;
    } catch {
      await clearSession();
      return null;
    }
  },
};
