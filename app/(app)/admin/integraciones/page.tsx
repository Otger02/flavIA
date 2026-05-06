import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { MetaRevokeButton } from "@/components/admin/meta-revoke-button";
import { ADMIN_EMAILS } from "@/lib/constants";
import { getServerEnv } from "@/lib/env";
import { requireUser } from "@/features/auth/server/require-user";
import { getOwnIntegration } from "@/features/integrations/meta/server/get-active-integration";
import { formatDate, getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.integrations.meta");
  return { title: t("page_title") };
}

export const dynamic = "force-dynamic";

const ERROR_CODES: Record<string, string> = {
  user_denied: "user_denied",
  state_invalid: "state_invalid",
  exchange_failed: "exchange_failed",
  not_configured: "not_configured",
  meta_returned_error: "meta_returned_error",
  missing_code_or_state: "missing_code_or_state",
};

type Props = {
  searchParams: Promise<{ error?: string; connected?: string }>;
};

export default async function AdminMetaIntegrationsPage({ searchParams }: Props) {
  const user = await requireUser();
  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect("/dashboard");
  }
  const t = await getTranslations("admin.integrations.meta");
  const params = await searchParams;
  const locale = await getLocale();

  const env = getServerEnv();
  const isConfigured = Boolean(
    env.META_APP_ID && env.META_APP_SECRET && env.META_REDIRECT_URI && env.INTEGRATIONS_SIGNING_SECRET,
  );

  const integration = await getOwnIntegration(user.id);
  const errorCode = params.error && ERROR_CODES[params.error] ? params.error : null;
  const justConnected = params.connected === "1";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
          {t("page_eyebrow")}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {t("page_title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{t("page_subtitle")}</p>
      </div>

      {justConnected ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
          {t("just_connected")}
        </div>
      ) : null}

      {errorCode ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-900">
          <strong className="block text-xs uppercase tracking-[0.16em]">{t("error_eyebrow")}</strong>
          <span className="mt-1 block">{t(`error.${errorCode}`)}</span>
        </div>
      ) : null}

      {!isConfigured ? (
        <article className="rounded-[1.5rem] border border-amber-200/70 bg-amber-50/50 p-6 shadow-[0_4px_16px_rgba(180,120,100,0.06)]">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
            {t("not_configured_title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">{t("not_configured_body")}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-stone-700">
            <li>META_APP_ID</li>
            <li>META_APP_SECRET</li>
            <li>META_REDIRECT_URI</li>
            <li>INTEGRATIONS_SIGNING_SECRET</li>
          </ul>
        </article>
      ) : !integration || integration.status === "revoked" ? (
        <article className="rounded-[1.5rem] border border-stone-200/70 bg-white/70 p-6 shadow-[0_4px_16px_rgba(180,120,100,0.06)]">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
            {t("not_connected_title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">{t("not_connected_body")}</p>
          <Link
            href="/api/integrations/meta/start"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1877f2] to-[#0966d6] px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(24,119,242,0.25)] transition hover:-translate-y-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
            </svg>
            {t("connect_cta")}
          </Link>
        </article>
      ) : (
        <article className="space-y-5 rounded-[1.5rem] border border-emerald-200/60 bg-gradient-to-b from-emerald-50/60 to-white p-6 shadow-[0_4px_16px_rgba(20,80,50,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {t(`status.${integration.status}_eyebrow`)}
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-stone-900">
                {integration.facebookPageName ?? t("connected_account_unnamed")}
              </h2>
              {integration.facebookPageId ? (
                <p className="mt-1 font-mono text-[11px] text-stone-500">
                  Page ID: {integration.facebookPageId}
                </p>
              ) : null}
              {integration.instagramBusinessAccountId ? (
                <p className="font-mono text-[11px] text-stone-500">
                  IG Business: {integration.instagramBusinessAccountId}
                </p>
              ) : (
                <p className="mt-1 text-xs text-amber-700">{t("no_ig_business_warning")}</p>
              )}
            </div>
            <MetaRevokeButton integrationId={integration.id} />
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Field
              label={t("field.expires")}
              value={integration.tokenExpiresAt ? formatDate(integration.tokenExpiresAt, locale) ?? "—" : "—"}
            />
            <Field
              label={t("field.last_refreshed")}
              value={integration.lastRefreshedAt ? formatDate(integration.lastRefreshedAt, locale) ?? "—" : "—"}
            />
            <Field label={t("field.meta_user_id")} value={integration.metaUserId} mono />
            <Field
              label={t("field.scopes")}
              value={integration.grantedScopes.length > 0 ? integration.grantedScopes.join(", ") : "—"}
            />
          </dl>

          {integration.errorDetails ? (
            <details className="rounded-xl border border-stone-200 bg-white/80 p-3 text-xs">
              <summary className="cursor-pointer font-medium text-stone-700">
                {t("error_details_title")}
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-stone-50 p-2 font-mono text-[11px] text-stone-600">
                {JSON.stringify(integration.errorDetails, null, 2)}
              </pre>
            </details>
          ) : null}

          <p className="text-[11px] leading-5 text-stone-500">{t("revoke_note")}</p>
        </article>
      )}

      <p className="text-xs text-stone-500">
        <Link href="/admin" className="underline underline-offset-4 hover:text-stone-800">
          ← /admin
        </Link>
      </p>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</dt>
      <dd className={`mt-1 text-sm text-stone-800 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
