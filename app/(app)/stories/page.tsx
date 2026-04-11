import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/features/auth/server/require-user";
import { StoryForm } from "@/components/stories/story-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isCommunityEnabled } from "@/lib/feature-flags";
import { formatDate, getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const tc = await getTranslations("community");
  return {
    title: tc("meta.stories_title"),
    description: tc("meta.stories_description"),
  };
}

export default async function StoriesPage() {
  if (isCommunityEnabled()) {
    redirect("/comunidad?tab=historias");
  }

  const user = await requireUser();
  const locale = await getLocale();
  const t = await getTranslations("shared");
  const tc = await getTranslations("community");
  const supabase = await createServerSupabaseClient();

  const { data: stories } = await supabase
    .from("user_stories")
    .select("id, content, is_anonymous, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  const approvedStories = stories ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          {tc("stories.page_eyebrow")}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-stone-900">
          {tc("stories.page_title")}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-stone-600">
          {tc("stories.page_description")}
        </p>
      </div>

      <StoryForm userId={user.id} />

      {approvedStories.length > 0 ? (
        <div className="space-y-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
            {tc("stories.shared_eyebrow")}
          </p>
          <div className="space-y-4">
            {approvedStories.map((story) => (
              <article
                key={story.id}
                className="rounded-[1.5rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)] backdrop-blur"
              >
                <p className="text-sm leading-7 text-stone-700 whitespace-pre-wrap">
                  {story.content}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-stone-400">
                    {story.is_anonymous ? t("global.anonymous") : t("global.user_label")}
                  </span>
                  <span className="text-xs text-stone-300">&middot;</span>
                  <span className="text-xs text-stone-400">
                    {formatDate(story.created_at, locale, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-stone-200/60 bg-white/40 p-8 text-center">
          <p className="text-sm text-stone-500">
            {tc("stories.empty")}
          </p>
        </div>
      )}
    </div>
  );
}
