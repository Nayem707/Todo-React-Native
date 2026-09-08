import type {
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from "../../features/auth/authTypes";
import { dummyAuthHint, dummySignIn, dummySignUp } from "./dummyAuth";
import { clearSession, loadSession, saveSession } from "./sessionStorage";

/**
 * Swap dummySignIn / dummySignUp for API calls later.
 * Persistence stays in this module so screens and Redux do not change.
 */
export const authService = {
  getDemoHint(): string | null {
    return dummyAuthHint;
  },

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const user = await dummySignIn(credentials);
    await saveSession(user);
    return user;
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const user = await dummySignUp(payload);
    await saveSession(user);
    return user;
  },

  async logout(): Promise<void> {
    await clearSession();
  },

  async restoreSession(): Promise<AuthUser | null> {
    return loadSession();
  },
};
