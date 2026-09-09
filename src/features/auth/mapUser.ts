import type { AuthUser } from "./authTypes";
import { AuthError } from "./errors";

export function mapAuthUser(value: unknown): AuthUser {
  if (!value || typeof value !== "object") {
    throw new AuthError("Invalid user payload.");
  }

  const raw = value as Record<string, unknown>;

  if (
    typeof raw.id !== "string" ||
    typeof raw.name !== "string" ||
    typeof raw.email !== "string"
  ) {
    throw new AuthError("Invalid user payload.");
  }

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    username: typeof raw.username === "string" ? raw.username : undefined,
    bio: typeof raw.bio === "string" ? raw.bio : undefined,
    avatar: typeof raw.avatar === "string" ? raw.avatar : undefined,
    coverUrl: typeof raw.coverUrl === "string" ? raw.coverUrl : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
  };
}
