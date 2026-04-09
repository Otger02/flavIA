import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UpgradeBanner } from "@/components/billing/upgrade-banner";
import { requireUser } from "@/features/auth/server/require-user";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";

const ADMIN_EMAILS = ["otger02@gmail.com"];

type AppLayoutProps = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await requireUser();
  const viewer = await getViewerPlan();
  const isAdmin = !!user.email && ADMIN_EMAILS.includes(user.email);
  const isFree = !viewer.plan || viewer.plan.plan === BILLING_FREE_PLAN;

  const navLinks = [
    { href: "/dashboard", label: "Mi espacio" },
    { href: "/chat", label: "Chat" },
    { href: "/library", label: "Biblioteca" },
    { href: "/plans", label: "Planes" },
    { href: "/stories", label: "Historias" },
    { href: "/account", label: "Cuenta" },
    ...(isAdmin ? [{ href: "/admin/stories", label: "Admin" }] : []),
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="mb-8 flex items-center justify-between gap-4 border-b border-rose-200/40 pb-5">
          <Link href="/dashboard" className="group">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 transition-colors group-hover:text-stone-600">Acompañamiento íntimo</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-stone-900">Flavia</p>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-stone-500 md:flex">
            <Link href="/dashboard" className="transition-colors hover:text-stone-900">Mi espacio</Link>
            <Link href="/chat" className="transition-colors hover:text-stone-900">Chat</Link>
            <Link href="/library" className="transition-colors hover:text-stone-900">Biblioteca</Link>
            <Link href="/plans" className="transition-colors hover:text-stone-900">Planes</Link>
            <Link href="/stories" className="transition-colors hover:text-stone-900">Historias</Link>
            <Link href="/account" className="transition-colors hover:text-stone-900">Cuenta</Link>
            {isAdmin && (
              <Link href="/admin/stories" className="text-rose-400 transition-colors hover:text-rose-600">Admin</Link>
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
