"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type {
  PublicContentProposal,
  ScrapedPublicSource,
  SourceType,
} from "@/features/public-content/types";

type Tab = "sources" | "proposals";

export function PublicContentClient({
  sources,
  proposals,
}: {
  sources: ScrapedPublicSource[];
  proposals: PublicContentProposal[];
}) {
  const t = useTranslations("public-content");
  const [tab, setTab] = useState<Tab>("sources");

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 border-b border-stone-200">
        <TabButton active={tab === "sources"} onClick={() => setTab("sources")}>
          {t("tab.sources")} ({sources.length})
        </TabButton>
        <TabButton active={tab === "proposals"} onClick={() => setTab("proposals")}>
          {t("tab.proposals")} ({proposals.filter((p) => p.status === "pending").length})
        </TabButton>
      </nav>

      {tab === "sources" ? <SourcesTab sources={sources} /> : <ProposalsTab proposals={proposals} />}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative -mb-px border-b-2 px-4 py-2 text-sm transition ${
        active
          ? "border-rose-500 text-stone-900 font-medium"
          : "border-transparent text-stone-500 hover:text-stone-800"
      }`}
    >
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Sources tab
// ──────────────────────────────────────────────────────────────────────

function SourcesTab({ sources }: { sources: ScrapedPublicSource[] }) {
  const t = useTranslations("public-content");
  return (
    <div className="space-y-6">
      <AddSourceForm />

      <div className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-stone-900">
          {t("sources.list_title")}
        </h2>
        {sources.length === 0 ? (
          <p className="text-sm text-stone-500">{t("sources.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {sources.map((source) => (
              <SourceRow key={source.id} source={source} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const SOURCE_TYPE_OPTIONS: SourceType[] = ["youtube", "media_article", "podcast_transcript", "manual_text"];

function AddSourceForm() {
  const t = useTranslations("public-content");
  const router = useRouter();
  const [sourceType, setSourceType] = useState<SourceType>("youtube");
  const [sourceUrl, setSourceUrl] = useState("");
  const [titleOverride, setTitleOverride] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const needsUrl = sourceType !== "manual_text";
  const needsText = sourceType === "manual_text" || sourceType === "podcast_transcript";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/public-content/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          sourceUrl: sourceUrl.trim() || undefined,
          titleOverride: titleOverride.trim() || undefined,
          author: author.trim() || undefined,
          publishedAt: publishedAt || undefined,
          rawText: rawText.trim() || undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "unknown_error");
        return;
      }
      setSourceUrl("");
      setTitleOverride("");
      setAuthor("");
      setPublishedAt("");
      setRawText("");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-[0_4px_16px_rgba(180,120,100,0.05)]"
    >
      <h2 className="font-[family-name:var(--font-display)] text-lg text-stone-900">
        {t("sources.add_title")}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-stone-700">{t("field.source_type")}</span>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
          >
            {SOURCE_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(`source_type.${opt}`)}
              </option>
            ))}
          </select>
        </label>

        {needsUrl ? (
          <label className="block text-sm">
            <span className="font-medium text-stone-700">{t("field.source_url")}</span>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required={needsUrl}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="font-medium text-stone-700">{t("field.title_override")}</span>
          <input
            type="text"
            value={titleOverride}
            onChange={(e) => setTitleOverride(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
            placeholder={t("field.title_placeholder")}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-stone-700">{t("field.author")}</span>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
            placeholder="Flavia Dos Santos"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-stone-700">{t("field.published_at")}</span>
          <input
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      {needsText ? (
        <label className="block text-sm">
          <span className="font-medium text-stone-700">{t("field.raw_text")}</span>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            required={sourceType === "manual_text"}
            rows={8}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-mono"
            placeholder={t("field.raw_text_placeholder")}
          />
        </label>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
          {t("error.prefix")}: <span className="font-mono">{error}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2 text-sm font-medium text-white shadow-[0_6px_18px_rgba(196,96,90,0.25)] transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        {isPending ? t("sources.adding") : t("sources.add_cta")}
      </button>
    </form>
  );
}

function SourceRow({ source }: { source: ScrapedPublicSource }) {
  const t = useTranslations("public-content");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function callEndpoint(endpoint: "process" | "reprocess") {
    setError(null);
    startTransition(async () => {
      const res = await fetch(
        `/api/admin/public-content/sources/${source.id}/${endpoint}`,
        { method: "POST" },
      );
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        proposalCount?: number;
        llmRejected?: number;
        reason?: string;
      };
      if (!res.ok) {
        setError(json.reason ?? "unknown_error");
        return;
      }
      router.refresh();
    });
  }
  const onProcess = () => callEndpoint("process");
  const onReprocess = () => callEndpoint("reprocess");

  const statusColor =
    source.status === "processed"
      ? "bg-emerald-100 text-emerald-800"
      : source.status === "failed"
        ? "bg-rose-100 text-rose-800"
        : "bg-amber-100 text-amber-800";

  return (
    <li className="rounded-xl border border-stone-200 bg-white/80 p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusColor}`}>
              {source.status}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-stone-500">
              {source.sourceType}
            </span>
          </div>
          <p className="mt-1 truncate font-medium text-stone-900">{source.title}</p>
          <p className="truncate font-mono text-[11px] text-stone-500">{source.sourceUrl}</p>
          {source.errorDetails ? (
            <p className="mt-1 truncate text-[11px] text-rose-700">
              {JSON.stringify(source.errorDetails)}
            </p>
          ) : null}
          <p className="mt-1 text-[11px] text-stone-500">
            {t("sources.raw_chars", { count: source.rawText.length })}
            {source.processedAt
              ? ` · ${t("sources.processed_at")} ${new Date(source.processedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {source.status !== "processed" && source.rawText.length > 0 ? (
            <button
              type="button"
              onClick={onProcess}
              disabled={isPending}
              className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
            >
              {isPending ? t("sources.processing") : t("sources.process_cta")}
            </button>
          ) : null}
          {source.status === "processed" && source.rawText.length > 0 ? (
            <button
              type="button"
              onClick={onReprocess}
              disabled={isPending}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
              title={t("sources.reprocess_help")}
            >
              {isPending ? t("sources.processing") : t("sources.reprocess_cta")}
            </button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="mt-2 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-900">
          {error}
        </p>
      ) : null}
    </li>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Proposals tab
// ──────────────────────────────────────────────────────────────────────

function ProposalsTab({ proposals }: { proposals: PublicContentProposal[] }) {
  const t = useTranslations("public-content");
  const pending = proposals.filter((p) => p.status === "pending");
  const reviewed = proposals.filter((p) => p.status !== "pending");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg text-stone-900">
          {t("proposals.pending_title")}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">{t("proposals.empty_pending")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {pending.map((p) => (
              <ProposalRow key={p.id} proposal={p} />
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg text-stone-900">
          {t("proposals.reviewed_title")}
        </h2>
        {reviewed.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">{t("proposals.empty_reviewed")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {reviewed.map((p) => (
              <ProposalRow key={p.id} proposal={p} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProposalRow({ proposal }: { proposal: PublicContentProposal }) {
  const t = useTranslations("public-content");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  function approve() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/public-content/proposals/${proposal.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNotes: notes.trim() || undefined }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError(json.error ?? "unknown_error");
        return;
      }
      router.refresh();
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/public-content/proposals/${proposal.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNotes: notes.trim() || undefined }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError(json.error ?? "unknown_error");
        return;
      }
      router.refresh();
    });
  }

  const statusColor =
    proposal.status === "approved"
      ? "bg-emerald-100 text-emerald-800"
      : proposal.status === "rejected"
        ? "bg-stone-200 text-stone-700"
        : proposal.status === "published"
          ? "bg-sky-100 text-sky-900"
          : "bg-amber-100 text-amber-800";

  return (
    <li className="space-y-3 rounded-2xl border border-stone-200 bg-white/80 p-5 text-sm shadow-[0_2px_10px_rgba(180,120,100,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusColor}`}>
          {proposal.status}
        </span>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-700">
          {proposal.proposalType.replace(/_/g, " ")}
        </span>
        {proposal.suggestedTopics.map((topic) => (
          <span key={topic} className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700">
            {topic}
          </span>
        ))}
      </div>

      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg italic text-stone-900">
          {proposal.title}
        </h3>
        <p className="mt-1 text-sm text-stone-600">{proposal.excerpt}</p>
      </div>

      <details className="rounded-lg border border-stone-200 bg-stone-50/60 p-3">
        <summary className="cursor-pointer text-xs font-medium text-stone-700">
          {t("proposals.full_content_title")}
        </summary>
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-6 text-stone-700">
          {proposal.fullContent}
        </pre>
      </details>

      <details className="rounded-lg border border-amber-200/60 bg-amber-50/40 p-3">
        <summary className="cursor-pointer text-xs font-medium text-amber-900">
          {t("proposals.source_quote_title")}
        </summary>
        <blockquote className="mt-2 border-l-2 border-amber-300 pl-3 text-xs italic leading-6 text-amber-900">
          “{proposal.sourceQuote}”
        </blockquote>
      </details>

      {proposal.rationale ? (
        <p className="text-[11px] italic text-stone-500">{proposal.rationale}</p>
      ) : null}

      {proposal.sanityDraftId ? (
        <p className="text-[11px] text-emerald-700">
          {t("proposals.sanity_draft_label")}: <span className="font-mono">{proposal.sanityDraftId}</span>
        </p>
      ) : null}

      {proposal.status === "pending" ? (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("proposals.notes_placeholder")}
            rows={2}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={approve}
              disabled={isPending}
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {t("proposals.approve_cta")}
            </button>
            <button
              type="button"
              onClick={reject}
              disabled={isPending}
              className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
            >
              {t("proposals.reject_cta")}
            </button>
          </div>
          {error ? (
            <p className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-900">{error}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-[11px] text-stone-500">
          {proposal.reviewNotes ? `Notes: ${proposal.reviewNotes}` : null}
        </p>
      )}
    </li>
  );
}
