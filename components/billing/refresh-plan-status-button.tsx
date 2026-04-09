"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function RefreshPlanStatusButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [justRefreshed, setJustRefreshed] = useState(false);

  function handleRefresh() {
    startTransition(() => {
      setJustRefreshed(false);
      router.refresh();
      setJustRefreshed(true);
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isPending}
        className="rounded-full border border-stone-200/60 bg-white/80 px-4 py-2 text-xs font-medium text-stone-700 transition hover:-translate-y-0.5 hover:bg-stone-50 disabled:opacity-60"
      >
        {isPending ? "Actualizando..." : "Refrescar estado del plan"}
      </button>
      {justRefreshed ? <p className="text-xs text-stone-500">Estado refrescado.</p> : null}
    </div>
  );
}
