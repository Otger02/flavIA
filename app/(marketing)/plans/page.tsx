import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { BillingReturnNotice } from "@/components/billing/billing-return-notice";
import { BillingActionButton } from "@/components/billing/billing-action-button";
import { BILLING_PLUS_PRODUCT_NAME, BILLING_FREE_PLAN } from "@/features/billing/constants";
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

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const t = await getTranslations("billing");
  const params = await searchParams;
  const viewer = await getViewerPlan();
  const showManageBilling = hasManageBillingAccess(viewer.plan);
  const checkoutStatus =
    params.checkout === "success" || params.checkout === "cancelled" ? params.checkout : null;
  const awaitingSync = checkoutStatus === "success" && viewer.plan?.plan === BILLING_FREE_PLAN;

  return (
    <section className="space-y-8">
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

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="flex flex-col rounded-[2rem] border border-stone-200/80 bg-white/80 p-7 shadow-[0_20px_60px_rgba(180,120,100,0.06)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{t("plans.free.eyebrow")}</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">{t("plans.free.title")}</h2>
          <p className="mt-1 text-2xl font-semibold text-stone-400">{t("plans.free.price")}</p>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            {t("plans.free.description")}
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-stone-600">
            <li className="flex items-start gap-2.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {t("plans.free.feature_1")}
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              {t("plans.free.feature_2")}
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              {t("plans.free.feature_3")}
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

        <article className="relative z-10 scale-[1.02] overflow-visible rounded-[2rem] border border-rose-400/20 bg-gradient-to-br from-stone-950 to-[#1a1210] p-7 text-stone-50 shadow-[0_24px_80px_rgba(120,40,40,0.18)]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-4 py-1.5 text-xs font-medium text-white shadow-lg">{t("plans.plus.badge")}</span>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,100,100,0.08),transparent_50%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-400/70">{t("plans.plus.eyebrow")}</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">
                  {BILLING_PLUS_PRODUCT_NAME}
                </h2>
                <p className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-white">{t("plans.plus.price_amount")}</span>
                  <span className="text-sm text-stone-400">{t("plans.plus.price_suffix")}</span>
                </p>
                <p className="mt-4 max-w-xl text-sm leading-6 text-stone-400">
                  {t("plans.plus.description")}
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-rose-400/60">{t("plans.plus.included_prefix")}</p>
            <ul className="mt-3 space-y-2.5 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                {t("plans.plus.feature_1")}
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                {t("plans.plus.feature_2")}
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {t("plans.plus.feature_3")}
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                {t("plans.plus.feature_4")}
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
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
        </article>
      </div>
    </section>
  );
}
