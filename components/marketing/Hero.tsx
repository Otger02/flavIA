import Link from "next/link";

export function Hero() {
  return (
    <section className="relative grid gap-8 overflow-hidden rounded-[2.25rem] border border-stone-200/80 bg-[linear-gradient(135deg,rgba(255,248,239,0.95)_0%,rgba(246,224,224,0.82)_48%,rgba(255,252,246,0.98)_100%)] p-6 shadow-[0_22px_70px_rgba(96,63,40,0.10)] backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,227,214,0.35),transparent_45%)]" />
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Acompañamiento íntimo</p>
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-stone-900 sm:text-6xl">
          No sabes cómo empezar esa conversación. Flavia sí.
        </h1>
        <p className="max-w-xl text-base leading-8 text-stone-700 sm:text-lg">
          Te ayuda a poner en palabras lo que sientes y a decirlo sin romper nada.
        </p>
        <p className="max-w-lg text-base leading-7 text-stone-600 sm:text-lg">
          Porque no es solo lo que dices. Es cómo lo dices.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/chat"
            className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-stone-50 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-[0_14px_30px_rgba(49,30,20,0.18)]"
          >
            Empieza ahora
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-stone-300/80 bg-white/60 px-6 py-3 text-sm font-medium text-stone-800 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/80"
          >
            Ver cómo funciona
          </a>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.9rem] border border-stone-300/60 bg-[image:linear-gradient(180deg,rgba(32,21,18,0.38),rgba(22,14,12,0.82)),url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-5 text-stone-100 shadow-[0_26px_60px_rgba(28,20,13,0.22)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,222,196,0.20),transparent_38%)] backdrop-blur-[1px]" />
        <p className="relative text-[11px] uppercase tracking-[0.25em] text-stone-300">Vista previa</p>
        <div className="relative mt-4 space-y-3">
          <div className="max-w-[85%] rounded-2xl border border-white/10 bg-white/12 px-4 py-3 text-sm leading-6 shadow-sm backdrop-blur-sm">
            No sé cómo decirle que ya no me siento igual.
          </div>
          <div className="ml-auto max-w-[88%] rounded-2xl bg-stone-100/95 px-4 py-3 text-sm leading-6 text-stone-900 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            No hace falta que lo digas perfecto. Primero vamos a entender qué ha cambiado para ti.
          </div>
        </div>
      </div>
    </section>
  );
}