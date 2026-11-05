import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  trailingSlash: true,
  // proxy.ts resolves aliases and slash normalization together, in one 301.
  skipTrailingSlashRedirect: true,
};
export default nextConfig;
