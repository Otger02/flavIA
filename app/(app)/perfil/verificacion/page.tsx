import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { VerificationForm } from "@/components/verification/verification-form";
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

export default async function VerificationFormPage() {
  const user = await requireUser();
  const t = await getTranslations("verification");
  const tIntro = await getTranslations("verification.intro");
  const verification = await getOwnVerification(user.id);

  // Already approved or revoked: don't show the form, redirect to status.
  if (verification && (verification.status === "approved" || verification.status === "revoked")) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <VerificationStatusCard verification={verification} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
          {tIntro("eyebrow")}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {tIntro("title")}
        </h1>
        <p className="text-base leading-7 text-stone-700">{tIntro("subtitle")}</p>
      </div>

      {verification?.status === "rejected" ? (
        <VerificationStatusCard verification={verification} />
      ) : null}

      <article className="rounded-[1.5rem] border border-stone-200/70 bg-white/80 p-6 shadow-[0_14px_36px_rgba(180,120,100,0.06)]">
        <VerificationForm userId={user.id} initial={verification} />
      </article>

      <p className="text-center text-xs text-stone-500">
        <Link href="/perfil/verificacion/estado" className="underline underline-offset-4 hover:text-stone-800">
          {t("status.no_request_title")}
        </Link>
      </p>
    </div>
  );
}
