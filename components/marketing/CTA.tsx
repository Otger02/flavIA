import Link from "next/link";

export function CTA() {
  return (
    <section className="rounded-[2rem] border border-stone-900/80 bg-[linear-gradient(180deg,rgba(42,28,23,0.98),rgba(20,14,12,1))] p-8 text-stone-50 shadow-[0_24px_80px_rgba(28,20,13,0.28)]">
      <div className="space-y-5">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Empieza hoy</p>
        <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight text-white sm:text-5xl">
          Esa conversación que estás evitando... puedes empezarla hoy.
        </h2>
        <p className="max-w-2xl text-base leading-7 text-stone-300">
          No necesitas tenerlo claro. Solo empezar.
        </p>
        <Link
          href="/chat"
          className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-950 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-stone-200 hover:shadow-[0_0_24px_rgba(255,245,238,0.22)]"
        >
          Probar gratis
        </Link>
      </div>
    </section>
  );
}