import { getLocale as getNextIntlLocale } from "next-intl/server";

import { routing, type AppLocale } from "@/i18n/routing";

function normalizeLocale(locale: string): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

function toIntlLocale(locale: string) {
  return normalizeLocale(locale) === "en" ? "en-US" : "es-ES";
}

export async function getLocale(): Promise<AppLocale> {
  return normalizeLocale(await getNextIntlLocale());
}

export function formatDate(
  value: Date | string | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(toIntlLocale(locale), options).format(date);
}

export function formatRelativeTime(value: Date | string, locale: string) {
  const date = value instanceof Date ? value : new Date(value);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffInSeconds);
  const formatter = new Intl.RelativeTimeFormat(toIntlLocale(locale), {
    numeric: "auto",
  });

  if (absSeconds < 60) {
    return formatter.format(diffInSeconds, "second");
  }

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return formatter.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) < 7) {
    return formatter.format(diffInDays, "day");
  }

  const diffInWeeks = Math.round(diffInDays / 7);
  return formatter.format(diffInWeeks, "week");
}