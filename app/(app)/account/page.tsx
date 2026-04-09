import type { Metadata } from "next";

import { BillingReturnNotice } from "@/components/billing/billing-return-notice";
import { BillingActionButton } from "@/components/billing/billing-action-button";
import { RefreshPlanStatusButton } from "@/components/billing/refresh-plan-status-button";
import { requireUser } from "@/features/auth/server/require-user";
import { BILLING_FREE_PLAN, BILLING_PLUS_PRODUCT_NAME } from "@/features/billing/constants";
import { getUserPlan } from "@/features/billing/server/get-user-plan";
import { getRecentChatSessions } from "@/features/chat/server/get-recent-chat-sessions";
import { getClickedRecommendations } from "@/features/recommendations/server/get-clicked-recommendations";

export const metadata: Metadata = {
  title: "Mi Cuenta",
  description:
    "Gestiona tu suscripción, revisa tus conversaciones recientes y controla tu cuenta en Flavia.",
};

type AccountPageProps = {
  searchParams: Promise<{
    checkout?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: undefined,
  }).format(new Date(value));
}

function formatTopic(topic: string | null) {
  if (!topic) {
    return "Sin tema detectado";
  }

  return topic.replaceAll("_", " ");
}

function formatStatus(status: string) {
  switch (status) {
    case "active":
      return "Activa";
    case "trialing":
      return "En prueba";
    case "past_due":
      return "Pago pendiente";
    case "canceled":
      return "Cancelada";
    default:
      return "Inactiva";
  }
}

function EmptyState({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-stone-200/50 bg-white/40 p-5">
      <p className="text-sm font-medium text-stone-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
    </div>
  );
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const [plan, recentSessions, clickedRecommendations] = await Promise.all([
    getUserPlan({ userId: user.id }),
    getRecentChatSessions({ userId: user.id }),
    getClickedRecommendations({ userId: user.id }),
  ]);

  const renewalDate = formatDate(plan.currentPeriodEnd);
  const hasBillingAccess = Boolean(plan.stripeCustomerId);
  const checkoutStatus =
    params.checkout === "success" || params.checkout === "cancelled" ? params.checkout : null;
  const awaitingSync = checkoutStatus === "success" && plan.plan === BILLING_FREE_PLAN;

  return (
    <section className="space-y-8">
      <BillingReturnNotice status={checkoutStatus} awaitingSync={awaitingSync} />

      <div className="space-y-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">Cuenta</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-900">Tu cuenta en Flavia</h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">
          Estado actual, continuidad de conversaciones y señales de actividad reciente en un solo sitio.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-[2rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_20px_60px_rgba(180,120,100,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Billing</p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">{plan.plan === "free" ? "Plan Free" : BILLING_PLUS_PRODUCT_NAME}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-rose-600">
                  {formatStatus(plan.status)}
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.15em] text-stone-500">
                  {plan.plan}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {hasBillingAccess ? (
                <BillingActionButton
                  mode="manage"
                  label="Gestionar"
                  pendingLabel="Abriendo portal..."
                  returnPath="/account"
                  className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                />
              ) : null}
              <RefreshPlanStatusButton />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-rose-200/40 bg-rose-50/50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">Estado de suscripción</p>
              <p className="mt-3 text-lg font-medium text-stone-900">{formatStatus(plan.status)}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {plan.plan === "free"
                  ? "Estás usando la capa gratuita de Flavia."
                  : "Tu suscripción está conectada a Stripe y disponible para gestión."}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-rose-200/40 bg-rose-50/50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">Próxima renovación</p>
              <p className="mt-3 text-lg font-medium text-stone-900">{renewalDate ?? "No disponible"}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {renewalDate
                  ? "Fecha sincronizada desde la suscripción actual."
                  : "Aparecerá aquí cuando exista un ciclo activo o en prueba."}
              </p>
            </div>
          </div>

          {!hasBillingAccess ? (
            <div className="mt-6 rounded-[1.5rem] border border-stone-200/50 bg-stone-50/50 p-4 text-sm leading-6 text-stone-600">
              {awaitingSync
                ? "Tu pago ya ha vuelto de Stripe. Estamos esperando la sincronización final de la suscripción para habilitar el portal de billing."
                : "Todavía no hay un portal de billing asociado a esta cuenta. Cuando actives un plan de pago, podrás gestionarlo desde aquí."}
            </div>
          ) : null}

          {awaitingSync ? (
            <p className="mt-4 text-sm text-stone-500">
              Si no ves el cambio inmediatamente, usa Refrescar estado del plan mientras Stripe termina de propagar el webhook.
            </p>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-stone-200/50 bg-gradient-to-b from-white/90 to-rose-50/30 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)]">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">Resumen</p>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-stone-500">Email</p>
              <p className="mt-1 text-base text-stone-900">{user.email ?? "No disponible"}</p>
            </div>
            <div>
              <p className="text-sm text-stone-500">Conversaciones recientes</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-stone-900">{recentSessions.length}</p>
            </div>
            <div>
              <p className="text-sm text-stone-500">Recomendaciones clicadas</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-stone-900">{clickedRecommendations.length}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)] backdrop-blur">
          <div className="mb-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">Últimas conversaciones</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">Continuidad del chat</h2>
          </div>

          {recentSessions.length === 0 ? (
            <EmptyState
              title="Aún no hay conversaciones"
              description="Cuando empieces a usar el chat, aquí verás tus sesiones recientes con tema detectado y volumen de mensajes."
            />
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <article key={session.id} className="rounded-[1.25rem] border border-stone-200/50 bg-white/60 p-4 transition-colors hover:bg-rose-50/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{formatTopic(session.activeTopic)}</p>
                      <p className="mt-1 text-xs text-stone-400">{formatDate(session.createdAt) ?? "Sin fecha"}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-600">
                      {session.messageCount} mensajes
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)] backdrop-blur">
          <div className="mb-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">Interacciones</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">Recomendaciones abiertas</h2>
          </div>

          {clickedRecommendations.length === 0 ? (
            <EmptyState
              title="Sin clics todavía"
              description="Cuando abras recomendaciones desde el chat, este historial te ayudará a retomar contenido y productos que ya te interesaron."
            />
          ) : (
            <div className="space-y-3">
              {clickedRecommendations.map((recommendation) => (
                <article key={recommendation.id} className="rounded-[1.25rem] border border-stone-200/50 bg-white/60 p-4 transition-colors hover:bg-rose-50/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{recommendation.title}</p>
                      <p className="mt-1 text-xs text-stone-400">{formatDate(recommendation.clickedAt) ?? "Sin fecha"}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-600">
                      {recommendation.type}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
