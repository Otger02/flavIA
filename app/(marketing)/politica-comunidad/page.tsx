import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("community-policy");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: "https://flavia.app/politica-comunidad" },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: "https://flavia.app/politica-comunidad",
      type: "article",
    },
  };
}



const RULE_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"] as const;

export default async function CommunityPolicyPage() {
  const t = await getTranslations("community-policy");
  const contactEmail = t("rights.contact_email");

  return (
    <article className="mx-auto max-w-3xl space-y-12">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <header className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">
          {t("hero.eyebrow")}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900">
          {t("hero.title")}
        </h1>
        <p className="text-base leading-7 text-stone-700">{t("hero.intro")}</p>
      </header>

      {/* ── Rules ────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("rules.title")}
        </h2>
        <ol className="space-y-4">
          {RULE_KEYS.map((key, index) => (
            <li
              key={key}
              className="relative rounded-[1.25rem] border border-rose-200/40 bg-gradient-to-br from-white to-rose-50/40 p-5 shadow-[0_4px_14px_rgba(180,120,100,0.05)]"
            >
              <span
                aria-hidden
                className="absolute -top-2 left-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#c4605a] to-[#b06050] text-[11px] font-semibold text-white shadow-[0_2px_6px_rgba(176,96,80,0.30)]"
              >
                {index + 1}
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg text-stone-900">
                {t(`rules.${key}_title`)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                {t(`rules.${key}_body`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Moderation ───────────────────────────────────────────── */}
      <section className="rounded-[1.75rem] border border-stone-200/70 bg-white/70 p-6 shadow-[0_6px_20px_rgba(180,120,100,0.05)] sm:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("moderation.title")}
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-700">{t("moderation.intro")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(["auto", "human", "verified", "reports"] as const).map((slot) => (
            <div key={slot} className="rounded-[1rem] border border-stone-200/60 bg-stone-50/50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
                {t(`moderation.${slot}_title`)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                {t(`moderation.${slot}_body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Consequences ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("consequences.title")}
        </h2>
        <p className="text-sm leading-6 text-stone-700">{t("consequences.intro")}</p>
        <ol className="space-y-3">
          {(["step1", "step2", "step3"] as const).map((step, index) => (
            <li
              key={step}
              className={`rounded-[1rem] border p-4 ${
                index === 2
                  ? "border-rose-300/70 bg-rose-50/50"
                  : "border-stone-200/70 bg-white/60"
              }`}
            >
              <h3 className="text-sm font-semibold text-stone-900">
                {t(`consequences.${step}_title`)}
              </h3>
              <p className="mt-1 text-sm leading-6 text-stone-700">
                {t(`consequences.${step}_body`)}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-xs leading-5 text-stone-500">{t("consequences.discretion_note")}</p>
      </section>

      {/* ── Reporting + Rights ───────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-[1.25rem] border border-stone-200/70 bg-white/70 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
            {t("report.title")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-700">{t("report.body")}</p>
          <Link
            href="/comunidad"
            className="mt-4 inline-flex rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5"
          >
            {t("report.cta")}
          </Link>
        </article>
        <article className="rounded-[1.25rem] border border-stone-200/70 bg-white/70 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
            {t("rights.title")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-700">
            {t("rights.body", { contactEmail })}
          </p>
        </article>
      </section>

      <p className="text-center text-xs italic leading-5 text-stone-400">
        {t("footer_note")}
      </p>
    </article>
  );
}
