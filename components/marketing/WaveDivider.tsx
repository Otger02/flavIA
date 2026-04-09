type WaveDividerProps = {
  /** "cream-to-blush" | "blush-to-cream" | "cream-to-white" */
  variant?: "cream-to-blush" | "blush-to-cream" | "cream-to-white";
  flip?: boolean;
};

const FILLS: Record<string, { top: string; bottom: string }> = {
  "cream-to-blush": { top: "#fef6ee", bottom: "#f5ddd5" },
  "blush-to-cream": { top: "#f5ddd5", bottom: "#fef6ee" },
  "cream-to-white": { top: "#fef6ee", bottom: "#ffffff" },
};

export function WaveDivider({ variant = "cream-to-blush", flip = false }: WaveDividerProps) {
  const { top, bottom } = FILLS[variant];

  return (
    <div
      className="pointer-events-none -my-1 w-full select-none overflow-hidden"
      aria-hidden="true"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block h-12 w-full sm:h-16 lg:h-20"
      >
        <path
          d="M0 40C240 70 480 10 720 40C960 70 1200 10 1440 40V80H0V40Z"
          fill={bottom}
          fillOpacity="0.5"
        />
        <path
          d="M0 50C360 20 720 70 1080 30C1260 15 1380 35 1440 45V80H0V50Z"
          fill={top}
          fillOpacity="0.3"
        />
      </svg>
    </div>
  );
}
