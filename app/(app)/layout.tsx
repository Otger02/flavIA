import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UpgradeBanner } from "@/components/billing/upgrade-banner";
import { requireUser } from "@/features/auth/server/require-user";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";
import { ADMIN_EMAILS } from "@/lib/constants";
import { isCommunityEnabled } from "@/lib/feature-flags";

type AppLayoutProps = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: AppLayoutProps) {
  const t = await getTranslations("navigation");
  const user = await requireUser();
  const viewer = await getViewerPlan();
  const isAdmin = !!user.email && ADMIN_EMAILS.includes(user.email);
  const isFree = !viewer.plan || viewer.plan.plan === BILLING_FREE_PLAN;
  const communityEnabled = isCommunityEnabled();

  const navLinks = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/chat", label: t("nav.chat") },
    { href: "/library", label: t("nav.library") },
    { href: "/plans", label: t("nav.plans") },
    ...(communityEnabled
      ? [{ href: "/comunidad", label: t("nav.community") }]
      : [{ href: "/stories", label: t("nav.stories") }]),
    { href: "/account", label: t("nav.account") },
    ...(isAdmin ? [{ href: "/admin", label: t("nav.admin") }] : []),
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="mb-8 flex items-center justify-between gap-4 border-b border-rose-200/40 pb-5">
          <Link href="/dashboard" className="group">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 transition-colors group-hover:text-stone-600">{t("brand.tagline")}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-stone-900">Flavia</p>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-stone-500 md:flex">
            <Link href="/dashboard" className="transition-colors hover:text-stone-900">{t("nav.dashboard")}</Link>
            <Link href="/chat" className="transition-colors hover:text-stone-900">{t("nav.chat")}</Link>
            <Link href="/library" className="transition-colors hover:text-stone-900">{t("nav.library")}</Link>
            <Link href="/plans" className="transition-colors hover:text-stone-900">{t("nav.plans")}</Link>
            {communityEnabled ? (
              <Link href="/comunidad" className="transition-colors hover:text-stone-900">{t("nav.community")}</Link>
            ) : (
              <Link href="/stories" className="transition-colors hover:text-stone-900">{t("nav.stories")}</Link>
            )}
            <Link href="/account" className="transition-colors hover:text-stone-900">{t("nav.account")}</Link>
            {isAdmin && (
              <Link href="/admin" className="text-rose-400 transition-colors hover:text-rose-600">{t("nav.admin")}</Link>
            )}
            <LogoutButton />
          </nav>
          <MobileNav
            links={navLinks}
            action={<LogoutButton />}
          />
        </header>
        {isFree ? (
          <div className="mb-6">
            <UpgradeBanner />
          </div>
        ) : null}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
