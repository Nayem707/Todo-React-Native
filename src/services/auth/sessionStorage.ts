import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AuthSession, AuthUser } from "../../features/auth/authTypes";

const SESSION_KEY = "auth.session.v1";

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as AuthUser;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string"
  );
}

export async function saveSession(user: AuthUser): Promise<void> {
  const session: AuthSession = { user };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { user?: unknown };
    return isAuthUser(parsed.user) ? parsed.user : null;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
