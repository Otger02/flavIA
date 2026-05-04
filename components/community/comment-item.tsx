"use client";

import { useLocale, useTranslations } from "next-intl";

import type { CommunityComment } from "@/features/community/types";
import { ProfessionalBadge } from "@/components/verification/professional-badge";
import type { VerifiedProfessionalPublic } from "@/features/professional-verification/types";
import { formatDate } from "@/lib/locale";
import { ReportButton } from "./report-button";

type CommentItemProps = {
  comment: CommunityComment;
  currentUserId?: string | null;
};

export function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const locale = useLocale();
  const t = useTranslations("shared");
  const authorLabel = comment.is_flavia_ai
    ? "Flavia"
    : comment.is_anonymous
      ? t("global.anonymous")
      : comment.display_name || t("global.user_label");

  const date = formatDate(comment.created_at, locale, {
    day: "numeric",
    month: "short",
  });

  const isVerified = comment.is_verified_professional && !comment.is_anonymous && !comment.is_flavia_ai;
  const isOfficial = comment.is_official_reply && !comment.is_flavia_ai;

  const verifiedProfessional: VerifiedProfessionalPublic | null = isVerified
    ? {
        userId: comment.user_id,
        professionalType: comment.verified_professional_type as VerifiedProfessionalPublic["professionalType"],
        specialty: comment.verified_professional_specialty ?? null,
        bio: comment.verified_professional_bio ?? null,
        linkedinUrl: null,
        websiteUrl: null,
        displayName: comment.display_name || authorLabel,
        approvedAt: null,
      }
    : null;

  return (
    <div
      className={`rounded-xl border p-4 ${
        comment.is_flavia_ai
          ? "border-rose-200/60 bg-rose-50/40"
          : isOfficial
            ? "border-l-2 border-l-[#c4605a]/50 border-stone-200/40 bg-amber-50/30"
            : "border-stone-200/40 bg-white/60"
      }`}
    >
      {isOfficial && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#c4605a]">
          ✦ Respuesta de profesional
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {comment.is_flavia_ai && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-500">
              <span className="font-[family-name:var(--font-display)] text-xs text-white">F</span>
            </div>
          )}
          <span className={`text-xs font-medium ${comment.is_flavia_ai ? "text-rose-600" : "text-stone-500"}`}>
            {authorLabel}
          </span>
          {comment.is_flavia_ai && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-rose-500 border border-rose-200">
              IA
            </span>
          )}
          {isVerified && verifiedProfessional && (
            <ProfessionalBadge
              professional={verifiedProfessional}
              variant="small"
            />
          )}
          <span className="text-xs text-stone-400">{date}</span>
        </div>
        {currentUserId && !comment.is_flavia_ai && comment.user_id !== currentUserId && (
          <ReportButton targetType="comment" targetId={comment.id} />
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">{comment.content}</p>
    </div>
  );
}
