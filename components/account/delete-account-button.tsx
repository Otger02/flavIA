"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAccountButton() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setStep("loading");
    setError(null);

    const res = await fetch("/api/account/delete", { method: "DELETE" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No se pudo eliminar la cuenta. Inténtalo de nuevo o escríbenos a hola@flavia.app.");
      setStep("confirm");
      return;
    }

    setStep("done");
    setTimeout(() => router.push("/"), 2000);
  }

  if (step === "done") {
    return (
      <p className="text-sm text-stone-500">
        Tu cuenta ha sido eliminada. Te redirigimos en un momento...
      </p>
    );
  }

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("confirm")}
        className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
      >
        Eliminar mi cuenta
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-700">
        ¿Seguro? Esta acción es <span className="font-medium">permanente e irreversible</span>. Se eliminarán todas tus conversaciones, datos y preferencias.
      </p>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={step === "loading"}
          onClick={handleDelete}
          className="rounded-full bg-red-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
        >
          {step === "loading" ? "Eliminando..." : "Sí, eliminar mi cuenta"}
        </button>
        <button
          type="button"
          disabled={step === "loading"}
          onClick={() => { setStep("idle"); setError(null); }}
          className="rounded-full border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
