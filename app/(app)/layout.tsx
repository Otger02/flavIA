import Link from "next/link";

import { requireUser } from "@/features/auth/server/require-user";

type AppLayoutProps = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: AppLayoutProps) {
  await requireUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-950 to-[#1a1210] text-stone-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-rose-900/20 pb-5">
          <Link href="/" className="group">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 transition-colors group-hover:text-stone-300">Acompañamiento íntimo</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-white">Flavia</p>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-stone-400">
            <Link href="/chat" className="transition-colors hover:text-white">Chat</Link>
            <Link href="/account" className="transition-colors hover:text-white">Cuenta</Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}