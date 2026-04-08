"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import type { RecommendationCard as RecommendationCardData } from "@/features/recommendations/types";
import { ANALYTICS_EVENTS, trackClientEvent } from "@/lib/analytics/track";

type RecommendationCardProps = {
  recommendation: RecommendationCardData;
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const trackedImpressionRef = useRef<string | null>(null);

  useEffect(() => {
    const impressionKey = recommendation.logId ?? recommendation.id;

    if (trackedImpressionRef.current === impressionKey) {
      return;
    }

    trackedImpressionRef.current = impressionKey;

    void trackClientEvent(ANALYTICS_EVENTS.recommendationShown, {
      recommendationId: recommendation.id,
      recommendationKind: recommendation.kind,
      recommendationTitle: recommendation.title,
      recommendationHref: recommendation.href,
      logId: recommendation.logId,
    });
  }, [recommendation]);

  async function handleClick() {
    void trackClientEvent(ANALYTICS_EVENTS.recommendationClicked, {
      recommendationId: recommendation.id,
      recommendationKind: recommendation.kind,
      recommendationTitle: recommendation.title,
      recommendationHref: recommendation.href,
      logId: recommendation.logId,
    });

    if (!recommendation.logId) {
      return;
    }

    await fetch("/api/recommendations/click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        logId: recommendation.logId,
      }),
    }).catch(() => null);
  }

  return (
    <aside className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] p-5 text-sm">
      <p className="text-[10px] uppercase tracking-[0.2em] text-rose-300/70">
        {recommendation.kind === "content" ? "Te puede interesar" : "Para seguir avanzando"}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-lg text-white">{recommendation.title}</h2>
      <p className="mt-2 leading-6 text-stone-300">{recommendation.description}</p>
      {recommendation.rationale ? (
        <p className="mt-2 text-xs leading-5 text-stone-400">{recommendation.rationale}</p>
      ) : null}
      <Link
        href={recommendation.href}
        onClick={handleClick}
        className="mt-4 inline-flex rounded-full border border-rose-400/30 bg-rose-500/10 px-5 py-2 text-xs font-medium text-rose-200 transition-colors hover:bg-rose-500/20"
      >
        Ver recomendación
      </Link>
    </aside>
  );
}
