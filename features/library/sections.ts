import type { LibrarySection } from "@/features/library/constants";

export type LibrarySectionConfig = {
  key: LibrarySection;
  icon: string;
  color: string;
  hasAudienceTabs: boolean;
};

export const LIBRARY_SECTION_TRANSLATION_KEYS: Record<LibrarySection, `library_sections.${LibrarySection}`> = {
  tips_educacion_sexual: "library_sections.tips_educacion_sexual",
  te_recomiendo: "library_sections.te_recomiendo",
  lo_mas_hablado: "library_sections.lo_mas_hablado",
  te_ha_pasado: "library_sections.te_ha_pasado",
  quickly: "library_sections.quickly",
  emocionalmente: "library_sections.emocionalmente",
  soy_normal_o_distinto: "library_sections.soy_normal_o_distinto",
  tengo_miedo: "library_sections.tengo_miedo",
};

export const LIBRARY_SECTION_CONFIG: LibrarySectionConfig[] = [
  {
    key: "tips_educacion_sexual",
    icon: "💡",
    color: "from-emerald-100 via-teal-50 to-amber-50 border-emerald-300/60",
    hasAudienceTabs: true,
  },
  {
    key: "te_recomiendo",
    icon: "📚",
    color: "from-amber-100 via-orange-50 to-rose-50 border-amber-300/60",
    hasAudienceTabs: false,
  },
  {
    key: "lo_mas_hablado",
    icon: "🔥",
    color: "from-rose-200 via-pink-100 to-orange-50 border-rose-300/60",
    hasAudienceTabs: false,
  },
  {
    key: "te_ha_pasado",
    icon: "💬",
    color: "from-violet-100 via-purple-50 to-pink-50 border-violet-300/60",
    hasAudienceTabs: false,
  },
  {
    key: "quickly",
    icon: "⚡",
    color: "from-sky-200 via-blue-100 to-indigo-50 border-sky-300/60",
    hasAudienceTabs: false,
  },
  {
    key: "emocionalmente",
    icon: "🧠",
    color: "from-fuchsia-100 via-pink-50 to-rose-50 border-fuchsia-300/60",
    hasAudienceTabs: false,
  },
  {
    key: "soy_normal_o_distinto",
    icon: "✨",
    color: "from-indigo-100 via-violet-50 to-blue-50 border-indigo-300/60",
    hasAudienceTabs: false,
  },
  {
    key: "tengo_miedo",
    icon: "🌿",
    color: "from-rose-100 via-stone-50 to-amber-50 border-rose-300/60",
    hasAudienceTabs: false,
  },
];

export function getSectionConfig(key: string): LibrarySectionConfig | undefined {
  return LIBRARY_SECTION_CONFIG.find((s) => s.key === key);
}

export function getSectionTranslationKey(key: string): `library_sections.${LibrarySection}` | null {
  return LIBRARY_SECTION_TRANSLATION_KEYS[key as LibrarySection] ?? null;
}
