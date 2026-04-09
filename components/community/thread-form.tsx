"use client";

import { useState } from "react";
import {
  COMMUNITY_TOPICS,
  COMMUNITY_TOPIC_LABELS,
  THREAD_TITLE_MIN,
  THREAD_TITLE_MAX,
  THREAD_BODY_MIN,
  THREAD_BODY_MAX,
} from "@/features/community/constants";
import type { CommunityTopic } from "@/features/community/constants";

type ThreadFormState = "idle" | "submitting" | "success" | "error";

export function ThreadForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [formState, setFormState] = useState<ThreadFormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [moderated, setModerated] = useState(false);

  const isValid =
    title.trim().length >= THREAD_TITLE_MIN &&
    title.trim().length <= THREAD_TITLE_MAX &&
    body.trim().length >= THREAD_BODY_MIN &&
    body.trim().length <= THREAD_BODY_MAX;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || formState === "submitting") return;

    setFormState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/community/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, topic: topic || null, isAnonymous }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la conversacion");
      }

      setModerated(data.moderated === true);
      setFormState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error desconocido");
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/60 p-8 text-center">
        <h3 className="font-[family-name:var(--font-display)] text-xl text-emerald-800">
          {moderated ? "Tu conversacion esta siendo revisada" : "Conversacion creada"}
        </h3>
        <p className="mt-2 text-sm text-emerald-700">
          {moderated
            ? "Sera visible una vez aprobada por el equipo."
            : "Ya esta visible en la comunidad."}
        </p>
        <a
          href="/comunidad"
          className="mt-4 inline-block rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5"
        >
          Volver a la comunidad
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="thread-title" className="mb-1.5 block text-sm font-medium text-stone-700">
          Titulo
        </label>
        <input
          id="thread-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={THREAD_TITLE_MAX}
          placeholder="¿De que te gustaria hablar?"
          className="w-full rounded-xl border border-stone-200/60 bg-white/80 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
        />
        <p className="mt-1 text-xs text-stone-400">
          {title.length}/{THREAD_TITLE_MAX}
        </p>
      </div>

      <div>
        <label htmlFor="thread-topic" className="mb-1.5 block text-sm font-medium text-stone-700">
          Tema (opcional)
        </label>
        <select
          id="thread-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-xl border border-stone-200/60 bg-white/80 px-4 py-3 text-stone-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
        >
          <option value="">Sin tema especifico</option>
          {COMMUNITY_TOPICS.map((t) => (
            <option key={t} value={t}>
              {COMMUNITY_TOPIC_LABELS[t as CommunityTopic]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="thread-body" className="mb-1.5 block text-sm font-medium text-stone-700">
          Contenido
        </label>
        <textarea
          id="thread-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={THREAD_BODY_MAX}
          rows={8}
          placeholder="Comparte tu experiencia, pregunta, o reflexion..."
          className="w-full rounded-xl border border-stone-200/60 bg-white/80 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
        />
        <div className="mt-1 flex justify-between text-xs text-stone-400">
          <span>Minimo {THREAD_BODY_MIN} caracteres</span>
          <span>{body.length}/{THREAD_BODY_MAX}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isAnonymous}
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isAnonymous ? "bg-rose-400" : "bg-stone-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isAnonymous ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm text-stone-600">
          {isAnonymous ? "Publicar de forma anonima" : "Publicar con tu nombre"}
        </span>
      </div>

      {formState === "error" && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || formState === "submitting"}
        className="w-full rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(220,100,100,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(220,100,100,0.25)] disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {formState === "submitting" ? "Publicando..." : "Publicar conversacion"}
      </button>
    </form>
  );
}
