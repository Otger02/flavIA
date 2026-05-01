import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { BookCover3D } from "@/components/books/book-cover-3d";
import { listBooks } from "@/features/books/server/get-books";
import { listOwnedBookSlugs } from "@/features/books/server/book-purchases";
import { getUser } from "@/features/auth/server/get-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("books");
  return {
    title: t("list.meta_title"),
    description: t("list.meta_description"),
  };
}

export const dynamic = "force-dynamic";

function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BooksListingPage() {
  const t = await getTranslations("books");
  const [books, user] = await Promise.all([listBooks(), getUser()]);
  const owned = user ? await listOwnedBookSlugs(user.id) : [];
  const ownedSet = new Set(owned);

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">{t("list.eyebrow")}</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-900">
          {t("list.title")}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">
          {t("list.subtitle")}
        </p>
      </div>

      {books.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 p-8 text-sm leading-6 text-stone-600">
          {t("list.empty_state")}
        </div>
      ) : (
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const owns = ownedSet.has(book.slug);
            return (
              <li key={book.id}>
                <Link
                  href={`/libros/${book.slug}`}
                  className="group flex flex-col items-center gap-5 rounded-[2rem] border border-stone-200/60 bg-white/70 px-6 pb-7 pt-10 text-center shadow-[0_18px_46px_rgba(61,42,24,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(61,42,24,0.14)]"
                >
                  <BookCover3D src={book.coverImageUrl} alt={book.title} size="listing" />
                  <div className="space-y-1.5">
                    <h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-stone-900">
                      {book.title}
                    </h2>
                    {book.subtitle ? (
                      <p className="text-sm leading-5 text-stone-600">{book.subtitle}</p>
                    ) : null}
                  </div>
                  <div className="mt-auto flex items-center gap-3">
                    {owns ? (
                      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-700">
                        {t("list.owned_badge")}
                      </span>
                    ) : (
                      <span className="font-[family-name:var(--font-display)] text-lg text-stone-900">
                        {formatCop(book.priceCop)}
                      </span>
                    )}
                    <span className="text-sm font-medium text-stone-700 underline underline-offset-4 transition group-hover:text-rose-600">
                      {t("list.detail_cta")}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
