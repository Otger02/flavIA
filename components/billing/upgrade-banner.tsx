"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function UpgradeBanner() {
  const t = useTranslations("billing");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-rose-200/50 bg-gradient-to-r from-rose-50/80 via-white/80 to-rose-50/80 px-5 py-3.5 shadow-[0_4px_20px_rgba(220,100,100,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-sm text-white">
            ✦
          </span>
          <div>
            <p className="text-sm font-medium text-stone-900">
              {t("upgrade_banner.title")}
            </p>
            <p className="text-xs text-stone-500">
              {t("upgrade_banner.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/plans"
            className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-4 py-2 text-xs font-medium text-white shadow-[0_4px_12px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5"
          >
            {t("upgrade_banner.cta")}
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label={t("upgrade_banner.close")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
