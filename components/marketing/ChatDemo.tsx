import Link from "next/link";
import { getTranslations } from "next-intl/server";

type ChatDemoProps = {
  isLoggedIn?: boolean;
};

export async function ChatDemo({ isLoggedIn }: ChatDemoProps) {
  const t = await getTranslations("marketing");
  const prompts = [
    t("chat_demo.prompt_1"),
    t("chat_demo.prompt_2"),
    t("chat_demo.prompt_3"),
  ];

  return (
    <section className="grid gap-6 rounded-[2rem] border border-rose-200/50 bg-gradient-to-br from-white/80 via-[#fef6ee]/60 to-white/75 p-6 shadow-[0_16px_48px_rgba(196,96,90,0.06)] lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-400/70">{t("chat_demo.eyebrow")}</p>
        <h2 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900">
          {t("chat_demo.title")}
        </h2>
        <p className="text-base leading-7 text-stone-700">
          {t("chat_demo.description")}
        </p>
        <div className="pt-1">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{t("chat_demo.prompt_label")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {prompts.map((prompt) => (
              <Link
                key={prompt}
                href={isLoggedIn ? "/chat" : "/login"}
                className="rounded-full border border-rose-200/60 bg-[#fef6ee]/80 px-3 py-1.5 text-xs text-stone-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(196,96,90,0.10)]"
              >
                {prompt}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-rose-200/30 bg-gradient-to-b from-[#fef6ee]/95 to-white/95 p-4 shadow-inner">
        <div className="space-y-3">
          {/* User message */}
          <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-gradient-to-br from-rose-100/80 to-[#f5ddd5]/60 px-4 py-3 text-sm leading-6 text-stone-700 shadow-sm">
            {t("chat_demo.message_user")}
          </div>
          {/* Flavia response */}
          <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm leading-6 text-stone-800 shadow-[0_4px_16px_rgba(196,96,90,0.08)]">
            {t("chat_demo.message_assistant")}
          </div>
        </div>
      </div>
    </section>
  );
}
