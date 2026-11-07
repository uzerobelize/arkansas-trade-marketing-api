import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nextly runs with Cache Components and Partial Prefetching on. Its cache
  // handlers make the first read after a write show the new version, where
  // Next.js's default cache would serve the previous page once more:
  // https://nextlyhq.com/docs/getting-started/installation#cache-components
  cacheComponents: true,
  output: "standalone",
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
    "pg"
  ],
};

export default nextConfig;
