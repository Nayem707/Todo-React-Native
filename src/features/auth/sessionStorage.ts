import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AuthSession, AuthUser } from "./authTypes";
import { mapAuthUser } from "./mapUser";

const SESSION_KEY = "auth.session.v2";

let memorySession: AuthSession | null = null;

function isSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as AuthSession;

  try {
    mapAuthUser(candidate.user);
  } catch {
    return false;
  }

  return (
    typeof candidate.accessToken === "string" &&
    candidate.accessToken.length > 0 &&
    typeof candidate.refreshToken === "string" &&
    candidate.refreshToken.length > 0
  );
}

export async function saveSession(session: AuthSession): Promise<void> {
  memorySession = session;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<AuthSession | null> {
  if (memorySession) {
    return memorySession;
  }

  const raw = await AsyncStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isSession(parsed)) {
      await clearSession();
      return null;
    }

    memorySession = {
      user: mapAuthUser(parsed.user),
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    };
    return memorySession;
  } catch {
    await clearSession();
    return null;
  }
}

export async function updateSession(partial: {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}): Promise<AuthSession | null> {
  const current = await loadSession();

  if (!current) {
    return null;
  }

  const next: AuthSession = {
    user: partial.user ?? current.user,
    accessToken: partial.accessToken ?? current.accessToken,
    refreshToken: partial.refreshToken ?? current.refreshToken,
  };
  await saveSession(next);
  return next;
}

export async function clearSession(): Promise<void> {
  memorySession = null;
  await AsyncStorage.removeItem(SESSION_KEY);
}
