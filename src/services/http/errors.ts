import axios from "axios";

import { AuthError } from "../../features/auth/errors";
import type { ApiEnvelope } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function toApiError(
  payload: ApiEnvelope,
  status = 0,
): AuthError {
  const message =
    payload.message ||
    (status === 401 ? "Authentication required." : "Request failed.");

  return new AuthError(message, payload.code, payload.details);
}

export function mapHttpError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const message = error.message?.trim();

      if (
        !message ||
        message === "Network Error" ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED"
      ) {
        return new AuthError("Unable to reach the server.");
      }

      return new AuthError(message);
    }

    const payload = isRecord(error.response.data)
      ? (error.response.data as ApiEnvelope)
      : {};

    return toApiError(payload, error.response.status);
  }

  if (error instanceof Error && error.message) {
    return new AuthError(error.message);
  }

  return new AuthError("Request failed.");
}
