import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // All site media is served from Cloudinary, which resizes and picks the format itself
    // (see lib/cloudinary/loader.ts). Image URLs are validated in lib/content/normalize.ts.
    loader: "custom",
    loaderFile: "./lib/cloudinary/loader.ts",
  },
};

export default nextConfig;
