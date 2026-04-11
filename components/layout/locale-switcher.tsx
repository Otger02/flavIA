"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  es: "ES",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = locale === "es" ? "en" : "es";

  function handleSwitch() {
    // Strip current locale prefix if present
    let path = pathname;
    for (const loc of routing.locales) {
      if (path === `/${loc}` || path.startsWith(`/${loc}/`)) {
        path = path.slice(`/${loc}`.length) || "/";
        break;
      }
    }

    // Build target path
    const target =
      nextLocale === routing.defaultLocale ? path : `/${nextLocale}${path}`;

    router.push(target);
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className="rounded-full border border-rose-200/50 bg-white/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-stone-500 transition-colors hover:border-rose-300 hover:text-stone-900"
      aria-label={`Switch to ${LOCALE_LABELS[nextLocale]}`}
    >
      {LOCALE_LABELS[nextLocale]}
    </button>
  );
}
