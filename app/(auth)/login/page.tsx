"use client";

import { useState } from "react";
import Link from "next/link";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (authError) {
      setError("No hemos podido enviarte el enlace. Revisa tu email e intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
            Tu espacio empieza aquí
          </h1>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Entra con tu email. Sin contraseñas, sin complicaciones.
          </p>
        </div>

        {sent ? (
          <div className="rounded-[1.5rem] border border-rose-200/60 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(180,120,100,0.10)] backdrop-blur">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-rose-400">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">Revisa tu correo</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Te hemos enviado un enlace mágico a <span className="font-medium text-stone-800">{email}</span>.
              Haz clic en él para entrar.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.5rem] border border-stone-200/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(180,120,100,0.10)] backdrop-blur"
          >
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
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
              {loading ? "Enviando..." : "Enviar enlace mágico"}
            </button>

            <p className="mt-6 text-center text-xs leading-5 text-stone-500">
              Al continuar aceptas que tus conversaciones se guardan de forma privada para mejorar tu experiencia.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
