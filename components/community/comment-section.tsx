"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CommentTargetType } from "@/features/community/types";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";
import type { CommunityComment } from "@/features/community/types";

type CommentSectionProps = {
  targetType: CommentTargetType;
  targetId: string;
  initialComments: CommunityComment[];
  initialTotal: number;
  currentUserId?: string | null;
  isVerifiedProfessional?: boolean;
};

export function CommentSection({
  targetType,
  targetId,
  initialComments,
  initialTotal,
  currentUserId,
  isVerifiedProfessional = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [total, setTotal] = useState(initialTotal);
  const t = useTranslations("shared");
  const tc = useTranslations("community");

  async function refreshComments() {
    try {
      const res = await fetch(`/api/community/comments?targetType=${targetType}&targetId=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setTotal(data.total);
      }
    } catch {
      // silently fail refresh
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-[family-name:var(--font-display)] text-lg text-stone-900">
        {tc("comment_section.reply_count", { count: total })}
      </h3>

      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {currentUserId ? (
        <CommentForm
          targetType={targetType}
          targetId={targetId}
          onCommentAdded={refreshComments}
          isVerifiedProfessional={isVerifiedProfessional}
        />
      ) : (
        <div className="rounded-xl border border-stone-200/40 bg-stone-50/60 p-4 text-center">
          <p className="text-sm text-stone-500">
            <a href="/login" className="font-medium text-rose-500 hover:text-rose-600">
              {t("global.login_prompt_prefix")}
            </a>{" "}
            {t("global.login_prompt_suffix")}
          </p>
        </div>
      )}
    </div>
  );
}
