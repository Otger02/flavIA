import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { ProfessionalVerification } from "@/features/professional-verification/types";

type Props = {
  verification: ProfessionalVerification;
};

const STATUS_STYLES: Record<
  ProfessionalVerification["status"],
  { wrapper: string; eyebrow: string; eyebrowText: string }
> = {
  pending: {
    wrapper:
      "border border-amber-200/60 bg-gradient-to-b from-amber-50/70 to-white",
    eyebrow: "text-amber-700",
    eyebrowText: "status.pending_eyebrow",
  },
  approved: {
    wrapper:
      "border border-emerald-200/60 bg-gradient-to-b from-emerald-50/70 to-white",
    eyebrow: "text-emerald-700",
    eyebrowText: "status.approved_eyebrow",
  },
  rejected: {
    wrapper: "border border-rose-200/60 bg-gradient-to-b from-rose-50/70 to-white",
    eyebrow: "text-rose-700",
    eyebrowText: "status.rejected_eyebrow",
  },
  revoked: {
    wrapper: "border border-stone-300/70 bg-stone-50",
    eyebrow: "text-stone-600",
    eyebrowText: "status.revoked_eyebrow",
  },
};

export async function VerificationStatusCard({ verification }: Props) {
  const t = await getTranslations("verification");
  const style = STATUS_STYLES[verification.status];

  return (
    <article className={`rounded-[1.5rem] p-6 shadow-[0_14px_36px_rgba(61,42,24,0.06)] ${style.wrapper}`}>
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${style.eyebrow}`}
      >
        {t(style.eyebrowText)}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-stone-900">
        {t(`status.${verification.status}_title`)}
      </h2>
      <p className="mt-3 text-sm leading-6 text-stone-700">
        {t(`status.${verification.status}_body`)}
      </p>

      {verification.status === "rejected" && verification.rejectionReason ? (
        <div className="mt-4 rounded-2xl border border-rose-200/50 bg-white/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-500">
            {t("status.rejection_reason_label")}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-stone-700">
            {verification.rejectionReason}
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {verification.status === "rejected" ? (
          <Link
            href="/perfil/verificacion"
            className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition hover:-translate-y-0.5"
          >
            {t("status.resubmit_cta")}
          </Link>
        ) : null}
        {verification.status === "pending" ? (
          <Link
            href="/perfil/verificacion"
            className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            {t("status.edit_cta")}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
