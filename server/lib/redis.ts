import "server-only";
import Redis from "ioredis";
import { env } from "@/server/config/env";
import { logger } from "@/server/lib/logger";

const globalForRedis = global as unknown as { redis: Redis | undefined };

function createRedisClient() {
  const client = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    retryStrategy: (times) => Math.min(times * 500, 5000),
  });

  client.on("error", (err) => logger.error({ err }, "Redis connection error"));
  client.on("reconnecting", () => logger.warn("Redis reconnecting..."));
  client.on("ready", () => logger.info("Redis connection ready"));

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
