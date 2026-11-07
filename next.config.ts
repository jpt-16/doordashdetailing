import type { NextConfig } from "next";

const config: NextConfig = {
  // One photo (max 5 MB) is sent per server action call.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default config;
