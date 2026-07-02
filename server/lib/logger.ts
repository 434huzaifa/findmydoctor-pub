import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, singleLine: true },
      },
});

// Helper for API routes
export const logRequest = (method: string, path: string, status: number) => {
  logger.info({ method, path, status }, "API Request");
};
