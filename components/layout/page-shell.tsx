type PageShellProps = {
  children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Flavia</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-stone-900">
            Base architecture scaffold
          </p>
        </div>
        <div className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm text-stone-600">
          Next.js + Tailwind
        </div>
      </div>
      {children}
    </main>
  );
}