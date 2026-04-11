"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

type BillingActionButtonProps = {
  cancelPath?: string;
  className?: string;
  disabled?: boolean;
  label: string;
  mode: "checkout" | "manage";
  pendingLabel?: string;
  plan?: "pro" | "premium" | "plus";
  returnPath?: string;
  successPath?: string;
};

export function BillingActionButton({
  cancelPath = "/plans?checkout=cancelled",
  className,
  disabled = false,
  label,
  mode,
  pendingLabel,
  plan = "pro",
  returnPath = "/account",
  successPath = "/account?checkout=success",
}: BillingActionButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const tBilling = useTranslations("billing");

  function handleClick() {
    startTransition(async () => {
      setError(null);

      const origin = window.location.origin;
      const endpoint = mode === "checkout" ? "/api/checkout" : "/api/billing-portal";
      const payload =
        mode === "checkout"
          ? {
              plan,
              successUrl: `${origin}${successPath}`,
              cancelUrl: `${origin}${cancelPath}`,
            }
          : {
              returnUrl: `${origin}${returnPath}`,
            };

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const json = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

        if (!response.ok || !json?.url) {
          setError(json?.error ?? "Unable to continue with billing right now.");
          return;
        }

        window.location.href = json.url;
      } catch {
        setError("Unable to continue with billing right now.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPending}
        className={className ?? "rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"}
      >
        {isPending ? pendingLabel ?? (mode === "checkout" ? tBilling("action_button.checkout_pending") : tBilling("action_button.manage_pending")) : label}
      </button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}