import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BookBuyButton } from "@/components/books/book-buy-button";
import { BookCover3D } from "@/components/books/book-cover-3d";
import { getUser } from "@/features/auth/server/get-user";
import { getBookBySlug } from "@/features/books/server/get-books";
import { getActivePurchaseForUser } from "@/features/books/server/book-purchases";
import { isBookCheckoutEnabled } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";

type BookPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ purchased?: string; error?: string }>;
};

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations("books");
  const book = await getBookBySlug(slug);

  if (!book) {
    return { title: t("detail.not_found") };
  }

  return {
    title: book.title,
    description: book.subtitle ?? t("list.meta_description"),
    openGraph: {
      title: `${book.title} — Flavia`,
      description: book.subtitle ?? "",
      url: `https://flavia.app/libros/${book.slug}`,
      ...(book.coverImageUrl
        ? { images: [{ url: book.coverImageUrl, alt: book.title }] }
        : {}),
    },
  };
}

function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderPortableText(blocks: unknown[], emptyState: string) {
  const paragraphs = blocks
    .filter((block): block is { _type?: string; children?: Array<{ text?: string }> } =>
      typeof block === "object" && block !== null,
    )
    .filter((block) => block._type === "block")
    .map((block) => block.children?.map((child) => child.text ?? "").join("") ?? "")
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return <p className="text-base leading-7 text-stone-600">{emptyState}</p>;
  }

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 20)}`} className="text-base leading-7 text-stone-700">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default async function BookDetailPage({ params, searchParams }: BookPageProps) {
  const [{ slug }, qs, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("books"),
  ]);

  const book = await getBookBySlug(slug);
  if (!book) {
    notFound();
  }

  const user = await getUser();
  const purchase = user
    ? await getActivePurchaseForUser({ userId: user.id, bookSlug: slug })
    : null;
  const owned = Boolean(purchase);

  const checkoutAvailable = isBookCheckoutEnabled() && book.hasPdf;
  const showPurchaseSuccess = qs.purchased === "true";
  const showPurchaseError = qs.error === "payment";

  return (
    <article className="mx-auto max-w-5xl space-y-10">
      <Link
        href="/libros"
        className="inline-flex text-sm font-medium text-stone-600 underline underline-offset-4"
      >
        {t("detail.back")}
      </Link>

      {showPurchaseSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
          {t("detail.purchase_success")}
        </div>
      ) : null}
      {showPurchaseError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-900">
          {t("detail.purchase_error")}
        </div>
      ) : null}

      <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-start">
        <BookCover3D src={book.coverImageUrl} alt={book.title} size="detail" />

        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">{t("list.eyebrow")}</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900">
            {book.title}
          </h1>
          {book.subtitle ? (
            <p className="text-lg leading-7 text-stone-600">{book.subtitle}</p>
          ) : null}
          {book.pages ? (
            <p className="text-sm text-stone-500">{t("detail.pages_count", { count: book.pages })}</p>
          ) : null}

          <div className="pt-2">
            {owned ? (
              <a
                href={`/api/books/${book.slug}/download`}
                className="inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(40,30,25,0.22)] transition hover:-translate-y-0.5"
              >
                {t("detail.download_cta")}
              </a>
            ) : (
              <BookBuyButton
                slug={book.slug}
                priceLabel={formatCop(book.priceCop)}
                available={checkoutAvailable}
                isAuthenticated={Boolean(user)}
              />
            )}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("detail.description_title")}
        </h2>
        {renderPortableText(book.description, t("detail.description_empty"))}
      </section>

      {book.teaserExcerpt.length > 0 ? (
        <section className="rounded-[2rem] border border-amber-200/60 bg-gradient-to-b from-amber-50/60 to-stone-50 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700/80">
            {t("detail.teaser_eyebrow")}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-stone-900">
            {t("detail.teaser_title")}
          </h2>
          <div className="mt-4">
            {renderPortableText(book.teaserExcerpt, t("detail.teaser_empty"))}
          </div>
        </section>
      ) : null}

      {book.externalLinks.length > 0 ? (
        <section className="rounded-[2rem] border border-stone-200/70 bg-white/70 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
            {t("detail.physical_section")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {t("detail.physical_subtitle")}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {book.externalLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 transition hover:bg-stone-50"
                >
                  {link.name}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7M21 3l-9 9M5 7v12h12" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
