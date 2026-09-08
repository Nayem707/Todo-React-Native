export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function toAuthErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
