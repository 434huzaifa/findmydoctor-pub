import "server-only";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "@/server/config/env";

export type TokenPayload = {
  id: number;
  email: string;
  role: "doctor" | "admin";
  doctorId: number | null;
};

export type DecodedToken = TokenPayload & { jti: string; exp: number; iat: number };

export const signAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    jwtid: crypto.randomUUID(),
  });

export const signRefreshToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    jwtid: crypto.randomUUID(),
  });

export const verifyAccessToken = (token: string): DecodedToken =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;

export const verifyRefreshToken = (token: string): DecodedToken =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedToken;
