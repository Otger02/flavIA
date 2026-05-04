import type { LegalSection } from "@/lib/legal/terms";

type LegalPageProps = {
  title: string;
  subtitle?: string;
  sections: LegalSection[];
  lastUpdated?: string;
};

export function LegalPage({ title, subtitle, sections, lastUpdated }: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3 border-b border-rose-200/40 pb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">Legal</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-base leading-7 text-stone-500">{subtitle}</p>
        ) : null}
        {lastUpdated ? (
          <p className="text-sm text-stone-400">Última actualización: {lastUpdated}</p>
        ) : null}
      </header>

      <nav className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">Contenido</p>
        <ul className="space-y-1.5">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-sm text-stone-600 transition-colors hover:text-rose-600"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-8 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
              {section.title}
            </h2>
            {section.content.map((paragraph, i) => (
              <p key={i} className="text-sm leading-7 text-stone-600 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
