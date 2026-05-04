import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  // Increase in production once baseline is established.
  tracesSampleRate: 0.1,

  // Session replay disabled — this app handles sensitive intimate content.
  // Never enable replaysSessionSampleRate without explicit user consent.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Only activate when DSN is configured (keeps local dev clean)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,
});
