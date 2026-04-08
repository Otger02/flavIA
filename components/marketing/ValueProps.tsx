const VALUES = [
  {
    title: "No tienes que explicarte perfecto",
    description: "Flavia entiende el contexto.",
  },
  {
    title: "No te quedas dando vueltas",
    description: "Te ayuda a avanzar.",
  },
  {
    title: "No es teoría",
    description: "Son frases y pasos reales.",
  },
  {
    title: "No es genérico",
    description: "Se adapta a ti.",
  },
];

export function ValueProps() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Por qué Flavia</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Diseñada para conversaciones íntimas útiles
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {VALUES.map((value) => (
          <article
            key={value.title}
            className="rounded-[1.7rem] border border-stone-300/70 bg-[linear-gradient(180deg,rgba(255,248,242,0.92),rgba(255,255,255,0.85))] p-7 shadow-[0_14px_38px_rgba(73,48,24,0.06)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(73,48,24,0.10)]"
          >
            <h3 className="text-lg font-semibold text-stone-900">{value.title}</h3>
            <p className="mt-2 text-sm leading-7 text-stone-700">{value.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}