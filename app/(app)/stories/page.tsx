import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/features/auth/server/require-user";
import { StoryForm } from "@/components/stories/story-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Historias Reales",
  description:
    "Un espacio seguro para compartir experiencias reales de forma anónima. Lee historias de otras personas y comparte la tuya.",
};

export default async function StoriesPage() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  // Get approved public stories
  const { data: stories } = await supabase
    .from("user_stories")
    .select("id, content, is_anonymous, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  const approvedStories = stories ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          Historias
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-stone-900">
          Historias reales
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-stone-600">
          Compartir tu experiencia puede ayudar a alguien más. Aquí tienes un espacio
          seguro para hacerlo — de forma anónima si lo prefieres.
        </p>
      </div>

      {/* Submit form */}
      <StoryForm userId={user.id} />

      {/* Approved stories */}
      {approvedStories.length > 0 ? (
        <div className="space-y-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
            Lo que otras personas comparten
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
                    {story.is_anonymous ? "Anónimo" : "Usuaria"}
                  </span>
                  <span className="text-xs text-stone-300">&middot;</span>
                  <span className="text-xs text-stone-400">
                    {new Date(story.created_at).toLocaleDateString("es-ES", {
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
            Todavía no hay historias publicadas. Sé la primera en compartir.
          </p>
        </div>
      )}
    </div>
  );
}
