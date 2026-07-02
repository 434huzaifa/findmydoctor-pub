import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// Plain JSON output everywhere: pino-pretty's worker-thread transport can't be
// resolved when this module is bundled into a Next.js/Turbopack API route.
export const logger = pino({
  level: isProduction ? "info" : "debug",
});

// Helper for API routes
export const logRequest = (method: string, path: string, status: number) => {
  logger.info({ method, path, status }, "API Request");
};
