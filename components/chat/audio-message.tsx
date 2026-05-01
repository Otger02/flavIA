"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const WAVEFORM_BARS = Array.from({ length: 26 }, (_, index) => {
  const seed = (Math.sin(index * 1.7) + 1) / 2;
  const height = 30 + seed * 60;
  return Math.round(height);
});

let currentlyPlayingAudio: HTMLAudioElement | null = null;

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type AudioMessageProps = {
  text: string;
  locked?: boolean;
};

export function AudioMessage({ text, locked = false }: AudioMessageProps) {
  const t = useTranslations("shared");
  const [loading, setLoading] = useState(!locked);
  const [playing, setPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [showText, setShowText] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (locked) return;
    let cancelled = false;

    async function fetchAudio() {
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`tts_status_${response.status}`);
        }

        const blob = await response.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setAudioUrl(url);
      } catch {
        if (!cancelled) {
          setError(true);
          setShowText(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchAudio();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [text, locked]);

  useEffect(() => {
    return () => {
      if (currentlyPlayingAudio === audioRef.current) {
        currentlyPlayingAudio = null;
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (locked) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
        currentlyPlayingAudio.pause();
      }
      void audio.play().then(() => {
        currentlyPlayingAudio = audio;
      });
    } else {
      audio.pause();
    }
  };

  const progressRatio = duration > 0 ? Math.min(1, progress / duration) : 0;
  const activeBarCount = Math.round(progressRatio * WAVEFORM_BARS.length);

  return (
    <div className="w-fit">
      <div
        className={`flex items-center gap-3 rounded-2xl rounded-bl-md border border-rose-200/50 bg-gradient-to-b from-white to-rose-50/80 px-4 py-3 shadow-[0_6px_16px_rgba(180,120,100,0.08)] ${
          loading && !locked ? "animate-pulse" : ""
        }`}
      >
        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={locked || loading || error || !audioUrl}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#c4605a] to-[#b06050] text-white shadow-[0_4px_12px_rgba(176,96,80,0.35)] transition-transform hover:scale-105 disabled:opacity-70"
          aria-label={
            locked
              ? t("chat.audio_locked_label")
              : playing
                ? t("chat.audio_hide_text")
                : t("chat.audio_show_text")
          }
        >
          {locked ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 11V8a6 6 0 0112 0v3M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className={`flex h-8 items-center gap-[3px] ${locked ? "opacity-40 blur-[1px]" : ""}`}>
          {WAVEFORM_BARS.map((heightPercent, index) => {
            const isActive = !locked && !loading && index < activeBarCount;
            return (
              <span
                key={index}
                className="block w-[3px] rounded-full transition-colors"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: isActive ? "#b06050" : "#d8a89c",
                }}
              />
            );
          })}
        </div>

        <span className="ml-1 text-[11px] font-medium tabular-nums text-stone-500">
          {locked
            ? "—:—"
            : error
              ? "—:—"
              : duration > 0
                ? formatDuration(playing ? progress : duration)
                : "0:00"}
        </span>
      </div>

      {audioUrl ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onPlay={() => {
            setPlaying(true);
            setHasPlayedOnce(true);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
            if (currentlyPlayingAudio === audioRef.current) {
              currentlyPlayingAudio = null;
            }
          }}
        />
      ) : null}

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-1 text-[11px] text-stone-500">
        {locked ? (
          <Link
            href="/plans"
            className="font-medium text-[#b06050] underline-offset-2 hover:underline"
          >
            {t("chat.audio_locked_label")}
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowText((value) => !value)}
              className="font-medium text-[#b06050] underline-offset-2 hover:underline"
            >
              {showText ? t("chat.audio_hide_text") : t("chat.audio_show_text")}
            </button>
            {!loading && !error && audioUrl && !hasPlayedOnce ? (
              <span className="italic text-stone-400">{t("chat.audio_ready")}</span>
            ) : null}
            {error ? (
              <span className="flex items-center gap-1 text-stone-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t("chat.audio_unavailable")}
              </span>
            ) : null}
          </>
        )}
      </div>

      {(showText || error || locked) && (
        <div className="mt-2 max-w-xl rounded-2xl rounded-bl-md border border-rose-200/40 bg-white/80 px-4 py-3 text-sm leading-relaxed text-stone-700 shadow-[0_4px_12px_rgba(180,120,100,0.06)]">
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  );
}
