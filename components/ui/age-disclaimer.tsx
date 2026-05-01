"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { AGE_GROUP_STORAGE_KEY, type AgeGroup } from "@/lib/age-group";

export function AgeDisclaimer() {
  const t = useTranslations("shared.disclaimers.adult");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AGE_GROUP_STORAGE_KEY);
      setOpen(stored !== "adult" && stored !== "teen");
    } catch {
      setOpen(true);
    }
  }, []);

  const setAgeGroup = (value: AgeGroup) => {
    try {
      window.localStorage.setItem(AGE_GROUP_STORAGE_KEY, value);
      window.dispatchEvent(new Event("flavia:age-group-changed"));
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
      aria-labelledby="flavia-age-disclaimer-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-[1.75rem] border border-rose-200/50 bg-gradient-to-b from-white to-rose-50/80 p-7 shadow-[0_30px_80px_rgba(61,42,24,0.25)]">
        <h2
          id="flavia-age-disclaimer-title"
          className="font-[family-name:var(--font-display)] text-2xl text-stone-900"
        >
          {t("title")}
        </h2>
        <p className="mt-3 text-sm leading-7 text-stone-700">{t("body")}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setAgeGroup("adult")}
            className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(220,100,100,0.30)]"
          >
            {t("confirm")}
          </button>
          <button
            type="button"
            onClick={() => setAgeGroup("teen")}
            className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            {t("under_18")}
          </button>
        </div>
      </div>
    </div>
  );
}
