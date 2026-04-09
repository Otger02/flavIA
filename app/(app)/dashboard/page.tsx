import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { getUser } from "@/features/auth/server/get-user";
import { getLatestChatSession } from "@/features/chat/server/get-latest-chat-session";
import { getRecentChatSessions } from "@/features/chat/server/get-recent-chat-sessions";
import { getChatHistory } from "@/features/chat/server/get-chat-history";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";
import { getLibraryItems } from "@/features/library";
import { getUserFavorites } from "@/features/favorites/server/get-user-favorites";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";
import { TopicStarterCards } from "@/components/chat/topic-starter-cards";
import { EmotionalProgress } from "@/components/dashboard/emotional-progress";
import { SessionSummaryCard } from "@/components/dashboard/session-summary-card";

export const metadata: Metadata = {
  title: "Mi Espacio",
  description:
    "Tu espacio personal en Flavia. Retoma conversaciones, revisa tu progreso emocional y descubre contenido recomendado.",
};

export const dynamic = "force-dynamic";

const TOPIC_LABELS: Record<string, string> = {
  desire: "Deseo",
  communication: "Comunicación",
  couple_connection: "Conexión en pareja",
  jealousy: "Celos",
  boundaries: "Límites",
  pleasure: "Placer",
  self_connection: "Conexión contigo",
  routine: "Rutina",
  body_confidence: "Cuerpo",
  curiosity: "Curiosidad",
};

const TOPIC_COLORS: Record<string, string> = {
  desire: "bg-rose-100 text-rose-700",
  communication: "bg-violet-100 text-violet-700",
  couple_connection: "bg-pink-100 text-pink-700",
  jealousy: "bg-amber-100 text-amber-700",
  boundaries: "bg-sky-100 text-sky-700",
  pleasure: "bg-fuchsia-100 text-fuchsia-700",
  self_connection: "bg-teal-100 text-teal-700",
  routine: "bg-stone-100 text-stone-700",
  body_confidence: "bg-orange-100 text-orange-700",
  curiosity: "bg-indigo-100 text-indigo-700",
};

function topicColor(topic: string | null): string {
  if (!topic) return "bg-rose-50 text-rose-600";
  return TOPIC_COLORS[topic] ?? "bg-rose-50 text-rose-600";
}

function topicLabel(topic: string | null): string {
  if (!topic) return "General";
  return TOPIC_LABELS[topic] ?? topic;
}

function getGreeting(): { greeting: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { greeting: "Buenos días", emoji: "☀️" };
  if (hour < 18) return { greeting: "Buenas tardes", emoji: "🌤️" };
  return { greeting: "Buenas noches", emoji: "🌙" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} día${days > 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  return `hace ${weeks} sem`;
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) return null;

  const [latestSession, recentSessions, viewer, libraryItems, userFavorites] = await Promise.all([
    getLatestChatSession({ userId: user.id }),
    getRecentChatSessions({ userId: user.id, limit: 5 }),
    getViewerPlan(),
    getLibraryItems(),
    getUserFavorites({ userId: user.id, itemType: "content" }),
  ]);

  const lastMessage = latestSession
    ? await getChatHistory({ sessionId: latestSession.id, limit: 1 }).then((msgs) => msgs.at(-1) ?? null)
    : null;

  const activeTopic = latestSession?.activeTopic ?? null;
  const hasSessions = recentSessions.length > 0;
  const isFree = !viewer.plan || viewer.plan.plan === BILLING_FREE_PLAN;
  const { greeting } = getGreeting();

  // Cross-reference favorites with library items to get full item data
  const favoriteItemIds = new Set(userFavorites.map((f) => f.itemId));
  const favoriteItems = libraryItems.filter((item) => favoriteItemIds.has(item.id));

  // Filter library by active topic if available, fallback to all — exclude favorites to avoid dupes
  const topicItems = activeTopic
    ? libraryItems.filter((item) => item.topicTags.includes(activeTopic) && !favoriteItemIds.has(item.id))
    : libraryItems.filter((item) => !favoriteItemIds.has(item.id));
  const displayItems = (topicItems.length >= 3 ? topicItems : libraryItems.filter((item) => !favoriteItemIds.has(item.id))).slice(0, 3);

  // Pick a daily Flavia quote based on date
  const FLAVIA_QUOTES = [
    "Lo que no se habla no existe.",
    "El deseo es como un músculo — si lo ejercitas, se hace cada vez más fuerte.",
    "La intimidad no empieza cuando se apaga la luz. Empieza en cómo te miran.",
    "No hay una forma correcta de ser mujer en la cama. Hay tantas formas como mujeres.",
    "Poner un límite no te vuelve fría. Te vuelve clara.",
    "La sexualidad es como LEGO — nunca la armamos de la misma manera.",
    "Preliminares arrancan cuando uno termina la relación sexual.",
    "Hay que desconstruirse para construir.",
    "Felicidad no es euforia. Felicidad es sinónimo de tranquilidad.",
    "Una mujer que se liberta, liberta a otras mujeres.",
  ];
  const dayIndex = Math.floor(Date.now() / 86400000) % FLAVIA_QUOTES.length;
  const dailyQuote = FLAVIA_QUOTES[dayIndex];

  return (
    <div className="space-y-8">
      {/* Greeting + quick chat button */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-900">
            {greeting}
          </h1>
          <p className="mt-2 text-base leading-7 text-stone-600">
            {hasSessions
              ? "¿Qué necesitas hoy?"
              : "Bienvenida. Este es tu lugar."}
          </p>
        </div>
        <Link
          href="/chat"
          className="hidden shrink-0 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.30)] sm:inline-flex"
        >
          Hablar con Flavia
        </Link>
      </div>

      {/* Daily Flavia quote */}
      <div className="rounded-[1.5rem] border border-rose-200/30 bg-gradient-to-r from-rose-50/40 via-white/60 to-rose-50/30 px-6 py-4">
        <p className="text-center text-sm italic leading-7 text-stone-600">
          &ldquo;{dailyQuote}&rdquo;
        </p>
        <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-rose-300">
          — Flavia Dos Santos
        </p>
      </div>

      {hasSessions ? (
        <>
          {/* Emotional progress */}
          <EmotionalProgress recentSessions={recentSessions} topicLabel={topicLabel} />

          {/* Resume + Plan row */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Resume conversation card */}
            <div className="rounded-[1.5rem] border border-rose-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.08)] backdrop-blur">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
                Retoma tu conversación
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${topicColor(activeTopic)}`}>
                  {topicLabel(activeTopic)}
                </span>
                <span className="text-xs text-stone-400">{timeAgo(latestSession!.createdAt)}</span>
              </div>
              {lastMessage ? (
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-600 italic">
                  &ldquo;{lastMessage.content}&rdquo;
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/chat"
                  className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5"
                >
                  Continuar
                </Link>
                <Link
                  href="/chat"
                  className="rounded-full border border-stone-200/60 bg-white/80 px-5 py-2.5 text-xs font-medium text-stone-700 transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50"
                >
                  Nueva sesión
                </Link>
              </div>
            </div>

            {/* Plan card */}
            <div className={`rounded-[1.5rem] border p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)] backdrop-blur ${isFree ? "border-stone-200/50 bg-white/80" : "border-amber-200/50 bg-gradient-to-br from-amber-50/50 via-white/80 to-rose-50/50"}`}>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Tu plan</p>
                {!isFree && (
                  <span className="rounded-full bg-gradient-to-r from-amber-100 to-rose-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-600">
                    Plus
                  </span>
                )}
              </div>
              {isFree ? (
                <>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl text-stone-900">Gratis</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Tienes mensajes limitados por sesión.
                  </p>
                  <Link
                    href="/plans"
                    className="mt-5 inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5"
                  >
                    Accede a Plus
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl text-stone-900">
                    Flavia Plus
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                      Activo
                    </span>
                  </p>
                  <Link
                    href="/account"
                    className="mt-5 inline-flex rounded-full border border-stone-200/60 bg-white/80 px-5 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Gestionar
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Session summary */}
          {latestSession && latestSession.messageCount >= 4 ? (
            <SessionSummaryCard sessionId={latestSession.id} />
          ) : null}

          {/* For you now */}
          <div className="rounded-[1.5rem] bg-gradient-to-br from-rose-50/30 to-transparent p-6 -mx-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">Para ti ahora</p>
            <p className="mt-2 text-sm text-stone-500">
              {activeTopic
                ? `Relacionado con lo que estás trabajando: ${topicLabel(activeTopic).toLowerCase()}`
                : "Piezas de la biblioteca para seguir explorando"}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/library/${item.slug}`}
                  className="group overflow-hidden rounded-[1.25rem] border border-stone-200/50 bg-white/80 shadow-[0_8px_24px_rgba(180,120,100,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(180,120,100,0.12)]"
                >
                  {item.coverImageUrl ? (
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-rose-50 to-stone-50">
                      <span className="text-xs uppercase tracking-[0.2em] text-rose-300">
                        {item.contentType}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                      {item.contentType}
                    </p>
                    <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-base text-stone-900">
                      {item.title}
                    </h3>
                    {item.isPremium ? (
                      <span className="mt-2 inline-block rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-rose-500">
                        Plus
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Favorites */}
          {favoriteItems.length > 0 ? (
            <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-50/30 via-transparent to-rose-50/20 p-6 -mx-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
                Tus favoritos
              </p>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {favoriteItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/library/${item.slug}`}
                    className="group min-w-[200px] flex-shrink-0 overflow-hidden rounded-[1.25rem] border border-stone-200/50 bg-white/80 shadow-[0_8px_24px_rgba(180,120,100,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(180,120,100,0.12)] sm:min-w-0"
                  >
                    {item.coverImageUrl ? (
                      <div className="aspect-video overflow-hidden bg-stone-100">
                        <Image
                          src={item.coverImageUrl}
                          alt={item.title}
                          width={400}
                          height={225}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-rose-50 to-stone-50">
                        <span className="text-xs uppercase tracking-[0.2em] text-rose-300">
                          {item.contentType}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                        {item.contentType}
                      </p>
                      <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-base text-stone-900">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Recent sessions */}
          {recentSessions.length > 1 ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
                Tus conversaciones
              </p>
              <div className="mt-3 divide-y divide-stone-200/50 overflow-hidden rounded-[1.25rem] border border-stone-200/50 bg-white/80 shadow-[0_8px_24px_rgba(180,120,100,0.04)]">
                {recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    href="/chat"
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-rose-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${topicColor(session.activeTopic)}`}>
                        {topicLabel(session.activeTopic)}
                      </span>
                      <span className="text-xs text-stone-400">{timeAgo(session.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-400">{session.messageCount} mensajes</span>
                      <span className="text-xs font-medium text-rose-500">Retomar</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {/* First-time empty state */}
          <div className="rounded-[2rem] border border-rose-200/40 bg-gradient-to-b from-white/90 to-rose-50/50 p-8 text-center shadow-[0_20px_60px_rgba(180,120,100,0.08)]">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
              Empieza tu primera conversación
            </p>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-stone-600">
              Puedes hablar de cualquier cosa. Sin juicio, sin prisa. Flavia te acompaña desde el primer mensaje.
            </p>
            <Link
              href="/chat"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-7 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.30)]"
            >
              Hablar con Flavia
            </Link>
          </div>

          {/* Topic entry points */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">O elige un tema</p>
            <p className="mt-2 text-sm text-stone-500">
              Si no sabes por dónde empezar, elige lo que más te resuene
            </p>
            <div className="mt-4">
              <TopicStarterCards />
            </div>
          </div>

          {/* Library for newcomers */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">Para empezar</p>
            <p className="mt-2 text-sm text-stone-500">
              Piezas de la biblioteca para conocer a Flavia
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/library/${item.slug}`}
                  className="group overflow-hidden rounded-[1.25rem] border border-stone-200/50 bg-white/80 shadow-[0_8px_24px_rgba(180,120,100,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(180,120,100,0.12)]"
                >
                  {item.coverImageUrl ? (
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-rose-50 to-stone-50">
                      <span className="text-xs uppercase tracking-[0.2em] text-rose-300">
                        {item.contentType}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                      {item.contentType}
                    </p>
                    <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-base text-stone-900">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Upgrade card for free users */}
          {isFree ? (
            <div className="rounded-[1.5rem] border border-rose-200/40 bg-gradient-to-br from-white/90 to-rose-50/50 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)]">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">Flavia Plus</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-lg text-stone-900">
                Conversaciones sin límite
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Accede a todo el contenido premium y chatea con Flavia cuanto necesites.
              </p>
              <Link
                href="/plans"
                className="mt-5 inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5"
              >
                Ver planes
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
