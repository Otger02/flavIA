import Link from "next/link";

import { requireUser } from "@/features/auth/server/require-user";

type AppLayoutProps = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: AppLayoutProps) {
  await requireUser();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-stone-400">Flavia</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-white">App shell</p>
          </div>
          <nav className="flex gap-3 text-sm text-stone-300">
            <Link href="/chat">Chat</Link>
            <Link href="/account">Cuenta</Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}