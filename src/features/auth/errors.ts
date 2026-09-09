import type { AuthApiErrorDetail } from "./authTypes";

export class AuthError extends Error {
  code?: string;
  details?: AuthApiErrorDetail[];

  constructor(
    message: string,
    code?: string,
    details?: AuthApiErrorDetail[],
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.details = details;
  }
}

export function toAuthErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof AuthError) {
    if (error.details?.length) {
      return error.details.map((detail) => detail.message).join(" ");
    }

    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
