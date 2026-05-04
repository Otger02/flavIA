import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing, type AppLocale } from "@/i18n/routing";

const messageNamespaces = [
  "navigation",
  "marketing",
  "auth",
  "billing",
  "dashboard",
  "library",
  "books",
  "affiliate",
  "community",
  "admin",
  "shared",
  "emails",
  "verification",
] as const;

async function loadMessages(locale: AppLocale) {
  const entries = await Promise.all(
    messageNamespaces.map(async (namespace) => {
      const messages = (await import(`../messages/${locale}/${namespace}.json`)).default;
      return [namespace, messages] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});