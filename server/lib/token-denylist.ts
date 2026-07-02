import "server-only";
import { redis } from "@/server/lib/redis";

const PREFIX = "revoked:";

export async function revokeToken(jti: string, expiresInSeconds: number) {
  if (expiresInSeconds <= 0) return;
  await redis.set(`${PREFIX}${jti}`, "1", "EX", expiresInSeconds);
}

export async function isTokenRevoked(jti: string): Promise<boolean> {
  const exists = await redis.exists(`${PREFIX}${jti}`);
  return exists === 1;
}
