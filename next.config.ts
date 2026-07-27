import type { NextConfig } from "next";

// Routes from the pre-rebuild app (destination-agnostic benchmarking tool).
// The product changed shape entirely, so there's no page-for-page
// equivalent — send stale bookmarks/shared links to the compass instead of
// a 404.
const OLD_ROUTES = [
  "/trends",
  "/opportunity",
  "/benchmarking",
  "/seasonality",
  "/competitors",
  "/reports",
];

const nextConfig: NextConfig = {
  async redirects() {
    return OLD_ROUTES.map((source) => ({
      source,
      destination: "/",
      permanent: false,
    }));
  },
};

export default nextConfig;
