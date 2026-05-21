"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

type Props = {
  onContinue: () => void;
  onSkip: () => void;
  isPending: boolean;
};

export function WelcomeScreen({ onContinue, onSkip, isPending }: Props) {
  const t = useTranslations("onboarding");

  return (
    <section className="flex flex-col items-center text-center">
      <div className="relative h-44 w-44 overflow-hidden rounded-full shadow-[0_20px_50px_rgba(60,30,20,0.25)] ring-4 ring-white sm:h-52 sm:w-52">
        <Image
          src="/flavia-bw.jpg"
          alt={t("welcome.image_alt")}
          fill
          priority
          sizes="208px"
          className="object-cover"
        />
      </div>

      <h1 className="mt-8 font-[family-name:var(--font-display)] text-4xl italic leading-tight text-stone-900 sm:text-5xl">
        {t("welcome.greeting")}
      </h1>
      <p className="mt-5 max-w-md text-base leading-7 text-stone-700">
        {t("welcome.body")}
      </p>

      <div className="mt-9 flex w-full flex-col items-center gap-3">
        <button
          type="button"
          onClick={onContinue}
          disabled={isPending}
          className="w-full max-w-xs rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.25)] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {t("common.continue")}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={isPending}
          className="text-xs text-stone-500 underline-offset-4 transition hover:underline disabled:opacity-50"
        >
          {t("common.skip")}
        </button>
      </div>
    </section>
  );
}
