import type { LibrarySection } from "@/features/library/constants";

const SECTION_COVER_GRADIENT: Record<LibrarySection, string> = {
  tips_educacion_sexual: "from-emerald-300 via-teal-200 to-amber-100",
  te_recomiendo: "from-amber-300 via-orange-200 to-rose-100",
  lo_mas_hablado: "from-rose-400 via-pink-300 to-orange-200",
  te_ha_pasado: "from-violet-300 via-purple-200 to-pink-100",
  quickly: "from-sky-300 via-blue-200 to-indigo-100",
  emocionalmente: "from-fuchsia-300 via-pink-200 to-rose-100",
  soy_normal_o_distinto: "from-indigo-300 via-violet-200 to-blue-100",
  tengo_miedo: "from-rose-300 via-stone-200 to-amber-100",
};

const SECTION_ACCENT: Record<LibrarySection, string> = {
  tips_educacion_sexual: "text-emerald-900/30",
  te_recomiendo: "text-amber-900/30",
  lo_mas_hablado: "text-rose-900/30",
  te_ha_pasado: "text-violet-900/30",
  quickly: "text-sky-900/30",
  emocionalmente: "text-fuchsia-900/30",
  soy_normal_o_distinto: "text-indigo-900/30",
  tengo_miedo: "text-rose-900/30",
};

const DEFAULT_GRADIENT = "from-rose-300 via-orange-200 to-amber-100";
const DEFAULT_ACCENT = "text-rose-900/30";

type LibraryCoverFallbackProps = {
  title: string;
  sectionTag?: LibrarySection;
  className?: string;
};

function getInitials(title: string): string {
  const trimmed = title.trim().replace(/^[¿¡"]+/, "");
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "F";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function LibraryCoverFallback({ title, sectionTag, className }: LibraryCoverFallbackProps) {
  const gradient = sectionTag ? SECTION_COVER_GRADIENT[sectionTag] : DEFAULT_GRADIENT;
  const accent = sectionTag ? SECTION_ACCENT[sectionTag] : DEFAULT_ACCENT;
  const initials = getInitials(title);

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${gradient} ${className ?? ""}`}
      aria-hidden
    >
      {/* Decorative blurred orbs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-white/35 blur-3xl" />

      {/* Soft curved line */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
      >
        <path
          d="M -20 180 C 80 120, 180 220, 260 140 S 380 80, 440 100"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className={accent}
        />
        <path
          d="M -20 60 C 60 40, 140 100, 220 60 S 360 30, 440 50"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className={accent}
        />
      </svg>

      {/* Initials */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`select-none font-[family-name:var(--font-display)] text-[8rem] leading-none tracking-tight ${accent}`}
          style={{ textShadow: "0 4px 24px rgba(255,255,255,0.4)" }}
        >
          {initials}
        </span>
      </div>
    </div>
  );
}
