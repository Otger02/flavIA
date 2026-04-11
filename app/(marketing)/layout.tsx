import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { MobileNav } from "@/components/layout/mobile-nav";
import { getUser } from "@/features/auth/server/get-user";
import { isCommunityEnabled } from "@/lib/feature-flags";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default async function MarketingLayout({ children }: MarketingLayoutProps) {
  const t = await getTranslations("navigation");
  const user = await getUser();
  const isLoggedIn = !!user;
  const communityEnabled = isCommunityEnabled();

  const communityLink = communityEnabled
    ? { href: "/comunidad", label: t("nav.community") }
    : { href: "/stories", label: t("nav.stories") };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <header className="mb-12 flex items-center justify-between gap-4 border-b border-rose-200/40 pb-5">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="group">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 transition-colors group-hover:text-stone-600">{t("brand.tagline")}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-stone-900">Flavia</p>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-stone-500 md:flex">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="transition-colors hover:text-stone-900">{t("nav.dashboard")}</Link>
                <Link href="/chat" className="transition-colors hover:text-stone-900">{t("nav.chat")}</Link>
              </>
            ) : null}
            <Link href="/library" className="transition-colors hover:text-stone-900">{t("nav.library")}</Link>
            <Link href="/plans" className="transition-colors hover:text-stone-900">{t("nav.plans")}</Link>
            {isLoggedIn ? (
              <>
                <Link href={communityLink.href} className="transition-colors hover:text-stone-900">{communityLink.label}</Link>
                <Link href="/account" className="transition-colors hover:text-stone-900">{t("nav.account")}</Link>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(220,100,100,0.25)]"
              >
                {t("nav.login")}
              </Link>
            )}
          </nav>
          <MobileNav
            links={
              isLoggedIn
                ? [
                    { href: "/dashboard", label: t("nav.dashboard") },
                    { href: "/chat", label: t("nav.chat") },
                    { href: "/library", label: t("nav.library") },
                    { href: "/plans", label: t("nav.plans") },
                    communityLink,
                    { href: "/account", label: t("nav.account") },
                  ]
                : [
                    { href: "/library", label: t("nav.library") },
                    { href: "/plans", label: t("nav.plans") },
                    { href: "/login", label: t("nav.login") },
                  ]
            }
          />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
