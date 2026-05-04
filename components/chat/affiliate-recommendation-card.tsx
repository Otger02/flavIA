"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import type { AffiliateRecommendationCard } from "@/features/chat/types";

const DISMISSED_STORAGE_KEY = "flavia_affiliate_dismissed";

type AffiliateRecommendationCardProps = {
  recommendation: AffiliateRecommendationCard;
  sessionId: string | null;
};

function readDismissedFromStorage(sessionId: string | null): Set<string> {
  if (!sessionId) return new Set();
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(`${DISMISSED_STORAGE_KEY}:${sessionId}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function persistDismissed(sessionId: string, slugs: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      `${DISMISSED_STORAGE_KEY}:${sessionId}`,
      JSON.stringify([...slugs]),
    );
  } catch {
    // ignore — server-side dismissal record is the source of truth
  }
}

export function AffiliateRecommendationCard({
  recommendation,
  sessionId,
}: AffiliateRecommendationCardProps) {
  const t = useTranslations("affiliate");
  const [dismissed, setDismissed] = useState(false);
  const [fading, setFading] = useState(false);
  const dismissingRef = useRef(false);

  // Hide on mount if the user already dismissed this product in the
  // session (sessionStorage cache; the server-side log is authoritative
  // for cross-tab/refresh behavior, but this avoids a re-flash before
  // the next chat turn re-fetches).
  useEffect(() => {
    if (!sessionId) return;
    const stored = readDismissedFromStorage(sessionId);
    if (stored.has(recommendation.slug)) {
      setDismissed(true);
    }
  }, [recommendation.slug, sessionId]);

  if (dismissed && !fading) return null;

  async function handleClick() {
    if (sessionId) {
      // Fire-and-forget — never block the outbound navigation on
      // the analytics POST.
      void fetch("/api/recommendations/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_slug: recommendation.slug,
          session_id: sessionId,
        }),
      }).catch(() => null);
    }
    window.open(recommendation.affiliateUrl, "_blank", "noopener,noreferrer");
  }

  function handleDismiss() {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    setFading(true);

    if (sessionId) {
      const stored = readDismissedFromStorage(sessionId);
      stored.add(recommendation.slug);
      persistDismissed(sessionId, stored);

      void fetch("/api/recommendations/affiliate/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_slug: recommendation.slug,
          session_id: sessionId,
        }),
      }).catch(() => null);
    }

    // Match the CSS transition duration (200ms) before unmounting.
    setTimeout(() => setDismissed(true), 220);
  }

  return (
    <aside
      className={`relative mt-3 overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-white via-amber-50/50 to-rose-50/40 shadow-[0_10px_28px_rgba(180,120,100,0.12)] transition-opacity duration-200 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Dismiss X */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t("dismiss_aria_label")}
        className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-stone-500 transition hover:bg-white hover:text-stone-800"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>

      {/* Eyebrow */}
      <div className="px-4 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber-700/80">
          {t("recommended_for_you")}
        </p>
      </div>

      <div className="flex gap-4 px-4 pb-4 pt-2">
        {recommendation.productImageUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
            <Image
              src={recommendation.productImageUrl}
              alt={recommendation.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-2xl text-stone-700/50 ring-1 ring-stone-200">
            <span aria-hidden>✦</span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            {recommendation.brandDisplayName}
          </p>
          <h3 className="mt-0.5 truncate font-[family-name:var(--font-display)] text-base leading-tight text-stone-900">
            {recommendation.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600">
            {recommendation.shortDescription}
          </p>
          {recommendation.priceRange ? (
            <p className="mt-1 text-[11px] font-medium text-stone-700">
              {recommendation.priceRange}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="self-center rounded-full bg-gradient-to-r from-[#c4605a] to-[#b06050] px-4 py-2 text-xs font-medium text-white shadow-[0_6px_16px_rgba(176,96,80,0.30)] transition hover:-translate-y-0.5"
        >
          {t("shared.cta_view")}
        </button>
      </div>

      <div className="border-t border-amber-200/40 bg-white/60 px-4 py-2">
        <p className="text-[10px] leading-4 text-stone-400">
          {t("shared.affiliate_disclosure")}
        </p>
      </div>
    </aside>
  );
}
