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
    <aside className="mt-4 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-cyan-50">
      <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200">
        {recommendation.kind === "content" ? "Recommended content" : "Recommended product"}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-white">{recommendation.title}</h2>
      <p className="mt-2 leading-6 text-cyan-50/90">{recommendation.description}</p>
      <p className="mt-3 text-xs leading-5 text-cyan-100/80">{recommendation.rationale}</p>
      <Link
        href={recommendation.href}
        onClick={handleClick}
        className="mt-4 inline-flex rounded-full border border-cyan-200/40 px-4 py-2 text-xs font-medium text-cyan-50"
      >
        Ver recomendacion
      </Link>
    </aside>
  );
}