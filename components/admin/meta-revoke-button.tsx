"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  integrationId: string;
};

export function MetaRevokeButton({ integrationId }: Props) {
  const t = useTranslations("admin.integrations.meta");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel the "are you sure" prompt after 5s of inaction.
      setTimeout(() => setConfirming(false), 5000);
      return;
    }

    startTransition(async () => {
      setError(null);
      const response = await fetch("/api/integrations/meta/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId }),
      });
      if (!response.ok) {
        setError(t("revoke_error"));
        setConfirming(false);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-full px-4 py-2 text-xs font-medium transition disabled:opacity-60 ${
          confirming
            ? "bg-rose-700 text-white hover:bg-rose-800"
            : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
        }`}
      >
        {isPending
          ? t("revoke_pending")
          : confirming
            ? t("revoke_confirm")
            : t("revoke_cta")}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
