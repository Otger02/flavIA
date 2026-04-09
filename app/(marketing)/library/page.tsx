import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  LIBRARY_CONTENT_TYPES,
  LIBRARY_TOPIC_TAGS,
  getLibraryItems,
} from "@/features/library";
import { getUser } from "@/features/auth/server/get-user";
import { getUserFavorites } from "@/features/favorites/server/get-user-favorites";
import { FavoriteButton } from "@/components/library/favorite-button";

const TOPIC_COLORS: Record<string, { active: string; inactive: string }> = {
  desire: { active: "bg-rose-500 text-white", inactive: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
  communication: { active: "bg-violet-500 text-white", inactive: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
  couple_connection: { active: "bg-pink-500 text-white", inactive: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
  jealousy: { active: "bg-amber-500 text-white", inactive: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  boundaries: { active: "bg-sky-500 text-white", inactive: "bg-sky-50 text-sky-700 hover:bg-sky-100" },
  pleasure: { active: "bg-fuchsia-500 text-white", inactive: "bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100" },
  self_connection: { active: "bg-teal-500 text-white", inactive: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
  routine: { active: "bg-stone-700 text-white", inactive: "bg-stone-100 text-stone-700 hover:bg-stone-200" },
};

export const metadata: Metadata = {
  title: "Biblioteca",
  description:
    "Videos, artículos y guiones de Flavia Dos Santos sobre deseo, comunicación en pareja, placer y conexión emocional.",
  openGraph: {
    title: "Biblioteca — Flavia",
    description:
      "Videos, artículos y guiones de Flavia Dos Santos sobre deseo, comunicación en pareja, placer y conexión emocional.",
    url: "https://flavia.app/library",
  },
};

export const dynamic = "force-dynamic";

type LibraryPageProps = {
  searchParams: Promise<{
    contentType?: string;
    topic?: string;
  }>;
};

function buildFilterHref(filters: { contentType?: string | null; topic?: string | null }) {
  const params = new URLSearchParams();

  if (filters.topic) {
    params.set("topic", filters.topic);
  }

  if (filters.contentType) {
    params.set("contentType", filters.contentType);
  }

  const queryString = params.toString();
  return queryString ? `/library?${queryString}` : "/library";
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const selectedTopic = params.topic ?? null;
  const selectedContentType = params.contentType ?? null;
  const [items, user] = await Promise.all([
    getLibraryItems({ contentType: selectedContentType, topic: selectedTopic }),
    getUser(),
  ]);

  const favorites = user
    ? await getUserFavorites({ userId: user.id, itemType: "content" })
    : [];
  const favoritedIds = new Set(favorites.map((f) => f.itemId));

  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Library</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-900">
          Biblioteca editorial para conversaciones reales
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-700">
          Recursos pensados para ayudarte a entender, nombrar y mover conversaciones difíciles.
          La misma estructura editorial queda preparada para alimentar recomendaciones desde el chat.
        </p>
      </div>

      <div className="grid gap-6 rounded-[2rem] border border-stone-300/70 bg-white/75 p-6 shadow-[0_18px_50px_rgba(61,42,24,0.08)] lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Explora por tema</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={buildFilterHref({ contentType: selectedContentType, topic: null })}
              className={`rounded-full px-4 py-2 text-xs transition ${
                !selectedTopic ? "bg-stone-900 text-stone-50" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              Todos
            </Link>
            {LIBRARY_TOPIC_TAGS.map((topic) => {
              const colors = TOPIC_COLORS[topic] ?? { active: "bg-stone-900 text-stone-50", inactive: "bg-stone-100 text-stone-700 hover:bg-stone-200" };
              return (
                <Link
                  key={topic}
                  href={buildFilterHref({ contentType: selectedContentType, topic })}
                  className={`rounded-full px-4 py-2 text-xs transition ${
                    selectedTopic === topic ? colors.active : colors.inactive
                  }`}
                >
                  {topic.replaceAll("_", " ")}
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Explora por formato</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={buildFilterHref({ contentType: null, topic: selectedTopic })}
              className={`rounded-full px-4 py-2 text-xs transition ${
                !selectedContentType ? "bg-stone-900 text-stone-50" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              Todo
            </Link>
            {LIBRARY_CONTENT_TYPES.map((contentType) => (
              <Link
                key={contentType}
                href={buildFilterHref({ contentType, topic: selectedTopic })}
                className={`rounded-full px-4 py-2 text-xs transition ${
                  selectedContentType === contentType
                    ? "bg-stone-900 text-stone-50"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {contentType}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 p-8 text-sm leading-6 text-stone-600">
          No hay piezas para esta combinación todavía. Prueba otro tema o formato para explorar la biblioteca.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[2rem] border border-stone-300 bg-white shadow-[0_20px_60px_rgba(61,42,24,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_66px_rgba(61,42,24,0.12)]">
              <Link href={`/library/${item.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-900 backdrop-blur">
                      {item.contentType}
                    </span>
                    {item.youtubeUrl ? (
                      <span className="rounded-full bg-amber-200/90 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-900 backdrop-blur">
                        Video
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
                      {item.editorialSource ?? "Biblioteca Flavia"}
                    </p>
                    <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">
                      {item.title}
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.isPremium ? (
                      <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-50">
                        Premium
                      </span>
                    ) : null}
                    {user ? (
                      <FavoriteButton
                        itemId={item.id}
                        itemType="content"
                        initialFavorited={favoritedIds.has(item.id)}
                      />
                    ) : null}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-700">{item.excerpt ?? "No excerpt yet."}</p>
                {item.topicTags.length > 0 || item.intentTags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.topicTags.map((tag) => {
                      const colors = TOPIC_COLORS[tag] ?? { inactive: "bg-stone-100 text-stone-600" };
                      return (
                        <span key={tag} className={`rounded-full px-3 py-1 text-xs ${colors.inactive}`}>
                          {tag}
                        </span>
                      );
                    })}
                    {item.intentTags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-stone-200 px-3 py-1 text-xs text-stone-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-5">
                  <Link href={`/library/${item.slug}`} className="text-sm font-medium text-stone-900 underline underline-offset-4">
                    {item.youtubeUrl ? "Ver pieza" : "Leer pieza"}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}