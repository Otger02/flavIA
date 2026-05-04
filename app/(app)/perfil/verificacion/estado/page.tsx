import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { VerificationStatusCard } from "@/components/verification/status-card";
import { requireUser } from "@/features/auth/server/require-user";
import { getOwnVerification } from "@/features/professional-verification/server/get-own-status";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("verification");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export const dynamic = "force-dynamic";

export default async function VerificationStatusPage() {
  const user = await requireUser();
  const t = await getTranslations("verification.status");
  const verification = await getOwnVerification(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
        {t("pending_eyebrow")}
      </p>

      {verification ? (
        <VerificationStatusCard verification={verification} />
      ) : (
        <article className="rounded-[1.5rem] border border-stone-200/60 bg-white/70 p-6 shadow-[0_4px_16px_rgba(61,42,24,0.04)]">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
            {t("no_request_title")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-700">{t("no_request_body")}</p>
          <Link
            href="/perfil/verificacion"
            className="mt-5 inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition hover:-translate-y-0.5"
          >
            {t("start_request_cta")}
          </Link>
        </article>
      )}
    </div>
  );
}
