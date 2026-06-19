import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent TypeORM and pg from being bundled by webpack/turbopack
  serverExternalPackages: ["typeorm", "pg", "pg-native", "reflect-metadata"],
  experimental: {
    serverMinification: false,
  },
};

export default nextConfig;
