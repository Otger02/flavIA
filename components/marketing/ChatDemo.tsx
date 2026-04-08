export function ChatDemo() {
  return (
    <section className="grid gap-6 rounded-[2rem] border border-stone-300/70 bg-white/75 p-6 shadow-[0_16px_48px_rgba(73,48,24,0.07)] lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Demo</p>
        <h2 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900">
          Así es hablar con Flavia
        </h2>
        <p className="text-base leading-7 text-stone-700">
          No es un chatbot típico: Flavia te devuelve contexto, te ayuda a bajar ruido emocional y
          te propone acciones claras para avanzar conversación a conversación.
        </p>
        <div className="pt-1">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Prueba con algo como:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-stone-300 bg-stone-100/80 px-3 py-1.5 text-xs text-stone-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(73,48,24,0.10)]">
              Siento celos y me bloqueo antes de hablar
            </span>
            <span className="rounded-full border border-stone-300 bg-stone-100/80 px-3 py-1.5 text-xs text-stone-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(73,48,24,0.10)]">
              No sé cómo decir lo que necesito
            </span>
            <span className="rounded-full border border-stone-300 bg-stone-100/80 px-3 py-1.5 text-xs text-stone-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(73,48,24,0.10)]">
              Quiero reconectar con mi pareja
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,250,246,0.95),rgba(246,239,233,0.95))] p-4">
        <div className="space-y-3">
          <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-stone-700 shadow-sm">
            No sé cómo decirle que ya no me siento igual.
          </div>
          <div className="rounded-2xl bg-stone-900 px-4 py-3 text-sm leading-6 text-stone-100">
            ¿Te da miedo hacerle daño o que todo cambie?
          </div>
        </div>
      </div>
    </section>
  );
}