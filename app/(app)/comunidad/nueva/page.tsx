import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/features/auth/server/require-user";
import { isCommunityEnabled } from "@/lib/feature-flags";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";
import { ThreadForm } from "@/components/community/thread-form";

export const metadata: Metadata = {
  title: "Nueva conversacion — Comunidad FlavIA",
  description: "Abre una conversacion con la comunidad.",
};

export default async function NuevaConversacionPage() {
  if (!isCommunityEnabled()) notFound();

  const user = await requireUser();
  const viewer = await getViewerPlan();

  // Plus-only gate
  const isPlus = viewer.plan && viewer.plan.plan !== BILLING_FREE_PLAN && viewer.plan.status !== "canceled";
  if (!isPlus) {
    redirect("/plans");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <a href="/comunidad" className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          &larr; Volver a la comunidad
        </a>
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          Nueva conversacion
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Abre un tema
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          Comparte una pregunta, reflexion o experiencia. La comunidad esta para escucharte.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200/50 bg-white/80 p-6 shadow-[0_2px_12px_rgba(180,120,100,0.06)]">
        <ThreadForm />
      </div>
    </div>
  );
}
