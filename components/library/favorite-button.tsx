"use client";

import { useCallback, useState, useTransition } from "react";

type FavoriteButtonProps = {
  itemId: string;
  itemType?: string;
  initialFavorited: boolean;
};

export function FavoriteButton({
  itemId,
  itemType = "content",
  initialFavorited,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const toggle = useCallback(() => {
    startTransition(async () => {
      // Optimistic update
      const prev = favorited;
      setFavorited(!prev);

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, itemType }),
        });

        if (!res.ok) {
          // Revert on failure
          setFavorited(prev);
          return;
        }

        const data = (await res.json()) as { favorited: boolean };
        setFavorited(data.favorited);
      } catch {
        // Revert on network error
        setFavorited(prev);
      }
    });
  }, [favorited, itemId, itemType]);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`group inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
        favorited
          ? "bg-rose-100 text-rose-500 hover:bg-rose-200"
          : "bg-white/80 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={favorited ? 0 : 1.5}
        className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
