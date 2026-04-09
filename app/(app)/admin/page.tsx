import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/server/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_EMAILS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin — Panel",
  description: "Panel de administración de Flavia",
};

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return "ahora mismo";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Build an inline SVG sparkline from daily counts */
function buildSparklinePath(dailyCounts: number[]): { path: string; max: number; points: string } {
  if (dailyCounts.length === 0) return { path: "", max: 0, points: "" };

  const max = Math.max(...dailyCounts, 1);
  const w = 100;
  const h = 40;
  const stepX = w / Math.max(dailyCounts.length - 1, 1);

  const coords = dailyCounts.map((v, i) => ({
    x: i * stepX,
    y: h - (v / max) * (h - 4) - 2,
  }));

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const points = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");

  return { path, max, points };
}

const TOPIC_LABELS: Record<string, string> = {
  desire: "Deseo", communication: "Comunicación", couple_connection: "Pareja",
  jealousy: "Celos", boundaries: "Límites", pleasure: "Placer",
  self_connection: "Conexión propia", routine: "Rutina",
  body_confidence: "Cuerpo", curiosity: "Curiosidad",
};

const TOPIC_COLORS: Record<string, string> = {
  desire: "bg-rose-100 text-rose-700", communication: "bg-violet-100 text-violet-700",
  couple_connection: "bg-pink-100 text-pink-700", jealousy: "bg-amber-100 text-amber-700",
  boundaries: "bg-sky-100 text-sky-700", pleasure: "bg-fuchsia-100 text-fuchsia-700",
  self_connection: "bg-teal-100 text-teal-700", routine: "bg-stone-100 text-stone-700",
  body_confidence: "bg-orange-100 text-orange-700", curiosity: "bg-indigo-100 text-indigo-700",
};

export default async function AdminPage() {
  const user = await requireUser();

  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect("/dashboard");
  }

  const supabase = await createServerSupabaseClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // ── All queries in parallel ──────────────────────────────────────
  const [
    // Usage stats
    { count: totalUsers },
    { count: totalSessions },
    { count: totalMessages },
    { count: sessionsToday },
    { count: sessionsWeek },
    { count: messagesToday },
    // Community stats
    { count: totalStories },
    { count: pendingStories },
    { count: totalThreads },
    { count: totalComments },
    { count: pendingReports },
    { count: totalFavorites },
    { count: totalFeedback },
    // Business metrics
    { count: plusUsers },
    { count: canceledThisMonth },
    // Activity data
    { data: recentSessions },
    { data: topTopics },
    { data: recentUsers },
    { data: messagesLast30d },
    // Moderation counts for alert banner
    { count: hiddenThreads },
    { count: hiddenComments },
  ] = await Promise.all([
    // Usage
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("chat_sessions").select("*", { count: "exact", head: true }),
    supabase.from("chat_messages").select("*", { count: "exact", head: true }),
    supabase.from("chat_sessions").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("chat_sessions").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("chat_messages").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    // Community
    supabase.from("user_stories").select("*", { count: "exact", head: true }),
    supabase.from("user_stories").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("community_threads").select("*", { count: "exact", head: true }),
    supabase.from("community_comments").select("*", { count: "exact", head: true }),
    supabase.from("community_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("user_favorites").select("*", { count: "exact", head: true }),
    supabase.from("user_feedback").select("*", { count: "exact", head: true }),
    // Business
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("plan_slug", "plus").eq("status", "active"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "canceled").gte("updated_at", monthStart),
    // Activity
    supabase.from("chat_sessions").select("id, user_id, active_topic, message_count, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("chat_sessions").select("active_topic").not("active_topic", "is", null).limit(500),
    supabase.from("profiles").select("id, email, plan_status, created_at, updated_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("chat_messages").select("created_at").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }),
    // Moderation
    supabase.from("community_threads").select("*", { count: "exact", head: true }).eq("status", "hidden"),
    supabase.from("community_comments").select("*", { count: "exact", head: true }).eq("status", "hidden"),
  ]);

  // ── Derived data ─────────────────────────────────────────────────

  // Topic counts
  const topicCounts: Record<string, number> = {};
  for (const s of topTopics ?? []) {
    const t = s.active_topic as string;
    topicCounts[t] = (topicCounts[t] ?? 0) + 1;
  }
  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Moderation alert: total pending items
  const pendingModerationCount = (pendingStories ?? 0) + (pendingReports ?? 0) + (hiddenThreads ?? 0) + (hiddenComments ?? 0);

  // Business metrics
  const totalUsersNum = totalUsers ?? 0;
  const plusUsersNum = plusUsers ?? 0;
  const conversionRate = totalUsersNum > 0 ? ((plusUsersNum / totalUsersNum) * 100).toFixed(1) : "0";

  // Messages per day sparkline (last 30 days)
  const dailyMessageCounts: number[] = [];
  const dayLabels: string[] = [];
  {
    const buckets = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
      dayLabels.push(d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }));
    }
    for (const msg of messagesLast30d ?? []) {
      const key = (msg.created_at as string).slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    for (const count of buckets.values()) {
      dailyMessageCounts.push(count);
    }
  }
  const sparkline = buildSparklinePath(dailyMessageCounts);
  const totalMessagesLast30 = dailyMessageCounts.reduce((a, b) => a + b, 0);
  const avgPerDay = dailyMessageCounts.length > 0 ? Math.round(totalMessagesLast30 / dailyMessageCounts.length) : 0;

  // ── Stats arrays ─────────────────────────────────────────────────

  const businessStats = [
    { label: "Usuarios Plus", value: plusUsersNum.toString(), accent: "text-amber-600" },
    { label: "Conversión", value: `${conversionRate}%`, accent: "text-emerald-600" },
    { label: "Cancelaciones (mes)", value: (canceledThisMonth ?? 0).toString(), accent: (canceledThisMonth ?? 0) > 0 ? "text-rose-600" : "text-stone-900" },
    { label: "Ingresos", value: "—", accent: "text-stone-400", note: true },
  ];

  const usageStats = [
    { label: "Usuarios", value: totalUsersNum, accent: "text-stone-900" },
    { label: "Sesiones totales", value: totalSessions ?? 0, accent: "text-stone-900" },
    { label: "Mensajes totales", value: totalMessages ?? 0, accent: "text-stone-900" },
    { label: "Sesiones hoy", value: sessionsToday ?? 0, accent: "text-emerald-600" },
    { label: "Sesiones semana", value: sessionsWeek ?? 0, accent: "text-emerald-600" },
    { label: "Mensajes hoy", value: messagesToday ?? 0, accent: "text-emerald-600" },
  ];

  const communityStats = [
    { label: "Hilos", value: totalThreads ?? 0 },
    { label: "Comentarios", value: totalComments ?? 0 },
    { label: "Historias", value: totalStories ?? 0 },
    { label: "Favoritos", value: totalFavorites ?? 0 },
    { label: "Feedback", value: totalFeedback ?? 0 },
  ];

  const stripeUrl = process.env.STRIPE_DASHBOARD_URL ?? "https://dashboard.stripe.com";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
            Admin
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-stone-900">
            Panel
          </h1>
        </div>
      </div>

      {/* ── Quick Actions Bar ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/moderacion"
          className="rounded-full border border-stone-200/60 bg-white/80 px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Ir a moderacion
        </Link>
        <Link
          href="/admin/stories"
          className="rounded-full border border-stone-200/60 bg-white/80 px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Historias
        </Link>
        <Link
          href="/library"
          className="rounded-full border border-stone-200/60 bg-white/80 px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Biblioteca
        </Link>
        <a
          href={stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-stone-200/60 bg-white/80 px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Ver en Stripe ↗
        </a>
      </div>

      {/* ── Moderation Alert Banner ───────────────────────────────── */}
      {pendingModerationCount > 0 && (
        <Link
          href="/admin/moderacion"
          className="flex items-center gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50/80 px-5 py-3.5 shadow-[0_4px_16px_rgba(200,150,50,0.08)] transition hover:-translate-y-0.5"
        >
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-white">
            {pendingModerationCount}
          </span>
          <span className="text-sm font-medium text-amber-800">
            {pendingModerationCount === 1
              ? "1 elemento pendiente de moderacion"
              : `${pendingModerationCount} elementos pendientes de moderacion`}
          </span>
          <span className="ml-auto text-xs text-amber-600">Revisar →</span>
        </Link>
      )}

      {/* ── Business Metrics ──────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Negocio</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {businessStats.map((stat) => (
            <div key={stat.label} className="rounded-[1.25rem] border border-stone-200/50 bg-white/80 p-4 shadow-[0_4px_16px_rgba(180,120,100,0.04)]">
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-400">{stat.label}</p>
              <p className={`mt-1.5 font-[family-name:var(--font-display)] text-2xl ${stat.accent}`}>
                {stat.value}
              </p>
              {stat.note && (
                <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-[10px] text-rose-400 hover:text-rose-600">
                  Ver en Stripe ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Usage Stats ───────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Uso</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {usageStats.map((stat) => (
            <div key={stat.label} className="rounded-[1.25rem] border border-stone-200/50 bg-white/80 p-4 shadow-[0_4px_16px_rgba(180,120,100,0.04)]">
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-400">{stat.label}</p>
              <p className={`mt-1.5 font-[family-name:var(--font-display)] text-2xl ${stat.accent}`}>
                {stat.value.toLocaleString("es-ES")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Trend (sparkline) ────────────────────────────── */}
      <div className="rounded-[1.5rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)]">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Mensajes últimos 30 días</p>
          <p className="text-xs text-stone-500">
            {totalMessagesLast30.toLocaleString("es-ES")} total · {avgPerDay}/día media
          </p>
        </div>
        {sparkline.path ? (
          <div className="mt-4">
            <svg viewBox="0 0 100 40" className="h-20 w-full" preserveAspectRatio="none">
              {/* Gradient fill under curve */}
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(251,113,133)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(251,113,133)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,40 ${sparkline.points} 100,40`}
                fill="url(#sparkGrad)"
              />
              <path
                d={sparkline.path}
                fill="none"
                stroke="rgb(244,63,94)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="mt-1 flex justify-between text-[9px] text-stone-300">
              <span>{dayLabels[0]}</span>
              <span>{dayLabels[Math.floor(dayLabels.length / 2)]}</span>
              <span>{dayLabels[dayLabels.length - 1]}</span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-400">Sin datos todavia</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Community & engagement */}
        <div className="rounded-[1.5rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)]">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Comunidad y engagement</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {communityStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-[family-name:var(--font-display)] text-xl text-stone-900">{s.value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top topics */}
        <div className="rounded-[1.5rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)]">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Temas mas hablados</p>
          {sortedTopics.length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {sortedTopics.map(([topic, count]) => {
                const max = sortedTopics[0][1];
                const pct = max > 0 ? (count / max) * 100 : 0;
                return (
                  <div key={topic} className="flex items-center gap-3">
                    <span className={`w-24 shrink-0 rounded-full px-2.5 py-0.5 text-center text-[11px] font-medium ${TOPIC_COLORS[topic] ?? "bg-stone-100 text-stone-600"}`}>
                      {TOPIC_LABELS[topic] ?? topic}
                    </span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-300 to-rose-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-xs text-stone-500">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone-400">Sin datos de temas todavia</p>
          )}
        </div>
      </div>

      {/* ── Recent Users ──────────────────────────────────────────── */}
      <div className="rounded-[1.5rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)]">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Usuarios recientes</p>
        {(recentUsers ?? []).length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-[10px] uppercase tracking-[0.1em] text-stone-400">
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Plan</th>
                  <th className="pb-2 pr-4 font-medium">Registro</th>
                  <th className="pb-2 font-medium">Ultima actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {(recentUsers ?? []).map((u) => {
                  const email = u.email as string | null;
                  const masked = email
                    ? `${email.slice(0, 3)}***@${email.split("@")[1] ?? "?"}`
                    : "—";
                  const planLabel = (u.plan_status as string) === "active" ? "Plus" : "Free";
                  const planColor = planLabel === "Plus" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500";
                  return (
                    <tr key={u.id} className="text-stone-600">
                      <td className="py-2.5 pr-4 font-mono text-xs">{masked}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${planColor}`}>
                          {planLabel}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-stone-400">{formatDate(u.created_at as string)}</td>
                      <td className="py-2.5 text-xs text-stone-400">{timeAgo(u.updated_at as string)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-400">No hay usuarios todavia</p>
        )}
      </div>

      {/* ── Recent Sessions ───────────────────────────────────────── */}
      <div className="rounded-[1.5rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)]">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Sesiones recientes</p>
        {(recentSessions ?? []).length > 0 ? (
          <div className="mt-4 divide-y divide-stone-100">
            {(recentSessions ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-stone-300">{(s.user_id as string).slice(0, 8)}</span>
                  {s.active_topic ? (
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TOPIC_COLORS[s.active_topic as string] ?? "bg-stone-100 text-stone-600"}`}>
                      {TOPIC_LABELS[s.active_topic as string] ?? s.active_topic}
                    </span>
                  ) : (
                    <span className="rounded-full bg-stone-50 px-2.5 py-0.5 text-[11px] text-stone-400">
                      Sin tema
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-stone-400">{s.message_count} msgs</span>
                  <span className="text-xs text-stone-400">{timeAgo(s.created_at as string)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-400">No hay sesiones todavia</p>
        )}
      </div>
    </div>
  );
}
