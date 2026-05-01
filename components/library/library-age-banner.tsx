"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  AGE_GROUP_CHANGED_EVENT,
  readAgeGroup,
  writeAgeGroup,
  type AgeGroup,
} from "@/lib/age-group";

export function LibraryAgeBanner() {
  const t = useTranslations("library.listing.teen_mode_banner");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);

  useEffect(() => {
    const sync = () => setAgeGroup(readAgeGroup());
    sync();
    window.addEventListener(AGE_GROUP_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AGE_GROUP_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (ageGroup !== "teen") return;
    if (searchParams.get("audience") === "adolescentes") return;

    const next = new URLSearchParams(searchParams.toString());
    next.set("audience", "adolescentes");
    router.replace(`${pathname}?${next.toString()}`);
  }, [ageGroup, pathname, router, searchParams]);

  if (ageGroup !== "teen") return null;

  const handleSwitchToAdult = () => {
    writeAgeGroup("adult");
    const next = new URLSearchParams(searchParams.toString());
    next.delete("audience");
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/70 px-5 py-3 text-sm text-emerald-900 shadow-[0_4px_14px_rgba(20,80,50,0.06)]">
      <p className="leading-relaxed">
        <span className="font-medium">{t("prefix")}</span>{" "}
        <span className="text-emerald-800/80">{t("question")}</span>
      </p>
      <button
        type="button"
        onClick={handleSwitchToAdult}
        className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-800"
      >
        {t("cta")}
      </button>
    </div>
  );
}
