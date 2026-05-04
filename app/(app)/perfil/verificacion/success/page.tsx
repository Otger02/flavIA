import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("verification.success");
  return { title: t("title") };
}

export default async function VerificationSuccessPage() {
  const t = await getTranslations("verification.success");
  return (
    <article className="mx-auto max-w-xl space-y-6 rounded-[1.5rem] border border-emerald-200/60 bg-gradient-to-b from-emerald-50/70 to-white p-8 shadow-[0_14px_36px_rgba(20,80,50,0.10)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
        {t("eyebrow")}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
        {t("title")}
      </h1>
      <p className="text-base leading-7 text-stone-700">{t("body")}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/perfil/verificacion/estado"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-xs font-medium text-white transition hover:-translate-y-0.5"
        >
          {t("view_status_cta")}
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
        >
          {t("go_home_cta")}
        </Link>
      </div>
    </article>
  );
}
