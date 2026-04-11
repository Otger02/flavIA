import { getTranslations } from "next-intl/server";

export async function ValueProps() {
  const t = await getTranslations("marketing");
  const values = [
    {
      key: "context",
      title: t("value_props.items.context.title"),
      description: t("value_props.items.context.description"),
      accent: "border-l-[#c4605a]/30",
    },
    {
      key: "movement",
      title: t("value_props.items.movement.title"),
      description: t("value_props.items.movement.description"),
      accent: "border-l-rose-300/40",
    },
    {
      key: "practical",
      title: t("value_props.items.practical.title"),
      description: t("value_props.items.practical.description"),
      accent: "border-l-[#e8a0a0]/50",
    },
    {
      key: "personal",
      title: t("value_props.items.personal.title"),
      description: t("value_props.items.personal.description"),
      accent: "border-l-[#f5ddd5]/80",
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-rose-400/70">{t("value_props.eyebrow")}</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {t("value_props.title")}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {values.map((value) => (
          <article
            key={value.key}
            className={`rounded-[1.7rem] border border-rose-200/40 border-l-4 ${value.accent} bg-gradient-to-b from-[#fef6ee]/92 to-white/85 p-7 shadow-[0_14px_38px_rgba(196,96,90,0.05)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(196,96,90,0.10)]`}
          >
            <h3 className="text-lg font-semibold text-stone-900">{value.title}</h3>
            <p className="mt-2 text-sm leading-7 text-stone-700">{value.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
