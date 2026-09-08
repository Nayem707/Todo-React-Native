export function getApiBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!value) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and restart Expo.",
    );
  }

  return value.replace(/\/$/, "");
}

export function getSocketUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_SOCKET_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  return getApiBaseUrl().replace(/\/api$/i, "");
}
