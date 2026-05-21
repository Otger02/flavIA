import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { BillingReturnNotice } from "@/components/billing/billing-return-notice";
import { BillingActionButton } from "@/components/billing/billing-action-button";
import { RefreshPlanStatusButton } from "@/components/billing/refresh-plan-status-button";
import { ResetOnboardingLink } from "@/components/account/reset-onboarding-link";
import { requireUser } from "@/features/auth/server/require-user";
import { BILLING_FREE_PLAN, BILLING_PLUS_PRODUCT_NAME } from "@/features/billing/constants";
import { getUserPlan } from "@/features/billing/server/get-user-plan";
import { getRecentChatSessions } from "@/features/chat/server/get-recent-chat-sessions";
import { getClickedRecommendations } from "@/features/recommendations/server/get-clicked-recommendations";
import { getTopicTranslationKey } from "@/lib/topic-config";
import { formatDate, getLocale } from "@/lib/locale";
import { DeleteAccountButton } from "@/components/account/delete-account-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");

  return {
    title: t("meta.account_title"),
    description: t("meta.account_description"),
  };
}

type AccountPageProps = {
  searchParams: Promise<{
    checkout?: string;
  }>;
};

function formatTopic(topic: string | null, noTopicLabel: string, resolveTopicLabel: (topic: string) => string) {
  if (!topic) {
    return noTopicLabel;
  }

  return resolveTopicLabel(topic);
}

function formatStatus(status: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  switch (status) {
    case "active":
      return t("account.billing.status_labels.active");
    case "trialing":
      return t("account.billing.status_labels.trialing");
    case "past_due":
      return t("account.billing.status_labels.past_due");
    case "canceled":
      return t("account.billing.status_labels.canceled");
    default:
      return t("account.billing.status_labels.inactive");
  }
}

function EmptyState({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-stone-200/50 bg-white/40 p-5">
      <p className="text-sm font-medium text-stone-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
    </div>
  );
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const locale = await getLocale();
  const [t, tShared] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("shared"),
  ]);

  const resolveTopicLabel = (topic: string) => {
    const key = getTopicTranslationKey(topic);
    return key ? tShared(key) : topic;
  };

  const formatPlanCode = (planCode: string) => {
    switch (planCode) {
      case BILLING_FREE_PLAN:
        return t("account.billing.free_code");
      case "plus":
        return t("account.billing.plus_code");
      default:
        return planCode;
    }
  };

  const [plan, recentSessions, clickedRecommendations] = await Promise.all([
    getUserPlan({ userId: user.id }),
    getRecentChatSessions({ userId: user.id }),
    getClickedRecommendations({ userId: user.id }),
  ]);

  const renewalDate = formatDate(plan.currentPeriodEnd, locale, { dateStyle: "medium" });
  const hasBillingAccess = Boolean(plan.stripeCustomerId);
  const checkoutStatus =
    params.checkout === "success" || params.checkout === "cancelled" ? params.checkout : null;
  const awaitingSync = checkoutStatus === "success" && plan.plan === BILLING_FREE_PLAN;

  return (
    <section className="space-y-8">
      <BillingReturnNotice status={checkoutStatus} awaitingSync={awaitingSync} />

      <div className="space-y-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("account.eyebrow")}</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-900">{t("account.title")}</h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">
          {t("account.subtitle")}
        </p>
        <ResetOnboardingLink label="Volver a hacer onboarding" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-[2rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_20px_60px_rgba(180,120,100,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">{t("account.billing.eyebrow")}</p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">{plan.plan === BILLING_FREE_PLAN ? t("account.billing.free_plan") : BILLING_PLUS_PRODUCT_NAME}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-rose-600">
                  {formatStatus(plan.status, t)}
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.15em] text-stone-500">
                  {formatPlanCode(plan.plan)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {hasBillingAccess ? (
                <BillingActionButton
                  mode="manage"
                  label={t("account.billing.manage")}
                  pendingLabel={t("account.billing.manage_pending")}
                  returnPath="/account"
                  className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                />
              ) : null}
              <RefreshPlanStatusButton />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-rose-200/40 bg-rose-50/50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("account.billing.subscription_status")}</p>
              <p className="mt-3 text-lg font-medium text-stone-900">{formatStatus(plan.status, t)}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {plan.plan === "free"
                  ? t("account.billing.summary_free")
                  : t("account.billing.summary_paid")}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-rose-200/40 bg-rose-50/50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("account.billing.renewal")}</p>
              <p className="mt-3 text-lg font-medium text-stone-900">{renewalDate ?? t("account.summary.not_available")}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {renewalDate
                  ? t("account.billing.renewal_synced")
                  : t("account.billing.renewal_missing")}
              </p>
            </div>
          </div>

          {!hasBillingAccess ? (
            <div className="mt-6 rounded-[1.5rem] border border-stone-200/50 bg-stone-50/50 p-4 text-sm leading-6 text-stone-600">
              {awaitingSync
                ? t("account.billing.portal_missing_sync")
                : t("account.billing.portal_missing")}
            </div>
          ) : null}

          {awaitingSync ? (
            <p className="mt-4 text-sm text-stone-500">
              {t("account.billing.awaiting_sync")}
            </p>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-stone-200/50 bg-gradient-to-b from-white/90 to-rose-50/30 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)]">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">{t("account.summary.eyebrow")}</p>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-stone-500">{t("account.summary.email")}</p>
              <p className="mt-1 text-base text-stone-900">{user.email ?? t("account.summary.not_available")}</p>
            </div>
            <div>
              <p className="text-sm text-stone-500">{t("account.summary.conversations")}</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-stone-900">{recentSessions.length}</p>
            </div>
            <div>
              <p className="text-sm text-stone-500">{t("account.summary.recommendations")}</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-stone-900">{clickedRecommendations.length}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)] backdrop-blur">
          <div className="mb-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("account.chat.eyebrow")}</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">{t("account.chat.title")}</h2>
          </div>

          {recentSessions.length === 0 ? (
            <EmptyState
              title={t("account.chat.empty_title")}
              description={t("account.chat.empty_description")}
            />
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <article key={session.id} className="rounded-[1.25rem] border border-stone-200/50 bg-white/60 p-4 transition-colors hover:bg-rose-50/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{formatTopic(session.activeTopic, t("account.chat.no_topic"), resolveTopicLabel)}</p>
                      <p className="mt-1 text-xs text-stone-400">{formatDate(session.createdAt, locale) ?? t("account.chat.no_date")}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-600">
                      {t("account.chat.message_count", { count: session.messageCount })}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)] backdrop-blur">
          <div className="mb-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("account.interactions.eyebrow")}</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">{t("account.interactions.title")}</h2>
          </div>

          {clickedRecommendations.length === 0 ? (
            <EmptyState
              title={t("account.interactions.empty_title")}
              description={t("account.interactions.empty_description")}
            />
          ) : (
            <div className="space-y-3">
              {clickedRecommendations.map((recommendation) => (
                <article key={recommendation.id} className="rounded-[1.25rem] border border-stone-200/50 bg-white/60 p-4 transition-colors hover:bg-rose-50/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{recommendation.title}</p>
                      <p className="mt-1 text-xs text-stone-400">{formatDate(recommendation.clickedAt, locale) ?? t("account.interactions.no_date")}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-600">
                      {recommendation.type}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-[2rem] border border-red-100 bg-white/60 p-6 shadow-[0_8px_30px_rgba(180,80,80,0.04)]">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-red-400">Zona de peligro</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">Eliminar cuenta</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-stone-500">
          Una vez eliminada, tu cuenta y todos tus datos (conversaciones, preferencias, historial) se borrarán de forma permanente. No podremos recuperarlos.
        </p>
        <div className="mt-5">
          <DeleteAccountButton />
        </div>
      </section>
    </section>
  );
}
