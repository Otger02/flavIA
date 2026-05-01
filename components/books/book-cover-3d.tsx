import Image from "next/image";

type BookCover3DProps = {
  src: string | null;
  alt: string;
  size?: "listing" | "detail";
};

const SIZE_CLASSES = {
  listing: "h-[260px] w-[170px] sm:h-[300px] sm:w-[200px]",
  detail: "h-[440px] w-[300px] md:h-[500px] md:w-[340px]",
};

/**
 * 3D book mockup. Pure CSS perspective + a left-edge "spine" gradient.
 * No external lib. Works with any cover image (or renders a warm
 * placeholder gradient when src is null).
 */
export function BookCover3D({ src, alt, size = "listing" }: BookCover3DProps) {
  return (
    <div
      className={`relative shrink-0 [perspective:1400px] ${SIZE_CLASSES[size]}`}
    >
      <div
        className="relative h-full w-full origin-left transition-transform duration-500 ease-out [transform:rotateY(-22deg)] hover:[transform:rotateY(-12deg)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* The cover face */}
        <div className="relative h-full w-full overflow-hidden rounded-[6px] rounded-l-[2px] bg-gradient-to-br from-rose-200 via-amber-100 to-stone-100 shadow-[0_30px_60px_rgba(60,30,20,0.30),0_10px_22px_rgba(60,30,20,0.18)] ring-1 ring-stone-900/10">
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={size === "detail" ? "340px" : "200px"}
              className="object-cover"
              priority={size === "detail"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center">
              <span className="font-[family-name:var(--font-display)] text-3xl leading-tight text-stone-900/40">
                {alt.split(/\s+/).slice(0, 3).join(" ")}
              </span>
            </div>
          )}

          {/* Subtle inner page gloss */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 mix-blend-overlay" />

          {/* Spine highlight + pages */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[10px] bg-gradient-to-r from-stone-900/35 via-stone-900/10 to-transparent" />
        </div>

        {/* Page edges (right side, simulating thickness) */}
        <div
          className="absolute inset-y-1 right-0 w-[7px] rounded-r-[2px] bg-[repeating-linear-gradient(to_bottom,#f5e6d6_0px,#f5e6d6_2px,#e8d4bb_2px,#e8d4bb_3px)] shadow-[1px_0_3px_rgba(60,30,20,0.18)]"
          style={{ transform: "translateZ(-6px)" }}
          aria-hidden
        />
      </div>

      {/* Cast shadow on the floor */}
      <div
        aria-hidden
        className="absolute -bottom-2 left-1/2 h-3 w-[80%] -translate-x-1/2 rounded-full bg-stone-900/20 blur-md"
      />
    </div>
  );
}
