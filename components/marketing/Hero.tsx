import Link from "next/link";

export function Hero() {
  return (
    <section className="relative grid gap-8 overflow-hidden rounded-[2.25rem] border border-rose-200/40 bg-[linear-gradient(135deg,rgba(255,248,239,0.95)_0%,rgba(246,214,214,0.75)_48%,rgba(255,242,236,0.98)_100%)] p-6 shadow-[0_22px_70px_rgba(180,80,70,0.08)] backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,200,190,0.30),transparent_45%)]" />
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400/80">Acompañamiento íntimo</p>
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-stone-900 sm:text-6xl">
          No sabes cómo empezar esa conversación. Flavia sí.
        </h1>
        <p className="max-w-xl text-base leading-8 text-stone-700 sm:text-lg">
          Sexóloga, escritora y terapeuta de pareja. Más de 20 años ayudando a personas a hablar de lo que sienten sin romperse por el camino.
        </p>
        <p className="max-w-lg text-base leading-7 text-stone-600 sm:text-lg">
          Porque no es solo lo que dices. Es cómo lo dices.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-7 py-3.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(220,100,100,0.22)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(220,100,100,0.30)]"
          >
            Empieza ahora
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-rose-300/50 bg-white/60 px-6 py-3 text-sm font-medium text-stone-800 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/80"
          >
            Ver cómo funciona
          </a>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.9rem] border border-rose-300/30 bg-[image:linear-gradient(180deg,rgba(32,18,18,0.42),rgba(22,12,12,0.85)),url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-5 text-stone-100 shadow-[0_26px_60px_rgba(120,40,40,0.18)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,180,180,0.18),transparent_38%)] backdrop-blur-[1px]" />
        <p className="relative text-[11px] uppercase tracking-[0.25em] text-rose-200/70">Vista previa</p>
        <div className="relative mt-4 space-y-3">
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/12 px-4 py-3 text-sm leading-6 shadow-sm backdrop-blur-sm">
            No sé cómo decirle que ya no me siento igual.
          </div>
          <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-gradient-to-br from-rose-100/95 to-white/95 px-4 py-3 text-sm leading-6 text-stone-900 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            No hace falta que lo digas perfecto. Primero vamos a entender qué ha cambiado para ti.
          </div>
        </div>
      </div>
    </section>
  );
}
