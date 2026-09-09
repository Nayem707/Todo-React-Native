import { getApiBaseUrl } from "../../constants/env";
import type { DirectoryUser } from "./usersTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function resolveMediaUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  try {
    const origin = new URL(getApiBaseUrl()).origin;
    return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  } catch {
    return trimmed;
  }
}

export function mapDirectoryUser(value: unknown): DirectoryUser | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  const status = typeof value.status === "string" ? value.status : undefined;
  const avatar =
    typeof value.avatar === "string" ? resolveMediaUrl(value.avatar) : null;

  return {
    id: value.id,
    name: value.name,
    email: typeof value.email === "string" ? value.email : undefined,
    username: typeof value.username === "string" ? value.username : undefined,
    bio: typeof value.bio === "string" ? value.bio : undefined,
    avatar,
    coverUrl:
      typeof value.coverUrl === "string"
        ? resolveMediaUrl(value.coverUrl)
        : undefined,
    presence: status,
    isOnline: status === "online",
  };
}

export function mapDirectoryUsers(value: unknown): DirectoryUser[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(mapDirectoryUser)
    .filter((user): user is DirectoryUser => user !== null);
}
