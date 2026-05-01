import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { BillingReturnNotice } from "@/components/billing/billing-return-notice";
import { BillingActionButton } from "@/components/billing/billing-action-button";
import {
  BILLING_FREE_PLAN,
  BILLING_PLUS_PRODUCT_NAME,
  BILLING_PRO_PRODUCT_NAME,
} from "@/features/billing/constants";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("billing");

  return {
    title: t("plans.page_title"),
    description: t("plans.page_description"),
    openGraph: {
      title: t("plans.og_title"),
      description: t("plans.page_description"),
      url: "https://flavia.app/plans",
    },
  };
}

export const dynamic = "force-dynamic";

type PlansPageProps = {
  searchParams: Promise<{
    checkout?: string;
  }>;
};

function hasManageBillingAccess(plan: { plan: string; status: string } | null) {
  if (!plan) {
    return false;
  }

  return plan.plan !== BILLING_FREE_PLAN && ["active", "trialing", "past_due"].includes(plan.status);
}

function CheckIcon({ tone }: { tone: "rose" | "stone" | "violet" }) {
  const color =
    tone === "rose" ? "text-rose-400" : tone === "violet" ? "text-violet-300" : "text-stone-400";
  return (
    <svg
      className={`mt-0.5 h-4 w-4 shrink-0 ${color}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.4}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const t = await getTranslations("billing");
  const params = await searchParams;
  const viewer = await getViewerPlan();
  const showManageBilling = hasManageBillingAccess(viewer.plan);
  const checkoutStatus =
    params.checkout === "success" || params.checkout === "cancelled" ? params.checkout : null;
  const awaitingSync = checkoutStatus === "success" && viewer.plan?.plan === BILLING_FREE_PLAN;
  const sessionEmail = t("plans.session_individual.contact_email");
  const sessionMailto = `mailto:${sessionEmail}?subject=${encodeURIComponent("Sesión individual con Flavia")}`;

  return (
    <section className="space-y-10">
      <BillingReturnNotice status={checkoutStatus} awaitingSync={awaitingSync} />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Image
            src="/flavia-verde.jpg"
            alt={t("plans.image_alt")}
            width={64}
            height={64}
            className="rounded-full border-2 border-rose-200 object-cover shadow-md"
          />
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">{t("plans.eyebrow")}</p>
        </div>
        <h1 className="max-w-xl font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900">
          {t("plans.headline")}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">
          {t("plans.subline")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Gratis ─────────────────────────────────────────────────── */}
        <article className="flex flex-col rounded-[2rem] border border-stone-200/80 bg-white/80 p-7 shadow-[0_18px_46px_rgba(180,120,100,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{t("plans.free.eyebrow")}</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">{t("plans.free.title")}</h2>
          <p className="mt-1 text-2xl font-semibold text-stone-400">{t("plans.free.price")}</p>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            {t("plans.free.description")}
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-stone-600">
            <li className="flex items-start gap-2.5">
              <CheckIcon tone="stone" />
              {t("plans.free.feature_1")}
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon tone="stone" />
              {t("plans.free.feature_2")}
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon tone="stone" />
              {t("plans.free.feature_3")}
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon tone="stone" />
              {t("plans.free.feature_4")}
            </li>
          </ul>
          <div className="mt-auto pt-8">
            <Link
              href="/login"
              className="inline-block rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
            >
              {t("plans.free.cta")}
            </Link>
          </div>
        </article>

        {/* ── Plus (recommended) ──────────────────────────────────────── */}
        <article className="relative z-10 flex flex-col overflow-visible rounded-[2rem] border border-rose-400/20 bg-gradient-to-br from-stone-950 to-[#1a1210] p-7 text-stone-50 shadow-[0_24px_80px_rgba(120,40,40,0.22)]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-4 py-1.5 text-xs font-medium text-white shadow-lg">{t("plans.plus.badge")}</span>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,100,100,0.10),transparent_55%)]" />
          <div className="relative flex flex-col h-full">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-400/70">{t("plans.plus.eyebrow")}</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-white">
              {BILLING_PLUS_PRODUCT_NAME}
            </h2>
            <p className="mt-2">
              <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">{t("plans.plus.price_amount")}</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              {t("plans.plus.description")}
            </p>

            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-rose-400/60">{t("plans.plus.included_prefix")}</p>
            <ul className="mt-3 space-y-2.5 text-sm text-stone-300">
              <li className="flex items-start gap-2.5"><CheckIcon tone="rose" />{t("plans.plus.feature_1")}</li>
              <li className="flex items-start gap-2.5"><CheckIcon tone="rose" />{t("plans.plus.feature_2")}</li>
              <li className="flex items-start gap-2.5"><CheckIcon tone="rose" />{t("plans.plus.feature_3")}</li>
              <li className="flex items-start gap-2.5"><CheckIcon tone="rose" />{t("plans.plus.feature_4")}</li>
              <li className="flex items-start gap-2.5"><CheckIcon tone="rose" />{t("plans.plus.feature_5")}</li>
            </ul>

            <div className="mt-auto pt-8">
              <div className="flex flex-wrap gap-3">
                {showManageBilling ? (
                  <BillingActionButton
                    mode="manage"
                    label={t("plans.plus.manage_label")}
                    pendingLabel={t("plans.plus.manage_pending")}
                    returnPath="/account"
                    className="rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-950 transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                  />
                ) : (
                  <BillingActionButton
                    mode="checkout"
                    plan="plus"
                    label={t("plans.plus.checkout_label")}
                    pendingLabel={t("plans.plus.checkout_pending")}
                    disabled={!viewer.userId}
                    successPath="/account?checkout=success"
                    cancelPath="/plans?checkout=cancelled"
                    className="animate-pulse-glow rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.25)] transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                  />
                )}
              </div>

              {!viewer.userId ? (
                <p className="mt-4 text-sm text-stone-500">
                  <Link href="/login" className="text-rose-400 underline underline-offset-2 transition-colors hover:text-rose-300">{t("plans.plus.login_prefix")}</Link> {t("plans.plus.login_suffix")}
                </p>
              ) : null}

              {checkoutStatus === "success" && awaitingSync ? (
                <p className="mt-4 text-sm text-stone-500">
                  {t("plans.plus.awaiting_sync")}
                </p>
              ) : null}
            </div>
          </div>
        </article>

        {/* ── Pro (coming soon, no checkout yet) ──────────────────────── */}
        <article className="relative flex flex-col overflow-hidden rounded-[2rem] border border-violet-300/30 bg-gradient-to-br from-[#1a1227] via-[#1d1430] to-[#221636] p-7 text-stone-50 shadow-[0_22px_70px_rgba(80,40,140,0.25)]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white shadow-lg">{t("plans.pro.badge")}</span>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(190,120,255,0.12),transparent_55%)]" />
          <div className="relative flex flex-col h-full">
            <p className="text-xs uppercase tracking-[0.2em] text-violet-300/70">{t("plans.pro.eyebrow")}</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-white">
              {BILLING_PRO_PRODUCT_NAME}
            </h2>
            <p className="mt-2">
              <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">{t("plans.pro.price_amount")}</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              {t("plans.pro.description")}
            </p>

            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-violet-300/60">{t("plans.pro.included_prefix")}</p>
            <ul className="mt-3 space-y-2.5 text-sm text-stone-300">
              <li className="flex items-start gap-2.5"><CheckIcon tone="violet" />{t("plans.pro.feature_1")}</li>
              <li className="flex items-start gap-2.5"><CheckIcon tone="violet" />{t("plans.pro.feature_2")}</li>
              <li className="flex items-start gap-2.5"><CheckIcon tone="violet" />{t("plans.pro.feature_3")}</li>
              <li className="flex items-start gap-2.5"><CheckIcon tone="violet" />{t("plans.pro.feature_4")}</li>
            </ul>

            <div className="mt-auto pt-8">
              {/* Pro checkout intentionally NOT wired yet — Flavia hasn't confirmed pricing.
                  When STRIPE_PRO_PRICE_ID is set, swap this block for a BillingActionButton with plan="pro". */}
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-full border border-violet-300/30 bg-violet-500/10 px-6 py-3 text-sm font-medium text-violet-200/80"
                aria-disabled
              >
                {t("plans.pro.coming_soon")}
              </button>
              <p className="mt-3 text-xs leading-5 text-stone-500">
                {t("plans.pro.coming_soon_note")}
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* ── One-on-one session card ─────────────────────────────────── */}
      <article className="relative overflow-hidden rounded-[2rem] border border-amber-200/60 bg-gradient-to-r from-amber-50 via-rose-50 to-stone-50 p-6 shadow-[0_14px_36px_rgba(180,120,100,0.10)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-52 w-52 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="relative grid gap-6 sm:grid-cols-[1.4fr_auto] sm:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700/80">{t("plans.session_individual.eyebrow")}</p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
              {t("plans.session_individual.title")}
            </h2>
            <p className="text-sm leading-6 text-stone-700">
              {t("plans.session_individual.description")}
            </p>
            <ul className="grid gap-1.5 text-sm text-stone-700 sm:grid-cols-2">
              <li className="flex items-start gap-2"><CheckIcon tone="rose" />{t("plans.session_individual.feature_1")}</li>
              <li className="flex items-start gap-2"><CheckIcon tone="rose" />{t("plans.session_individual.feature_2")}</li>
            </ul>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end sm:text-right">
            <p className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
              {t("plans.session_individual.price_range")}
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
              {t("plans.session_individual.price_suffix")}
            </p>
            <a
              href={sessionMailto}
              className="mt-2 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-stone-800"
            >
              {t("plans.session_individual.cta")}
            </a>
          </div>
        </div>
      </article>
    </section>
  );
}
