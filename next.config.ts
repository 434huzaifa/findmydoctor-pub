// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   // Prevent TypeORM and pg from being bundled by webpack/turbopack
//   serverExternalPackages: ["typeorm", "pg", "pg-native", "reflect-metadata"],
//   experimental: {
//     serverMinification: false,
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["typeorm", "pg", "pg-native", "reflect-metadata"],
  experimental: {
    serverMinification: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Disable minification entirely for server bundles
      // This prevents Terser from mangling class names that
      // TypeORM depends on for entity metadata resolution
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
