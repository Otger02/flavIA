import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

type HeroProps = {
  isLoggedIn?: boolean;
};

export async function Hero({ isLoggedIn }: HeroProps) {
  const t = await getTranslations("marketing");

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-b from-[#fef6ee] via-[#f5ddd5]/30 to-transparent">
      {/* Decorative radial overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,200,190,0.30),transparent_45%)]" />

      <div className="relative grid items-center gap-8 border border-rose-200/40 p-6 shadow-[0_22px_70px_rgba(180,80,70,0.08)] backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-8 lg:p-12">
        {/* Left column: copy */}
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400/80">
            {t("hero.eyebrow")}
          </p>

          <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[0.92] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
            {t("hero.headline_prefix")}{" "}
            <span className="bg-gradient-to-r from-[#c4605a] to-rose-400 bg-clip-text text-transparent">
              {t("hero.headline_highlight")}
            </span>
          </h1>

          <p className="max-w-xl text-base leading-8 text-stone-700 sm:text-lg">
            {t("hero.subline")}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-8 py-4 text-sm font-medium text-white shadow-[0_14px_30px_rgba(220,100,100,0.22)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(220,100,100,0.30)]"
            >
              {isLoggedIn ? t("hero.cta_primary_logged_in") : t("hero.cta_primary_logged_out")}
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-rose-300/50 bg-white/60 px-6 py-3.5 text-sm font-medium text-stone-800 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/80"
            >
              {t("hero.cta_secondary")}
            </a>
          </div>

          {/* Trust line */}
          <p className="max-w-md text-sm leading-6 text-stone-500">
            {t("hero.credential")}
          </p>
        </div>

        {/* Right column: Flavia photo + chat preview */}
        <div className="flex flex-col items-center gap-6">
          {/* Flavia portrait */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-rose-200/60 via-[#f5ddd5]/40 to-transparent blur-sm" />
            <div className="relative h-56 w-56 overflow-hidden rounded-full ring-4 ring-[#e8a0a0]/40 ring-offset-2 ring-offset-[#fef6ee] shadow-[0_20px_50px_rgba(196,96,90,0.18)] sm:h-64 sm:w-64 lg:h-72 lg:w-72">
              <Image
                src="/flavia-riendo.webp"
                alt={t("hero.image_alt")}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 288px"
              />
            </div>
          </div>

          {/* Mini chat preview */}
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-rose-200/40 bg-white/70 p-4 shadow-[0_12px_36px_rgba(120,40,40,0.08)] backdrop-blur-sm">
            <p className="mb-3 text-[11px] uppercase tracking-[0.25em] text-rose-400/60">
              {t("hero.preview_label")}
            </p>
            <div className="space-y-2.5">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#fef6ee] px-4 py-2.5 text-sm leading-6 text-stone-700">
                {t("hero.preview_user")}
              </div>
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-gradient-to-br from-rose-50 to-white px-4 py-2.5 text-sm leading-6 text-stone-800 shadow-sm">
                {t("hero.preview_assistant")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
