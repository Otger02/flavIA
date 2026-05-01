"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

type BookBuyButtonProps = {
  slug: string;
  priceLabel: string;
  /**
   * False when STRIPE_BOOK_PRICE_30K is unset on the server. Renders a
   * disabled "Próximamente" pill instead of triggering Stripe checkout.
   */
  available: boolean;
  /**
   * False when no user is logged in. Renders a "Inicia sesión para comprar"
   * link to /login.
   */
  isAuthenticated: boolean;
};

export function BookBuyButton({
  slug,
  priceLabel,
  available,
  isAuthenticated,
}: BookBuyButtonProps) {
  const t = useTranslations("books");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!available) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-full border border-stone-300/70 bg-stone-100 px-6 py-3 text-sm font-medium text-stone-500"
          aria-disabled
        >
          {t("detail.coming_soon")}
        </button>
        <p className="text-xs leading-5 text-stone-500">
          {t("detail.coming_soon_note")}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/login?redirectTo=/libros"
        className="inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.22)] transition hover:-translate-y-0.5"
      >
        {t("detail.login_to_buy")}
      </a>
    );
  }

  function handleClick() {
    startTransition(async () => {
      setError(null);

      try {
        const response = await fetch("/api/checkout/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const json = (await response.json().catch(() => null)) as
          | { url?: string; error?: string }
          | null;

        if (!response.ok || !json?.url) {
          setError(json?.error ?? t("detail.checkout_error"));
          return;
        }

        window.location.href = json.url;
      } catch {
        setError(t("detail.checkout_error"));
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.22)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isPending ? t("detail.buy_pending") : t("detail.buy_cta", { price: priceLabel })}
      </button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
