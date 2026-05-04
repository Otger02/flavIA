import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ProfessionalBadge } from "@/components/verification/professional-badge";
import type { VerifiedProfessionalPublic } from "@/features/professional-verification/types";

type Props = {
  professional: VerifiedProfessionalPublic;
};

/**
 * Full-width info card for a public profile area or dedicated
 * professional page. Server component — pulls translations
 * server-side, no JS shipped to the client.
 */
export async function ProfessionalInfoCard({ professional }: Props) {
  const t = await getTranslations("verification");
  const typeLabel = t(`professional_type.${professional.professionalType}`);

  return (
    <article className="rounded-[1.5rem] border border-rose-200/50 bg-gradient-to-br from-white via-rose-50/40 to-amber-50/30 p-6 shadow-[0_14px_36px_rgba(180,120,100,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500">
            {t("info_card.eyebrow")}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-stone-900">
            {professional.displayName}
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            {typeLabel}
            {professional.specialty ? ` · ${professional.specialty}` : ""}
          </p>
        </div>
        <ProfessionalBadge professional={professional} variant="medium" showLabel />
      </div>

      {professional.bio ? (
        <p className="mt-4 text-sm leading-6 text-stone-700">{professional.bio}</p>
      ) : null}

      {(professional.linkedinUrl || professional.websiteUrl) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {professional.linkedinUrl ? (
            <Link
              href={professional.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700 transition hover:bg-stone-50"
            >
              LinkedIn
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7M21 3l-9 9M5 7v12h12" />
              </svg>
            </Link>
          ) : null}
          {professional.websiteUrl ? (
            <Link
              href={professional.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700 transition hover:bg-stone-50"
            >
              {t("info_card.website")}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7M21 3l-9 9M5 7v12h12" />
              </svg>
            </Link>
          ) : null}
        </div>
      )}
    </article>
  );
}
