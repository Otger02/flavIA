"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[marketing] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400">Error</p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Algo salió mal
        </h2>
        <p className="max-w-sm text-sm leading-6 text-stone-600">
          No hemos podido cargar esta página. Inténtalo de nuevo o vuelve al inicio.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full border border-stone-200 bg-white px-6 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-2.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.18)] transition duration-200 hover:-translate-y-0.5"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
