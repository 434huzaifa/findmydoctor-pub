export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(message, 400, "BAD_REQUEST", details);
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "Forbidden"): AppError {
  return new AppError(message, 403, "FORBIDDEN");
}

export function notFoundError(message = "Not found"): AppError {
  return new AppError(message, 404, "NOT_FOUND");
}

export function conflict(message: string): AppError {
  return new AppError(message, 409, "CONFLICT");
}
