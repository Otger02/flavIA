import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/features/professional-verification/server/admin-guard";
import { listSources } from "@/features/public-content/server/add-source";
import { listProposals } from "@/features/public-content/server/processor/extract-proposals";
import { PublicContentClient } from "@/components/admin/public-content-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public-content");
  return { title: t("page_title") };
}

export default async function PublicContentAdminPage() {
  await requireAdmin();
  const t = await getTranslations("public-content");

  const [sources, proposals] = await Promise.all([listSources(), listProposals()]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
          {t("page_eyebrow")}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {t("page_title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{t("page_subtitle")}</p>
      </div>

      <PublicContentClient sources={sources} proposals={proposals} />

      <p className="text-xs text-stone-500">
        <Link href="/admin" className="underline underline-offset-4 hover:text-stone-800">
          ← /admin
        </Link>
      </p>
    </div>
  );
}
