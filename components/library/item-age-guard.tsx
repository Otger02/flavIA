"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  AGE_GROUP_CHANGED_EVENT,
  readAgeGroup,
  writeAgeGroup,
  type AgeGroup,
} from "@/lib/age-group";

type ItemAgeGuardProps = {
  isTeenContent: boolean;
  children: React.ReactNode;
};

export function ItemAgeGuard({ isTeenContent, children }: ItemAgeGuardProps) {
  const t = useTranslations("library.adult_only_notice");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      setAgeGroup(readAgeGroup());
      setHydrated(true);
    };
    sync();
    window.addEventListener(AGE_GROUP_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AGE_GROUP_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const blocked = hydrated && ageGroup === "teen" && !isTeenContent;

  if (!blocked) return <>{children}</>;

  const handleConfirmAdult = () => {
    writeAgeGroup("adult");
  };

  return (
    <section className="rounded-[2rem] border border-emerald-200/70 bg-gradient-to-b from-white to-emerald-50/60 p-8 shadow-[0_18px_50px_rgba(20,80,50,0.10)]">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl">🌱</span>
        <div className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
            {t("title")}
          </h2>
          <p className="text-sm leading-7 text-stone-700">{t("question")}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConfirmAdult}
          className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"
        >
          {t("cta")}
        </button>
        <Link
          href="/library?audience=adolescentes"
          className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        >
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
