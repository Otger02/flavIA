import { getTranslations } from "next-intl/server";

export async function FlaviaQuote() {
  const t = await getTranslations("marketing");

  return (
    <section className="relative py-16 sm:py-20 lg:py-24">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#f5ddd5]/15 to-transparent" />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Decorative opening quote mark */}
        <span
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none font-[family-name:var(--font-display)] text-[8rem] leading-none text-rose-300/20 sm:-top-10 sm:text-[10rem]"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <blockquote className="relative">
          <p className="font-[family-name:var(--font-display)] text-2xl leading-relaxed tracking-tight text-stone-800 italic sm:text-3xl sm:leading-relaxed">
            {t("quote.text")}
          </p>
        </blockquote>

        <p className="mt-6 text-sm tracking-wide text-stone-500">
          &mdash; {t("quote.attribution")}
        </p>
      </div>
    </section>
  );
}
