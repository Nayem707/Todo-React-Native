import { getApiBaseUrl } from "../../constants/env";
import { AuthError } from "../../features/auth/errors";

export function joinApiUrl(path: string): string {
  const trimmed = path.trim();

  if (!trimmed || trimmed === "/") {
    throw new AuthError("API path is missing.");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const base = getApiBaseUrl().replace(/\/+$/, "");
  const suffix = trimmed.replace(/^\/+/, "");
  return `${base}/${suffix}`;
}
