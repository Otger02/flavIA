import Link from "next/link";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8ef_0%,_#f7f3ec_48%,_#efe4d6_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <header className="mb-12 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Flavia</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-stone-900">
              Marketing shell
            </p>
          </div>
          <nav className="flex gap-3 text-sm text-stone-600">
            <Link href="/">Inicio</Link>
            <Link href="/plans">Planes</Link>
            <Link href="/library">Biblioteca</Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}