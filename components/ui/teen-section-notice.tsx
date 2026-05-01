"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "flavia_teen_notice_dismissed";

export function TeenSectionNotice() {
  const t = useTranslations("shared.disclaimers.teen");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.sessionStorage.getItem(STORAGE_KEY) === "true";
      setOpen(!dismissed);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flavia-teen-notice-title"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-950/60 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-[1.75rem] border border-emerald-200/60 bg-gradient-to-b from-white to-emerald-50/70 p-7 shadow-[0_30px_80px_rgba(20,80,50,0.18)]">
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-2xl">🌱</span>
          <h2
            id="flavia-teen-notice-title"
            className="font-[family-name:var(--font-display)] text-2xl text-stone-900"
          >
            {t("title")}
          </h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-stone-700">{t("body")}</p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(20,120,80,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            {t("acknowledge")}
          </button>
        </div>
      </div>
    </div>
  );
}
