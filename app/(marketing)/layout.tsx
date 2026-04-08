import Link from "next/link";

import { getUser } from "@/features/auth/server/get-user";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default async function MarketingLayout({ children }: MarketingLayoutProps) {
  const user = await getUser();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <header className="mb-12 flex items-center justify-between gap-4">
          <Link href="/" className="group">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 transition-colors group-hover:text-stone-600">Acompañamiento íntimo</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-stone-900">Flavia</p>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-stone-600">
            <Link href="/library" className="transition-colors hover:text-stone-900">Biblioteca</Link>
            <Link href="/plans" className="transition-colors hover:text-stone-900">Planes</Link>
            {user ? (
              <Link
                href="/chat"
                className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(220,100,100,0.25)]"
              >
                Mi espacio
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(220,100,100,0.25)]"
              >
                Entrar
              </Link>
            )}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
