const STEPS = [
  {
    title: "Habla sin filtro",
    description:
      "Empieza desde donde estés: dudas, tensión, bloqueo o ganas de reconectar. Flavia recibe tu contexto sin juicio.",
  },
  {
    title: "Flavia te guía",
    description:
      "Te devuelve claridad emocional y estructura la conversación con preguntas y marcos fáciles de aplicar.",
  },
  {
    title: "Explora y avanza",
    description:
      "Con cada chat conviertes reflexión en pasos concretos para mejorar comunicación, deseo y conexión.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="space-y-5 rounded-[2rem] bg-[linear-gradient(180deg,rgba(249,243,237,0.85),rgba(255,250,246,0.78))] px-1 py-2 scroll-mt-28"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Cómo funciona</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Un flujo simple para avanzar de verdad
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {STEPS.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-stone-300/70 bg-white/78 p-6 shadow-[0_14px_40px_rgba(73,48,24,0.06)] transition duration-200 ease-out hover:-translate-y-0.5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Paso {index + 1}</p>
            <h3 className="mt-3 text-xl font-semibold text-stone-900">{step.title}</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone-700">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}