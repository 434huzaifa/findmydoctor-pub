import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PG_URL: z.string().min(1, "PG_URL is required"),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CRON_SECRET: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
