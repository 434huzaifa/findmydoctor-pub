import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["typeorm", "pg", "pg-native", "reflect-metadata"],
  experimental: {
    turbopackMinify: false,
  },
};

export default nextConfig;
