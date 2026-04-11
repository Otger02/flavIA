"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Step = "email" | "code";

function getLocalizedPathname(pathname: string, locale: string) {
  if (locale === "en") {
    return pathname === "/" ? "/en" : `/en${pathname}`;
  }

  return pathname;
}

function isSafeRedirectPath(pathname: string | null): pathname is string {
  return !!pathname && pathname.startsWith("/") && !pathname.startsWith("//");
}

export default function LoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(t("login.errors.expired_link"));
    }
  }, [searchParams, t]);

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    });

    if (authError) {
      const isRateLimit = authError.status === 429 || authError.message?.includes("rate");
      setError(
        isRateLimit
          ? t("login.errors.rate_limit")
          : t("login.errors.send_code_failed"),
      );
      setLoading(false);
      return;
    }

    setStep("code");
    setLoading(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  async function verifyCode(fullCode: string) {
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: fullCode,
      type: "email",
    });

    if (verifyError) {
      setError(t("login.errors.invalid_code"));
      setCode(["", "", "", "", "", "", "", ""]);
      setLoading(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return;
    }

    const redirectTo = searchParams.get("redirectTo");
    const dashboardPath = getLocalizedPathname("/dashboard", locale);

    router.push(
      isSafeRedirectPath(redirectTo) ? redirectTo : dashboardPath,
    );
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join("");
    if (fullCode.length === 8) {
      void verifyCode(fullCode);
    }
  }

  function handleCodeKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;

    const newCode = [...code];
    for (let i = 0; i < 8; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);

    const nextEmpty = newCode.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 7 : nextEmpty]?.focus();

    if (pasted.length === 8) {
      void verifyCode(pasted);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fff8ef_0%,_#f7f3ec_48%,_#efe4d6_100%)] px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-stone-500 transition-colors hover:text-stone-700"
          >
            Flavia
          </Link>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900">
            {t("login.form.title")}
          </h1>
          <p className="mt-3 text-base leading-7 text-stone-600">
            {step === "email"
              ? t("login.form.subtitle_email")
              : t("login.form.subtitle_code")}
          </p>
        </div>

        {step === "code" ? (
          <div className="rounded-[1.5rem] border border-rose-200/60 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(180,120,100,0.10)] backdrop-blur">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-rose-400">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-stone-600">
              {t.rich("login.form.code_sent", {
                email: () => <span className="font-medium text-stone-800">{email}</span>,
              })}
            </p>

            <div className="mt-6 flex justify-center gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  title={t("login.form.digit_title", { index: i + 1 })}
                  aria-label={t("login.form.digit_label", { index: i + 1 })}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onPaste={i === 0 ? handleCodePaste : undefined}
                  disabled={loading}
                  className="h-12 w-9 rounded-lg border border-stone-300/80 bg-white text-center text-lg font-medium text-stone-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200/50 disabled:opacity-60"
                />
              ))}
            </div>

            {error ? (
              <p className="mt-4 text-sm text-rose-500">{error}</p>
            ) : null}

            {loading ? (
              <p className="mt-4 text-sm text-stone-500">{t("login.form.verifying")}</p>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode(["", "", "", "", "", "", "", ""]);
                setError(null);
              }}
              className="mt-6 text-xs text-stone-500 underline underline-offset-2 hover:text-stone-700"
            >
              {t("login.form.change_email")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSendCode}
            className="rounded-[1.5rem] border border-stone-200/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(180,120,100,0.10)] backdrop-blur"
          >
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              {t("login.form.email_label")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.form.email_placeholder")}
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-stone-300/80 bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-200/50 disabled:opacity-60"
            />

            {error ? (
              <p className="mt-3 text-sm text-rose-500">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.20)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.30)] disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? t("login.form.sending") : t("login.form.send_code")}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-stone-400">
              {t("login.form.spam_hint")}
            </p>

            <p className="mt-3 text-center text-xs leading-5 text-stone-500">
              {t("login.form.privacy_notice")}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
