import { BillingActionButton } from "@/components/billing/billing-action-button";

type PaywallCardProps = {
  message?: string;
};

export function PaywallCard({
  message = "Has llegado al limite gratuito de esta sesion.",
}: PaywallCardProps) {
  return (
    <div className="mb-4 rounded-[1.5rem] border border-amber-400/30 bg-amber-400/10 p-5 text-amber-50">
      <p className="text-xs uppercase tracking-[0.25em] text-amber-200">Free limit reached</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-white">
        Sigue conversando con Flavia Plus
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50/90">{message}</p>
      <div className="mt-4">
        <BillingActionButton
          mode="checkout"
          plan="pro"
          label="Upgrade a Flavia Plus"
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 disabled:opacity-60"
        />
      </div>
    </div>
  );
}