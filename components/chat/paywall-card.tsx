import { BillingActionButton } from "@/components/billing/billing-action-button";
import { getTranslations } from "next-intl/server";

type PaywallCardProps = {
  message?: string;
};

export async function PaywallCard({
  message,
}: PaywallCardProps) {
  const t = await getTranslations("billing");
  const resolvedMessage = message ?? t("paywall_card.default_message");

  return (
    <div className="mb-4 rounded-[1.5rem] border border-rose-200/50 bg-gradient-to-b from-white/90 to-rose-50/60 p-5 shadow-[0_12px_40px_rgba(180,120,100,0.08)]">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("paywall_card.eyebrow")}</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">
        {t("paywall_card.title")}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{resolvedMessage}</p>
      <div className="mt-4">
        <BillingActionButton
          mode="checkout"
          plan="plus"
          label={t("paywall_card.cta")}
          className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"
        />
      </div>
    </div>
  );
}