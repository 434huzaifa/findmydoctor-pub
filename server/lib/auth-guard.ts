import "server-only";
import { NextRequest } from "next/server";
import type { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { verifyAccessToken, type TokenPayload } from "@/server/lib/jwt";
import { AppError } from "@/server/lib/app-error";

export function getAuthUser(req: NextRequest): TokenPayload {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Missing bearer token", 401, "UNAUTHORIZED");
  }
  const token = authHeader.slice(7);
  try {
    return verifyAccessToken(token);
  } catch (error) {
    const jwtError = error as Partial<TokenExpiredError & JsonWebTokenError>;
    if (jwtError?.name === "TokenExpiredError") {
      throw new AppError("Session expired. Please sign in again", 401, "TOKEN_EXPIRED");
    }
    if (jwtError?.name === "JsonWebTokenError") {
      throw new AppError("Invalid token", 401, "UNAUTHORIZED");
    }
    throw error;
  }
}

export function requireRole(
  user: TokenPayload,
  role: "admin" | "doctor"
): void {
  if (user.role !== role) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
}
