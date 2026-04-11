import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shared");
  return {
    title: t("global.not_found_title"),
    description: t("global.not_found_description"),
  };
}

export default async function NotFound() {
  const t = await getTranslations("shared");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
        404
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-stone-900">
        {t("global.not_found_title")}
      </h1>
      <p className="mt-3 max-w-sm text-base leading-7 text-stone-500">
        {t("global.not_found_description")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-2.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5"
        >
          {t("global.back_home")}
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-rose-200/50 bg-white/80 px-6 py-2.5 text-sm font-medium text-stone-700 transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50"
        >
          {t("global.go_dashboard")}
        </Link>
      </div>
    </div>
  );
}
