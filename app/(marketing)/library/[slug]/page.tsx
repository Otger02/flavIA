import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getUser } from "@/features/auth/server/get-user";
import { getUserPlan } from "@/features/billing/server/get-user-plan";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";
import { getLibraryItemBySlug } from "@/features/library/server/get-library-item-by-slug";
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

export const dynamic = "force-dynamic";

type LibraryItemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: LibraryItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getLibraryItemBySlug(slug);

  if (!item) {
    return { title: "Contenido no encontrado" };
  }

  const description =
    item.excerpt ??
    "Explora este contenido de la biblioteca de Flavia Dos Santos sobre bienestar íntimo y emocional.";

  return {
    title: item.title,
    description,
    openGraph: {
      title: `${item.title} — Flavia`,
      description,
      url: `https://flavia.app/library/${slug}`,
      ...(item.coverImageUrl
        ? { images: [{ url: item.coverImageUrl, alt: item.title }] }
        : {}),
    },
  };
}

function renderBody(body: unknown[]) {
  const textBlocks = body
    .filter((block): block is { _type?: string; children?: Array<{ text?: string }> } => typeof block === "object" && block !== null)
    .filter((block) => block._type === "block")
    .map((block) => block.children?.map((child) => child.text ?? "").join("") ?? "")
    .filter(Boolean);

  if (textBlocks.length === 0) {
    return <p className="text-base leading-8 text-stone-700">This item does not have body content yet.</p>;
  }

  return (
    <div className="space-y-5">
      {textBlocks.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`} className="text-base leading-8 text-stone-700">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default async function LibraryItemPage({ params }: LibraryItemPageProps) {
  const { slug } = await params;
  const [item, user] = await Promise.all([getLibraryItemBySlug(slug), getUser()]);

  if (!item) {
    notFound();
  }

  // Gate premium content behind auth + active plan
  if (item.isPremium) {
    const plan = user ? await getUserPlan({ userId: user.id }) : null;
    const hasAccess = plan && plan.plan !== BILLING_FREE_PLAN && plan.status !== "canceled";

    if (!hasAccess) {
      return (
        <article className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            {item.coverImageUrl ? (
              <div className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-stone-200 shadow-[0_20px_60px_rgba(61,42,24,0.08)]">
                <Image
                  src={item.coverImageUrl}
                  alt={item.title}
                  width={1600}
                  height={900}
                  className="aspect-[16/8] w-full object-cover"
                />
              </div>
            ) : null}
            <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-rose-600">
              Premium
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-5xl leading-none text-stone-900">
              {item.title}
            </h1>
            {item.excerpt ? <p className="max-w-3xl text-lg leading-8 text-stone-700">{item.excerpt}</p> : null}
          </header>

          <section className="rounded-[2rem] border border-rose-200/60 bg-gradient-to-b from-white to-rose-50/50 p-8 text-center shadow-[0_20px_60px_rgba(180,120,100,0.10)]">
            <p className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
              Este contenido es exclusivo para suscriptoras
            </p>
            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-stone-600">
              Con Flavia Plus tienes acceso a toda la biblioteca, recomendaciones personalizadas y conversaciones ilimitadas.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              {user ? (
                <Link
                  href="/plans"
                  className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-8 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.20)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.30)]"
                >
                  Quiero Flavia Plus
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-8 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.20)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.30)]"
                  >
                    Entra para suscribirte
                  </Link>
                  <p className="text-xs text-stone-500">Ya tienes cuenta? <Link href="/login" className="underline underline-offset-2 hover:text-stone-700">Inicia sesión</Link></p>
                </>
              )}
            </div>
          </section>
        </article>
      );
    }
  }

  // Check if user has favorited this item
  const favorites = user ? await getUserFavorites({ userId: user.id, itemType: "content" }) : [];
  const isFavorited = favorites.some((f) => f.itemId === item.id);

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-4">
        {item.coverImageUrl ? (
          <div className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-stone-200 shadow-[0_20px_60px_rgba(61,42,24,0.08)]">
            <Image
              src={item.coverImageUrl}
              alt={item.title}
              width={1600}
              height={900}
              className="aspect-[16/8] w-full object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-500">{item.contentType}</p>
          {item.isPremium ? (
            <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-50">
              Premium
            </span>
          ) : null}
          {item.chatRecommended ? (
            <span className="rounded-full bg-stone-200 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-700">
              Recomendable en chat
            </span>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-[family-name:var(--font-display)] text-5xl leading-none text-stone-900">
            {item.title}
          </h1>
          {user ? <FavoriteButton itemId={item.id} itemType="content" initialFavorited={isFavorited} /> : null}
        </div>
        {item.excerpt ? <p className="max-w-3xl text-lg leading-8 text-stone-700">{item.excerpt}</p> : null}
        {item.editorialSource ? (
          <p className="text-sm leading-6 text-stone-500">{item.editorialSource}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {item.topicTags.map((tag) => {
            const colors = TOPIC_COLORS[tag] ?? { inactive: "bg-stone-100 text-stone-600" };
            return (
              <span key={tag} className={`rounded-full px-3 py-1 text-xs ${colors.inactive}`}>
                {tag}
              </span>
            );
          })}
          {item.intentTags.map((tag) => (
            <span key={tag} className="rounded-full bg-stone-200 px-3 py-1 text-xs text-stone-700">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {item.youtubeUrl ? (
        <section className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-black shadow-[0_20px_60px_rgba(61,42,24,0.08)]">
          <div className="aspect-video w-full">
            <iframe
              src={item.youtubeUrl}
              title={item.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      <section>{renderBody(item.body)}</section>

      {/* CTA: Habla con Flavia de esto */}
      {item.topicTags.length > 0 ? (
        <section className="rounded-[2rem] border border-rose-200/40 bg-gradient-to-b from-white/90 to-rose-50/50 p-8 text-center shadow-[0_20px_60px_rgba(180,120,100,0.08)]">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
            ¿Quieres hablar de esto?
          </p>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-stone-600">
            Si este tema te ha removido algo, Flavia puede ayudarte a profundizar.
          </p>
          <Link
            href={`/chat?topic=${item.topicTags[0]}`}
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-7 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.30)]"
          >
            Hablar con Flavia
          </Link>
        </section>
      ) : null}

      {item.relatedContent.length > 0 ? (
        <section className="space-y-4 rounded-[2rem] border border-stone-300/70 bg-white/75 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Relacionado</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-stone-900">
              Sigue explorando este tema
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {item.relatedContent.map((relatedItem) => (
              <article key={relatedItem.id} className="rounded-[1.5rem] border border-stone-300 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{relatedItem.contentType}</p>
                <h3 className="mt-2 text-xl font-semibold text-stone-900">{relatedItem.title}</h3>
                {relatedItem.editorialSource ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.15em] text-stone-500">{relatedItem.editorialSource}</p>
                ) : null}
                {relatedItem.excerpt ? <p className="mt-2 text-sm leading-6 text-stone-700">{relatedItem.excerpt}</p> : null}
                <Link href={`/library/${relatedItem.slug}`} className="mt-4 inline-block text-sm font-medium text-stone-900 underline underline-offset-4">
                  {relatedItem.youtubeUrl ? "Ver recurso" : "Abrir recurso"}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {item.relatedProducts.length > 0 ? (
        <section className="space-y-4 rounded-[2rem] border border-rose-900/20 bg-gradient-to-br from-stone-900 to-stone-800 p-6 text-stone-50">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Siguiente paso</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
              Si quieres ir más a fondo
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {item.relatedProducts.map((product) => (
              <Link key={product.href} href={product.href} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-200">
                {product.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}