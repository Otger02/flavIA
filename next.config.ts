import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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

export default withSentryConfig(withNextIntl(nextConfig), {
  // Source map upload requires SENTRY_AUTH_TOKEN — set in CI/production env.
  // Disabled locally to keep builds fast and avoid auth prompts.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Suppress build-time output noise when Sentry DSN is not configured
  silent: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableLogger: true,
  // Avoid exposing the Sentry tunnel route for now
  tunnelRoute: undefined,
});