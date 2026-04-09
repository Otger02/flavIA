const STEPS = [
  {
    title: "Habla sin filtro",
    description:
      "Empieza desde donde estes: dudas, tension, bloqueo o ganas de reconectar. Flavia recibe tu contexto sin juicio.",
  },
  {
    title: "Flavia te guia",
    description:
      "Te devuelve claridad emocional y estructura la conversacion con preguntas y marcos faciles de aplicar.",
  },
  {
    title: "Explora y avanza",
    description:
      "Con cada chat conviertes reflexion en pasos concretos para mejorar comunicacion, deseo y conexion.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="space-y-5 rounded-[2rem] bg-gradient-to-b from-[#fef6ee]/85 via-[#f5ddd5]/20 to-[#fef6ee]/78 px-1 py-2 scroll-mt-28"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-rose-400/70">Como funciona</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Un flujo simple para avanzar de verdad
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {STEPS.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-rose-200/40 bg-white/78 p-6 shadow-[0_14px_40px_rgba(196,96,90,0.05)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(196,96,90,0.10)]"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-[#f5ddd5]/60 text-xs font-semibold text-[#c4605a]">
              {index + 1}
            </span>
            <h3 className="mt-3 text-xl font-semibold text-stone-900">{step.title}</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone-700">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
