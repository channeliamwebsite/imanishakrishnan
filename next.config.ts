import type { NextConfig } from "next";

/** Primary domain (see .env.production) — every secondary host redirects here, keeping path and query. */
const PRIMARY_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://iamnisha.in").replace(/\/+$/, "");

/**
 * Secondary hosts that reach this Vercel project. www.iamnisha.in is deliberately not listed:
 * redirect it in Vercel → Domains (iamnisha.in primary) — listing it here while Vercel still
 * sends iamnisha.in to www would create a loop. Hosts on other providers (e.g. Cloudflare) never
 * reach this app and must be redirected where their DNS is managed.
 */
const SECONDARY_HOSTS = ["www.iamnishakrishnan.com", "iamnishakrishnan.com", "imanishakrishnan.vercel.app"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Bundle firebase-admin instead of loading it from node_modules at runtime: its dependency
  // jwks-rsa require()s the ESM-only `jose`, which fails (ERR_REQUIRE_ESM) on runtimes without
  // require(esm) support. Bundled, the import is resolved at build time and works on any Node.
  transpilePackages: ["firebase-admin"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The admin may not be framed by any site; the preview viewport only by the admin itself.
  // Neither is ever indexed.
  async redirects() {
    return SECONDARY_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${PRIMARY_SITE_URL}/:path*`,
      permanent: true,
    }));
  },
  async headers() {
    const noindex = { key: "X-Robots-Tag", value: "noindex, nofollow" };
    return [
      { source: "/admin/:path*", headers: [noindex, { key: "X-Frame-Options", value: "DENY" }, { key: "Content-Security-Policy", value: "frame-ancestors 'none'" }] },
      { source: "/admin", headers: [noindex, { key: "X-Frame-Options", value: "DENY" }, { key: "Content-Security-Policy", value: "frame-ancestors 'none'" }] },
      { source: "/preview", headers: [noindex, { key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "Content-Security-Policy", value: "frame-ancestors 'self'" }] },
    ];
  },
  images: {
    // All site media is served from Cloudinary, which resizes and picks the format itself
    // (see lib/cloudinary/loader.ts). Image URLs are validated in lib/content/normalize.ts.
    loader: "custom",
    loaderFile: "./lib/cloudinary/loader.ts",
  },
};

export default nextConfig;
