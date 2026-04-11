import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

type CTAProps = {
  isLoggedIn?: boolean;
};

export async function CTA({ isLoggedIn }: CTAProps) {
  const t = await getTranslations("marketing");

  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3a1f1a] via-[#2a1c17] to-[#140e0c] p-8 text-stone-50 shadow-[0_24px_80px_rgba(28,20,13,0.28)] md:p-10 lg:p-12">
      <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
        {/* Flavia B&W photo */}
        <div className="relative shrink-0">
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-rose-400/20 to-transparent blur-sm" />
          <div className="relative h-48 w-48 overflow-hidden rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.3)] lg:h-52 lg:w-52">
            <Image
              src="/flavia-bw.jpg"
              alt={t("cta_section.image_alt")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 192px, 208px"
            />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-5 text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            {t("cta_section.eyebrow")}
          </p>
          <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight text-white sm:text-5xl">
            {t("cta_section.title")}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-stone-300">
            {t("cta_section.description")}
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-7 py-3.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(220,100,100,0.30)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(220,100,100,0.40)]"
          >
            {isLoggedIn ? t("cta_section.cta_logged_in") : t("cta_section.cta_logged_out")}
          </Link>
        </div>
      </div>
    </section>
  );
}
