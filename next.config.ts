import { createRequire } from "node:module";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  // Nextly runs with Cache Components and Partial Prefetching on. Its cache
  // handlers make the first read after a write show the new version, where
  // Next.js's default cache would serve the previous page once more:
  // https://nextlyhq.com/docs/getting-started/installation#cache-components
  cacheComponents: true,
  output: "standalone",
  outputFileTracingIncludes: {
    '/**': ['./node_modules/@nextlyhq/**/*'],
  },
  partialPrefetching: true,
  cacheHandler: require.resolve("nextly/cache-handler"),
  cacheMaxMemorySize: 0,
  cacheHandlers: { default: require.resolve("nextly/cache-handlers") },
  serverExternalPackages: [
    "nextly",
    "@nextlyhq/adapter-drizzle",
    "drizzle-orm",
    "drizzle-kit",
    "bcryptjs",
    "sharp",
    "esbuild",
    "@nextlyhq/adapter-postgres",
    "googleapis",
    "gaxios",
    "google-auth-library",
    "pg"
  ],
  async headers() {
    return [
      {
        // Apply these headers to all routes under /hono-api/
        source: "/hono-api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://arkansastrademarketing.com" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },

};

export default nextConfig;
