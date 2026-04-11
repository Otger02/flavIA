"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";

import { formatDate } from "@/lib/locale";

type Story = {
  id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type AdminStoryListProps = {
  stories: Story[];
};

const statusStyleConfig = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/60",
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/60",
  },
  rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/60",
  },
} as const;

export function AdminStoryList({ stories: initial }: AdminStoryListProps) {
  const locale = useLocale();
  const tAdmin = useTranslations("admin");
  const [stories, setStories] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (storyId: string, newStatus: "approved" | "rejected") => {
      setLoading(storyId);

      // Optimistic update
      setStories((prev) =>
        prev.map((s) => (s.id === storyId ? { ...s, status: newStatus } : s)),
      );

      try {
        const res = await fetch("/api/stories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyId, status: newStatus }),
        });

        if (!res.ok) {
          throw new Error("Failed to update");
        }
      } catch {
        // Revert on failure
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId ? { ...s, status: "pending" } : s,
          ),
        );
      } finally {
        setLoading(null);
      }
    },
    [],
  );

  return (
    <div className="space-y-4">
      {stories.map((story) => {
        const cfg = statusStyleConfig[story.status];
        const isPending = story.status === "pending";
        const isUpdating = loading === story.id;

        return (
          <article
            key={story.id}
            className={`rounded-[1.5rem] border bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)] backdrop-blur transition-opacity ${
              isUpdating ? "opacity-60" : ""
            } ${isPending ? "border-amber-200/50" : "border-stone-200/50"}`}
          >
            {/* Header: status badge + meta */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}
              >
                {tAdmin(`status.${story.status}`)}
              </span>
              <span className="text-xs text-stone-400">
                {story.is_anonymous ? tAdmin("moderation.anonymous") : tAdmin("moderation.with_name")}
              </span>
              <span className="text-xs text-stone-300">&middot;</span>
              <span className="text-xs text-stone-400">
                {formatDate(story.created_at, locale)}
              </span>
              <span className="text-xs text-stone-300">&middot;</span>
              <span className="font-mono text-[10px] text-stone-300">
                {story.user_id.slice(0, 8)}...
              </span>
            </div>

            {/* Content */}
            <p className="text-sm leading-7 text-stone-700 whitespace-pre-wrap">
              {story.content}
            </p>

            {/* Actions for pending stories */}
            {isPending && (
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus(story.id, "approved")}
                  className="rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {tAdmin("moderation.approve")}
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus(story.id, "rejected")}
                  className="rounded-xl border border-stone-200/60 bg-white px-4 py-2 text-xs font-medium text-stone-600 shadow-sm transition-all hover:border-rose-200 hover:text-rose-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {tAdmin("moderation.reject")}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
