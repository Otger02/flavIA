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
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Plans</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-900">
          Simple billing entry point for Flavia
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-700">
          Upgrade to unlock unlimited chat and keep a direct path to manage your subscription.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-[0_20px_60px_rgba(61,42,24,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Free</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">Starter</h2>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            Limited chat access with a short free session cap.
          </p>
        </article>

        <article className="rounded-[2rem] border border-stone-900 bg-stone-950 p-6 text-stone-50 shadow-[0_24px_80px_rgba(28,20,13,0.25)]">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Paid</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">
                {BILLING_PLUS_PRODUCT_NAME}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-stone-300">
                Unlimited chat and the billing layer already connected to Stripe and Supabase.
              </p>
            </div>
            <div className="rounded-full border border-white/15 px-4 py-2 text-sm text-stone-300">Live billing</div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-stone-300">
            <p>Current plan: {viewer.plan?.plan ?? "guest"}</p>
            <p>Status: {viewer.plan?.status ?? "not_signed_in"}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {showManageBilling ? (
              <BillingActionButton
                mode="manage"
                label="Manage Billing"
                pendingLabel="Opening billing portal..."
                returnPath="/account"
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 disabled:opacity-60"
              />
            ) : (
              <BillingActionButton
                mode="checkout"
                plan="pro"
                label="Upgrade a Flavia Plus"
                pendingLabel="Redirecting to Stripe..."
                disabled={!viewer.userId}
                successPath="/account?checkout=success"
                cancelPath="/plans?checkout=cancelled"
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 disabled:opacity-60"
              />
            )}
          </div>

          {!viewer.userId ? (
            <p className="mt-4 text-sm text-stone-400">
              Sign in first if you want checkout and billing portal actions to succeed.
            </p>
          ) : null}

          {checkoutStatus === "success" && awaitingSync ? (
            <p className="mt-4 text-sm text-stone-400">
              Stripe ya ha confirmado el pago, pero la suscripción puede tardar unos segundos en reflejarse aquí.
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}