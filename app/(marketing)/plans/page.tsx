import Link from "next/link";

import { BillingReturnNotice } from "@/components/billing/billing-return-notice";
import { BillingActionButton } from "@/components/billing/billing-action-button";
import { BILLING_PLUS_PRODUCT_NAME, BILLING_FREE_PLAN } from "@/features/billing/constants";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";

export const dynamic = "force-dynamic";

type PlansPageProps = {
  searchParams: Promise<{
    checkout?: string;
  }>;
};

function hasManageBillingAccess(plan: { plan: string; status: string } | null) {
  if (!plan) {
    return false;
  }

  return plan.plan !== BILLING_FREE_PLAN && ["active", "trialing", "past_due"].includes(plan.status);
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const params = await searchParams;
  const viewer = await getViewerPlan();
  const showManageBilling = hasManageBillingAccess(viewer.plan);
  const checkoutStatus =
    params.checkout === "success" || params.checkout === "cancelled" ? params.checkout : null;
  const awaitingSync = checkoutStatus === "success" && viewer.plan?.plan === BILLING_FREE_PLAN;

  return (
    <section className="space-y-8">
      <BillingReturnNotice status={checkoutStatus} awaitingSync={awaitingSync} />

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">Tu inversión en ti</p>
        <h1 className="max-w-xl font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900">
          Un espacio que cuida cómo cuidas tus relaciones
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">
          Empieza gratis. Cuando sientas que necesitas más profundidad, Flavia Plus te abre la puerta sin límites.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-stone-200/80 bg-white/80 p-7 shadow-[0_20px_60px_rgba(180,120,100,0.06)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Gratis</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">Para empezar</h2>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            Unos primeros mensajes para que sientas cómo es hablar con Flavia. Sin compromiso, sin tarjeta.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-rose-300">&#10003;</span>
              Conversaciones limitadas por sesión
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-rose-300">&#10003;</span>
              Acceso a la biblioteca pública
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-rose-300">&#10003;</span>
              Recomendaciones personalizadas
            </li>
          </ul>
        </article>

        <article className="relative overflow-hidden rounded-[2rem] border border-rose-400/20 bg-gradient-to-br from-stone-950 to-[#1a1210] p-7 text-stone-50 shadow-[0_24px_80px_rgba(120,40,40,0.18)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,100,100,0.08),transparent_50%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-400/70">Sin límites</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">
                  {BILLING_PLUS_PRODUCT_NAME}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-stone-400">
                  Conversaciones ilimitadas. Contenido premium. Todo el acompañamiento que necesites, sin reloj.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-rose-400">&#10003;</span>
                Chat ilimitado con Flavia
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-rose-400">&#10003;</span>
                Contenido exclusivo en la biblioteca
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-rose-400">&#10003;</span>
                Memoria entre sesiones
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-rose-400">&#10003;</span>
                Soporte prioritario
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              {showManageBilling ? (
                <BillingActionButton
                  mode="manage"
                  label="Gestionar suscripción"
                  pendingLabel="Abriendo portal..."
                  returnPath="/account"
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-950 transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                />
              ) : (
                <BillingActionButton
                  mode="checkout"
                  plan="plus"
                  label="Quiero Flavia Plus"
                  pendingLabel="Preparando..."
                  disabled={!viewer.userId}
                  successPath="/account?checkout=success"
                  cancelPath="/plans?checkout=cancelled"
                  className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.25)] transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                />
              )}
            </div>

            {!viewer.userId ? (
              <p className="mt-4 text-sm text-stone-500">
                <Link href="/login" className="text-rose-400 underline underline-offset-2 transition-colors hover:text-rose-300">Entra primero</Link> para poder suscribirte.
              </p>
            ) : null}

            {checkoutStatus === "success" && awaitingSync ? (
              <p className="mt-4 text-sm text-stone-500">
                Stripe ya ha confirmado el pago. Tu acceso se actualizará en unos segundos.
              </p>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
