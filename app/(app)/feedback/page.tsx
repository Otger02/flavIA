import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/features/auth/server/require-user";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shared");
  return {
    title: t("feedback.meta_title"),
    description: t("feedback.meta_description"),
  };
}

export default async function FeedbackPage() {
  const user = await requireUser();
  const t = await getTranslations("shared");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          {t("feedback.eyebrow")}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-stone-900">
          {t("feedback.title")}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-stone-600">
          {t("feedback.description")}
        </p>
      </div>

      <FeedbackForm userId={user.id} />
    </div>
  );
}
