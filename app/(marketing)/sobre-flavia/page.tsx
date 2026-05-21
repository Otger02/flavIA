import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { BookCover3D } from "@/components/books/book-cover-3d";
import { listBooks } from "@/features/books/server/get-books";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: "https://flavia.app/sobre-flavia",
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: "https://flavia.app/sobre-flavia",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
    },
  };
}

export const dynamic = "force-dynamic";

const QUOTE_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

/**
 * Public bio page. Content is constrained to verified material —
 * books actually in Sanity, signature phrases that already live in
 * the system prompt, and the approach descriptions taken verbatim
 * from `lib/ai/prompts/chat-system-prompt.ts`.
 *
 * Anything not verifiable from those sources is rendered as a
 * [VERIFICAR] placeholder so Otger + Flavia can complete later.
 */
export default async function SobreFlaviaPage() {
  const t = await getTranslations("about");
  const books = await listBooks();

  // Person schema for SEO. Only fields we can confirm from the
  // codebase are populated; the rest stay omitted rather than
  // invented. `sameAs` deliberately empty until a verified profile
  // list arrives.
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Flavia Dos Santos",
    image: "https://flavia.app/flavia-bw.jpg",
    url: "https://flavia.app/sobre-flavia",
    description: t("meta.description"),
    // jobTitle: intentionally omitted — exact wording needs verification.
    sameAs: [],
  };

  return (
    <article className="space-y-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-rose-200/40 bg-gradient-to-br from-amber-50 via-rose-50/60 to-stone-50 shadow-[0_20px_60px_rgba(180,120,100,0.10)]">
        <div className="grid gap-8 px-6 py-10 sm:px-10 md:grid-cols-[auto_1fr] md:items-center md:gap-12 lg:px-14 lg:py-14">
          <div className="relative mx-auto h-64 w-64 shrink-0 overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(60,30,20,0.20)] ring-1 ring-stone-900/10 md:h-72 md:w-72">
            <Image
              src="/flavia-bw.jpg"
              alt="Flavia Dos Santos"
              fill
              priority
              sizes="(min-width: 768px) 288px, 256px"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-rose-500">
              {t("hero.eyebrow")}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl italic leading-none text-stone-900 sm:text-6xl">
              {t("hero.name")}
            </h1>
            <p className="mt-5 font-[family-name:var(--font-display)] text-xl italic leading-snug text-[#c4605a]">
              “{t("hero.tagline")}”
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-700">
              {t("hero.intro")}
            </p>
          </div>
        </div>

        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      </section>

      {/* ── Lo que hago ──────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
            {t("what_i_do.title")}
          </h2>
          <p className="text-base leading-7 text-stone-600">{t("what_i_do.subtitle")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <article
              key={i}
              className="rounded-[1.5rem] border border-stone-200/70 bg-white/70 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.06)]"
            >
              <h3 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
                {t(`what_i_do.item_${i}_title`)}
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                {t(`what_i_do.item_${i}_body`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Mis libros ───────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
            {t("books.title")}
          </h2>
          <p className="text-base leading-7 text-stone-600">{t("books.subtitle")}</p>
        </div>
        {books.length === 0 ? (
          <p className="text-sm text-stone-500">{t("books.empty")}</p>
        ) : (
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <li key={book.id}>
                <Link
                  href={`/libros/${book.slug}`}
                  className="group flex flex-col items-center gap-5 rounded-[1.75rem] border border-stone-200/60 bg-white/70 px-6 pb-7 pt-10 text-center shadow-[0_14px_36px_rgba(61,42,24,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(61,42,24,0.14)]"
                >
                  <BookCover3D src={book.coverImageUrl} alt={book.title} size="listing" />
                  <div className="space-y-1.5">
                    <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-stone-900">
                      {book.title}
                    </h3>
                    {book.subtitle ? (
                      <p className="text-sm leading-5 text-stone-600">{book.subtitle}</p>
                    ) : null}
                  </div>
                  <span className="text-sm font-medium text-rose-600 underline underline-offset-4">
                    {t("books.cta")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Mis frases ───────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
            {t("quotes.title")}
          </h2>
          <p className="text-base leading-7 text-stone-600">{t("quotes.subtitle")}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {QUOTE_KEYS.map((key) => (
            <li
              key={key}
              className="rounded-[1.5rem] border border-rose-200/40 bg-gradient-to-br from-white to-rose-50/40 p-6 shadow-[0_6px_20px_rgba(180,120,100,0.06)]"
            >
              <p className="font-[family-name:var(--font-display)] text-lg italic leading-snug text-stone-900">
                “{t(`quotes.${key}`)}”
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Para quién es ────────────────────────────────────────── */}
      <section className="rounded-[2rem] border border-stone-200/60 bg-white/70 p-8 shadow-[0_8px_24px_rgba(180,120,100,0.06)] sm:p-10">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {t("for_whom.title")}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
          {t("for_whom.body")}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-500">
          {t("for_whom.footnote")}
        </p>
      </section>

      {/* ── VERIFICAR placeholders ───────────────────────────────── */}
      {/* VERIFICAR CON FLAVIA: completar los datos biográficos confirmados antes
          de lanzar al público. Mientras tanto, esta sección está visible para
          el equipo de admin pero su copy lleva placeholders [VERIFICAR]. */}
      <section className="rounded-[2rem] border border-dashed border-amber-300/70 bg-amber-50/40 p-8 text-amber-900 sm:p-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
          {t("placeholders.title")}
        </p>
        <p className="mt-2 text-sm leading-6">{t("placeholders.intro")}</p>
        <ul className="mt-4 space-y-1.5 text-sm">
          <li>{t("placeholders.trajectory")}</li>
          <li>{t("placeholders.education")}</li>
          <li>{t("placeholders.experience")}</li>
          <li>{t("placeholders.media")}</li>
          <li>{t("placeholders.contact")}</li>
        </ul>
      </section>
    </article>
  );
}
