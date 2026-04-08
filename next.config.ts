import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "assets.lelo.com",
      },
      {
        protocol: "https",
        hostname: "www.lelo.com",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;