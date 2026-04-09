const TOPICS = [
  { label: "Celos", icon: "~", color: "from-rose-100 to-rose-50" },
  { label: "Comunicacion", icon: "::", color: "from-amber-100/80 to-orange-50" },
  { label: "Deseo", icon: "*", color: "from-pink-100/80 to-rose-50" },
  { label: "Pareja", icon: "<>", color: "from-rose-100/60 to-[#f5ddd5]/40" },
  { label: "Limites", icon: "+", color: "from-orange-100/60 to-amber-50" },
  { label: "Placer", icon: "o", color: "from-[#f5ddd5]/80 to-rose-50" },
];

export function Topics() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-rose-400/70">Puntos de entrada</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Empieza por lo que te importa hoy
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((topic) => (
          <button
            key={topic.label}
            type="button"
            className="group rounded-2xl border border-rose-200/50 bg-white/78 px-5 py-4 text-left text-base font-medium text-stone-800 shadow-[0_10px_30px_rgba(196,96,90,0.05)] transition duration-200 ease-out hover:scale-[1.02] hover:bg-white hover:shadow-[0_18px_38px_rgba(196,96,90,0.10)]"
          >
            <span
              className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${topic.color} text-sm text-stone-600 transition-transform duration-200 group-hover:scale-110`}
            >
              {topic.icon}
            </span>
            <span className="block">{topic.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
