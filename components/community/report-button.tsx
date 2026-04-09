"use client";

import { useState } from "react";

type ReportButtonProps = {
  targetType: "thread" | "comment" | "story";
  targetId: string;
};

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Acoso" },
  { value: "inappropriate", label: "Contenido inapropiado" },
  { value: "misinformation", label: "Desinformacion" },
  { value: "off_topic", label: "Fuera de tema" },
  { value: "other", label: "Otro" },
] as const;

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleReport(reason: string) {
    setState("submitting");
    try {
      const res = await fetch("/api/community/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });

      if (res.status === 409) {
        setState("done");
        return;
      }

      if (!res.ok) throw new Error();

      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <span className="text-[10px] text-stone-400">Reportado</span>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
        title="Reportar"
      >
        Reportar
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-stone-200/60 bg-white p-2 shadow-lg">
            {REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => { handleReport(r.value); setOpen(false); }}
                disabled={state === "submitting"}
                className="w-full rounded-lg px-3 py-2 text-left text-xs text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
