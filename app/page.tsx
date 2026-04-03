import { PageShell } from "@/components/layout/page-shell";

const pillars = [
  "Chat como motor principal",
  "Biblioteca editorial y educativa",
  "Recomendaciones de producto",
  "Planes de pago y suscripciones",
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-600">Project base</p>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-none text-stone-900 sm:text-6xl">
            Flavia starts as a modular Next.js platform ready for conversational wellbeing.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-stone-700">
            This placeholder home keeps the app runnable while the chat, content, commerce and CMS domains are built.
          </p>
        </div>
        <div className="rounded-[2rem] border border-stone-300/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(61,42,24,0.08)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Initial domains</p>
          <ul className="mt-4 space-y-3 text-sm text-stone-700">
            {pillars.map((pillar) => (
              <li key={pillar} className="rounded-full bg-stone-100 px-4 py-3">
                {pillar}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}