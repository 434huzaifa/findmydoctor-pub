import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getDataSource } from "@/server/db/data-source";
import { logger } from "@/server/lib/logger";
import { redis } from "@/server/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REDIS_HEALTH_KEY = "health:check";
const REDIS_HEALTH_TTL_SECONDS = 24 * 60 * 60;

async function checkDatabase(): Promise<boolean> {
  const start = Date.now();
  logger.info("Health check: database check started");

  try {
    const dataSource = await getDataSource();
    await dataSource.query("SELECT 1");
    logger.info(
      { responseTimeMs: Date.now() - start },
      "Health check: database check passed"
    );
    return true;
  } catch (error) {
    logger.error(
      { err: error, responseTimeMs: Date.now() - start },
      "Health check: database check failed"
    );
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  const start = Date.now();
  logger.info("Health check: Redis check started");

  try {
    const result = await redis.set(
      REDIS_HEALTH_KEY,
      randomUUID(),
      "EX",
      REDIS_HEALTH_TTL_SECONDS
    );

    if (result !== "OK") {
      throw new Error("Redis health check write was not acknowledged");
    }

    logger.info(
      {
        key: REDIS_HEALTH_KEY,
        ttlSeconds: REDIS_HEALTH_TTL_SECONDS,
        responseTimeMs: Date.now() - start,
      },
      "Health check: Redis check passed"
    );
    return true;
  } catch (error) {
    logger.error(
      { err: error, key: REDIS_HEALTH_KEY, responseTimeMs: Date.now() - start },
      "Health check: Redis check failed"
    );
    return false;
  }
}

export async function GET() {
  const start = Date.now();
  logger.info("Health check request started");

  const [databaseHealthy, redisHealthy] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);
  const responseTime = Date.now() - start;
  const healthy = databaseHealthy && redisHealthy;

  logger.info(
    {
      status: healthy ? "healthy" : "unhealthy",
      database: databaseHealthy ? "connected" : "disconnected",
      redis: redisHealthy ? "connected" : "disconnected",
      responseTimeMs: responseTime,
    },
    "Health check request completed"
  );

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: databaseHealthy ? "connected" : "disconnected",
      redis: redisHealthy ? "connected" : "disconnected",
      version: process.env.npm_package_version || "1.0.0",
    },
    { status: healthy ? 200 : 503 }
  );
}
