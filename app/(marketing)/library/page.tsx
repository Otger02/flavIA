import Image from "next/image";
import Link from "next/link";

import {
  LIBRARY_CONTENT_TYPES,
  LIBRARY_TOPIC_TAGS,
  getLibraryItems,
} from "@/features/library";

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
  const items = await getLibraryItems({ contentType: selectedContentType, topic: selectedTopic });

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
            {LIBRARY_TOPIC_TAGS.map((topic) => (
              <Link
                key={topic}
                href={buildFilterHref({ contentType: selectedContentType, topic })}
                className={`rounded-full px-4 py-2 text-xs transition ${
                  selectedTopic === topic ? "bg-stone-900 text-stone-50" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {topic.replaceAll("_", " ")}
              </Link>
            ))}
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
              <Link href={`/library/${item.slug}`} className="block">
                <div className="relative aspect-[16/10] bg-stone-200">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-stone-950/10 to-transparent" />
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
                  {item.isPremium ? (
                    <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-50">
                      Premium
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-700">{item.excerpt ?? "No excerpt yet."}</p>
                {item.topicTags.length > 0 || item.intentTags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.topicTags.map((tag) => (
                      <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                        {tag}
                      </span>
                    ))}
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