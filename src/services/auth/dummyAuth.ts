import { AuthError } from "./errors";
import type {
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from "../../features/auth/authTypes";

const DUMMY_EMAIL = "demo@example.com";
const DUMMY_PASSWORD = "123456";

const dummyUser: AuthUser = {
  id: "user-demo",
  name: "Demo User",
  email: DUMMY_EMAIL,
};

export const dummyAuthHint = `Demo: ${DUMMY_EMAIL} / ${DUMMY_PASSWORD}`;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function dummySignIn({
  email,
  password,
}: LoginCredentials): Promise<AuthUser> {
  if (!email.trim() || !password) {
    throw new AuthError("Enter your email and password.");
  }

  if (
    normalizeEmail(email) !== dummyUser.email ||
    password !== DUMMY_PASSWORD
  ) {
    throw new AuthError("Invalid email or password.");
  }

  return dummyUser;
}

export async function dummySignUp({
  name,
  email,
  password,
}: RegisterPayload): Promise<AuthUser> {
  if (!name.trim() || !email.trim() || !password) {
    throw new AuthError("Enter your name, email, and password.");
  }

  if (!email.includes("@")) {
    throw new AuthError("Enter a valid email address.");
  }

  if (password.length < 6) {
    throw new AuthError("Password must be at least 6 characters.");
  }

  return {
    id: `local-${Date.now()}`,
    name: name.trim(),
    email: normalizeEmail(email),
  };
}
