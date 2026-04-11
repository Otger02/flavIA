"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

type SessionSummaryCardProps = {
  sessionId: string;
};

type CardState = "idle" | "loading" | "done" | "error";

export function SessionSummaryCard({ sessionId }: SessionSummaryCardProps) {
  const t = useTranslations("dashboard");
  const [state, setState] = useState<CardState>("idle");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const generate = useCallback(async () => {
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("sections.summary_email_error"));
      }

      const data = (await res.json()) as { summary: string };
      setSummary(data.summary);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("sections.summary_email_error"));
      setState("error");
    }
  }, [sessionId]);

  const sendEmail = useCallback(async () => {
    setEmailState("sending");

    try {
      const res = await fetch("/api/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, sendEmail: true }),
      });

      if (!res.ok) {
        throw new Error(t("sections.summary_email_error"));
      }

      const data = (await res.json()) as { emailSent: boolean };
      setEmailState(data.emailSent ? "sent" : "error");
    } catch {
      setEmailState("error");
    }
  }, [sessionId]);

  if (state === "done") {
    return (
      <div className="rounded-[1.5rem] border border-rose-200/40 bg-gradient-to-b from-white/90 to-rose-50/40 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.08)]">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          {t("sections.summary_ready")}
        </p>
        <p className="mt-3 text-sm leading-7 text-stone-700 whitespace-pre-wrap">
          {summary}
        </p>
        <div className="mt-4">
          {emailState === "sent" ? (
            <p className="text-xs text-emerald-600">{t("sections.summary_email_sent")}</p>
          ) : (
            <button
              type="button"
              onClick={sendEmail}
              disabled={emailState === "sending"}
              className="rounded-full border border-stone-200/60 bg-white/80 px-4 py-2 text-xs font-medium text-stone-600 transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50 disabled:opacity-50"
            >
              {emailState === "sending" ? t("sections.summary_email_sending") : t("sections.summary_email_send")}
            </button>
          )}
          {emailState === "error" ? (
            <p className="mt-1 text-xs text-red-500">{t("sections.summary_email_error")}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-stone-200/50 bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)] backdrop-blur">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
        {t("sections.summary")}
      </p>
      <p className="mt-2 text-sm text-stone-500">
        {t("sections.summary_description")}
      </p>
      <button
        type="button"
        onClick={generate}
        disabled={state === "loading"}
        className="mt-4 rounded-full border border-rose-200/60 bg-white/80 px-5 py-2.5 text-xs font-medium text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {state === "loading" ? t("sections.summary_generating") : t("sections.summary_generate")}
      </button>
      {state === "error" && error ? (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
