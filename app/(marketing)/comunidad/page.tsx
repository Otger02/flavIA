import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getUser } from "@/features/auth/server/get-user";
import { getThreads } from "@/features/community/server/get-threads";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isCommunityEnabled } from "@/lib/feature-flags";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";
import { CommunityTabsServer } from "@/components/community/community-tabs";
import { ThreadList } from "@/components/community/thread-list";
import { StoryForm } from "@/components/stories/story-form";
import { formatDate, getLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comunidad — FlavIA",
  description: "Un espacio para compartir experiencias, hacer preguntas y conectar con otras personas.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComunidadPage({ searchParams }: Props) {
  if (!isCommunityEnabled()) notFound();

  const params = await searchParams;
  const locale = await getLocale();
  const tab = params.tab === "historias" ? "historias" : "conversaciones";
  const topicFilter = typeof params.topic === "string" ? params.topic : undefined;

  const user = await getUser();
  const viewer = user ? await getViewerPlan() : null;
  const isPlus = viewer?.plan && viewer.plan.plan !== BILLING_FREE_PLAN && viewer.plan.status !== "canceled";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          Comunidad
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-stone-900">
          Espacio compartido
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-stone-600">
          Un lugar para compartir experiencias, abrir conversaciones y aprender de otras personas.
        </p>
      </div>

      {/* Tabs + Create button */}
      <div className="flex items-center justify-between gap-4">
        <CommunityTabsServer activeTab={tab} />
        {isPlus && tab === "conversaciones" && (
          <Link
            href="/comunidad/nueva"
            className="rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(220,100,100,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(220,100,100,0.25)]"
          >
            Nueva conversacion
          </Link>
        )}
      </div>

      {/* Content */}
      {tab === "conversaciones" ? (
        <ConversacionesTab topicFilter={topicFilter} isPlus={!!isPlus} user={user} />
      ) : (
        <HistoriasTab locale={locale} userId={user?.id ?? null} />
      )}
    </div>
  );
}

async function ConversacionesTab({
  topicFilter,
  isPlus,
  user,
}: {
  topicFilter?: string;
  isPlus: boolean;
  user: { id: string } | null;
}) {
  const { threads } = await getThreads({ topic: topicFilter });

  return (
    <div className="space-y-6">
      {!isPlus && user && (
        <div className="rounded-2xl border border-rose-200/40 bg-rose-50/40 p-4 text-center text-sm text-stone-600">
          Actualiza a{" "}
          <Link href="/plans" className="font-medium text-rose-500 hover:text-rose-600">
            Flavia Plus
          </Link>{" "}
          para crear conversaciones e invitar a Flavia a opinar.
        </div>
      )}
      <ThreadList threads={threads} />
    </div>
  );
}

async function HistoriasTab({ locale, userId }: { locale: string; userId: string | null }) {
  const supabase = await createServerSupabaseClient();

  const { data: stories } = await supabase
    .from("user_stories")
    .select("id, content, is_anonymous, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(30);

  const approvedStories = stories ?? [];

  return (
    <div className="space-y-6">
      {userId && <StoryForm userId={userId} />}

      {!userId && (
        <div className="rounded-2xl border border-stone-200/40 bg-stone-50/60 p-6 text-center">
          <p className="text-sm text-stone-500">
            <a href="/login" className="font-medium text-rose-500 hover:text-rose-600">
              Inicia sesion
            </a>{" "}
            para compartir tu historia.
          </p>
        </div>
      )}

      {approvedStories.length > 0 ? (
        <div className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
            Lo que otras personas comparten
          </p>
          {approvedStories.map((story) => (
            <article
              key={story.id}
              className="rounded-2xl border border-stone-200/50 bg-white/80 p-6 shadow-[0_2px_12px_rgba(180,120,100,0.06)]"
            >
              <p className="whitespace-pre-wrap text-sm leading-7 text-stone-700">
                {story.content}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
                <span>{story.is_anonymous ? "Anonimo" : "Usuaria"}</span>
                <span>&middot;</span>
                <span>
                  {formatDate(story.created_at, locale, {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-200/60 bg-white/40 p-8 text-center">
          <p className="text-sm text-stone-500">
            Todavia no hay historias publicadas. Se la primera en compartir.
          </p>
        </div>
      )}
    </div>
  );
}
