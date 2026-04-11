"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  es: "Español",
  en: "English",
};

const LOCALE_FLAGS: Record<string, string> = {
  es: "🇪🇸",
  en: "🇬🇧",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function switchTo(target: string) {
    router.replace(pathname, { locale: target as "es" | "en" });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 rounded-full border border-rose-200/50 bg-white/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-stone-500 transition-colors hover:border-rose-300 hover:text-stone-900"
      >
        <span>{LOCALE_FLAGS[locale]}</span>
        <span>{locale.toUpperCase()}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4L5 6.5L7.5 4" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-rose-200/50 bg-white shadow-lg shadow-stone-900/5"
        >
          {routing.locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === locale}>
              <button
                type="button"
                onClick={() => switchTo(loc)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors ${
                  loc === locale
                    ? "bg-rose-50 font-medium text-rose-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <span className="text-base">{LOCALE_FLAGS[loc]}</span>
                <span>{LOCALE_LABELS[loc]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
