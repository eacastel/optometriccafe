import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  trailingSlash: true,
  // proxy.ts resolves aliases and slash normalization together, in one 301.
  skipTrailingSlashRedirect: true,
  async headers() {
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: '.*\\.vercel\\.app' }],
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
    }];
  },
};
export default nextConfig;
