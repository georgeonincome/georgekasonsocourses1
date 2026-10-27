import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remote course artwork is served from the benchmark host; allow it in the
  // image optimiser. Swap these hosts for your own CDN before going live.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "courses.elvisw.online", pathname: "/wp-content/uploads/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*.(jpg|jpeg|png|webp|avif|svg|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
