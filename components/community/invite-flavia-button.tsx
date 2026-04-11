"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type InviteFlaviaButtonProps = {
  threadId: string;
  hasAiReply: boolean;
};

export function InviteFlaviaButton({ threadId, hasAiReply }: InviteFlaviaButtonProps) {
  const tc = useTranslations("community");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    hasAiReply ? "done" : "idle"
  );

  async function handleInvite() {
    setState("loading");
    try {
      const res = await fetch("/api/community/invite-flavia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }

      setState("done");
      window.location.reload();
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="text-xs text-stone-400">
        {tc("invite_flavia.done")}
      </span>
    );
  }

  return (
    <button
      onClick={handleInvite}
      disabled={state === "loading"}
      className="rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-2 text-xs font-medium text-rose-600 transition-all hover:bg-rose-100/60 disabled:opacity-50"
    >
      {state === "loading" ? tc("invite_flavia.loading") : state === "error" ? tc("invite_flavia.error") : tc("invite_flavia.idle")}
    </button>
  );
}
