import type { NextConfig } from "next";

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
