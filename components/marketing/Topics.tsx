const TOPICS = [
  { label: "Celos", icon: "~" },
  { label: "Comunicación", icon: "::" },
  { label: "Deseo", icon: "*" },
  { label: "Pareja", icon: "<>" },
  { label: "Límites", icon: "+" },
  { label: "Placer", icon: "o" },
];

export function Topics() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Puntos de entrada</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Empieza por lo que te importa hoy
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((topic) => (
          <button
            key={topic.label}
            type="button"
            className="rounded-2xl border border-stone-300/80 bg-white/78 px-5 py-4 text-left text-base font-medium text-stone-800 shadow-[0_10px_30px_rgba(73,48,24,0.06)] transition duration-200 ease-out hover:scale-[1.02] hover:bg-white hover:shadow-[0_18px_38px_rgba(73,48,24,0.12)]"
          >
            <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-sm text-stone-600">
              {topic.icon}
            </span>
            <span className="block">{topic.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}