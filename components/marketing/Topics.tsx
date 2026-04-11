import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LIBRARY_SECTION_CONFIG, getSectionTranslationKey } from "@/features/library/sections";

const TOPICS = [
  { key: "jealousy", slug: "jealousy", icon: "~", color: "from-rose-100 to-rose-50" },
  { key: "communication", slug: "communication", icon: "::", color: "from-amber-100/80 to-orange-50" },
  { key: "desire", slug: "desire", icon: "*", color: "from-pink-100/80 to-rose-50" },
  { key: "couple_connection", slug: "couple_connection", icon: "<>", color: "from-rose-100/60 to-[#f5ddd5]/40" },
  { key: "boundaries", slug: "boundaries", icon: "+", color: "from-orange-100/60 to-amber-50" },
  { key: "pleasure", slug: "pleasure", icon: "o", color: "from-[#f5ddd5]/80 to-rose-50" },
  { key: "menopause", slug: "menopause", icon: "·", color: "from-purple-100/80 to-purple-50" },
  { key: "education", slug: "education", icon: "?", color: "from-emerald-100/80 to-emerald-50" },
];

type TopicsProps = {
  isLoggedIn?: boolean;
};

export async function Topics({ isLoggedIn }: TopicsProps) {
  const [t, tShared] = await Promise.all([
    getTranslations("marketing"),
    getTranslations("shared"),
  ]);

  const sections = LIBRARY_SECTION_CONFIG.map((section) => {
    const key = getSectionTranslationKey(section.key);

    return {
      ...section,
      title: key ? tShared(`${key}.title`) : section.key,
      description: key ? tShared(`${key}.description`) : "",
    };
  });

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-rose-400/70">{t("topics.eyebrow")}</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {t("topics.title")}
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map((topic) => (
          <Link
            key={topic.key}
            href={isLoggedIn ? `/chat?topic=${topic.slug}` : "/login"}
            className="group rounded-2xl border border-rose-200/50 bg-white/78 px-5 py-4 text-left text-base font-medium text-stone-800 shadow-[0_10px_30px_rgba(196,96,90,0.05)] transition duration-200 ease-out hover:scale-[1.02] hover:bg-white hover:shadow-[0_18px_38px_rgba(196,96,90,0.10)]"
          >
            <span
              className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${topic.color} text-sm text-stone-600 transition-transform duration-200 group-hover:scale-110`}
            >
              {topic.icon}
            </span>
            <span className="block">{t(`topics.items.${topic.key}.label`)}</span>
          </Link>
        ))}
      </div>

      {/* Library sections as entry points */}
      <div className="mt-10">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-400/70">{t("topics.library_eyebrow")}</p>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("topics.library_title")}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.key}
              href={`/library?section=${section.key}`}
              className={`group rounded-2xl border bg-gradient-to-br ${section.color} px-5 py-4 shadow-[0_8px_24px_rgba(180,120,100,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(180,120,100,0.12)]`}
            >
              <span className="text-xl">{section.icon}</span>
              <h4 className="mt-2 font-[family-name:var(--font-display)] text-base text-stone-900">
                {section.title}
              </h4>
              <p className="mt-1 text-xs leading-5 text-stone-600">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
