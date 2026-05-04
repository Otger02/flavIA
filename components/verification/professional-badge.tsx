"use client";

import { useTranslations } from "next-intl";

import type { VerifiedProfessionalPublic } from "@/features/professional-verification/types";

type Variant = "small" | "medium" | "large";

type ProfessionalBadgeProps = {
  professional: VerifiedProfessionalPublic;
  variant?: Variant;
  showLabel?: boolean;
};

const SIZE_CLASSES: Record<Variant, string> = {
  small: "h-4 w-4 text-[9px]",
  medium: "h-5 w-5 text-[10px]",
  large: "h-7 w-7 text-xs",
};

const PADDING_CLASSES: Record<Variant, string> = {
  small: "px-2 py-0.5 text-[10px]",
  medium: "px-2.5 py-1 text-[11px]",
  large: "px-3 py-1.5 text-xs",
};

/**
 * Inline "✓ Profesional verificada" badge with hover/tap tooltip.
 *
 * The tooltip surfaces type + specialty + bio. It uses CSS-only
 * disclosure (group-hover + focus-within) so it works without
 * JavaScript and behaves correctly on touch via the `tabIndex={0}`
 * wrapper.
 */
export function ProfessionalBadge({
  professional,
  variant = "small",
  showLabel = true,
}: ProfessionalBadgeProps) {
  const t = useTranslations("verification");
  const typeLabel = t(`professional_type.${professional.professionalType}`);

  return (
    <span
      tabIndex={0}
      className="group relative inline-flex items-center gap-1 align-middle outline-none"
      aria-label={t("badge.aria_label", {
        type: typeLabel,
        name: professional.displayName,
      })}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-rose-300/60 bg-gradient-to-r from-[#c4605a] to-[#b06050] font-medium text-white shadow-[0_2px_6px_rgba(176,96,80,0.20)] ${PADDING_CLASSES[variant]}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={SIZE_CLASSES[variant]}
          aria-hidden
        >
          <path d="M12 2l2.39 4.84 5.34.78-3.86 3.77.91 5.32L12 14.27l-4.78 2.51.91-5.32L4.27 7.62l5.34-.78L12 2z" />
        </svg>
        {showLabel ? (
          <span className="leading-none">{t("badge.short_label")}</span>
        ) : null}
      </span>

      {/* Tooltip — visible on hover/focus. Pointer-events-none so it doesn't
          block clicks on adjacent UI. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-64 -translate-x-1/2 rounded-xl border border-rose-200/60 bg-white p-3 text-left text-stone-700 shadow-[0_12px_32px_rgba(180,120,100,0.18)] group-hover:block group-focus-within:block"
      >
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-500">
          {t("badge.tooltip_eyebrow")}
        </span>
        <span className="mt-1 block font-[family-name:var(--font-display)] text-sm text-stone-900">
          {professional.displayName}
        </span>
        <span className="mt-0.5 block text-[11px] text-stone-500">
          {typeLabel}
          {professional.specialty ? ` · ${professional.specialty}` : ""}
        </span>
        {professional.bio ? (
          <span className="mt-2 block text-xs leading-5 text-stone-600">
            {professional.bio}
          </span>
        ) : null}
      </span>
    </span>
  );
}
