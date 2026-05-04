import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/features/professional-verification/server/admin-guard";
import {
  getSignedDocumentUrls,
  getVerificationByIdForAdmin,
} from "@/features/professional-verification/server/list-all";
import {
  approveVerification,
  rejectVerification,
} from "@/features/professional-verification/server/approve";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatDate, getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("verification.admin");
  return { title: t("page_title") };
}

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  revoked: "bg-stone-200 text-stone-600",
};

function isImagePath(path: string): boolean {
  return /\.(jpe?g|png|gif|webp)$/i.test(path);
}

export default async function AdminVerificationDetailPage({ params }: Props) {
  const admin = await requireAdmin();
  const { id } = await params;
  const t = await getTranslations("verification.admin");
  const tType = await getTranslations("verification.professional_type");
  const locale = await getLocale();

  const verification = await getVerificationByIdForAdmin(id);
  if (!verification) {
    notFound();
  }

  const signedDocs = await getSignedDocumentUrls(verification.documentStoragePaths);
  const archivedSignedDocs =
    verification.archivedDocumentPaths.length > 0
      ? await getSignedDocumentUrls(verification.archivedDocumentPaths)
      : [];

  // Audit log (admin client — bypasses RLS)
  const adminClient = createAdminSupabaseClient();
  const { data: audit } = await adminClient
    .from("professional_verification_audit")
    .select("id, action, notes, admin_user_id, created_at")
    .eq("verification_id", verification.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // ── Server actions for approve/reject ──────────────────────────────
  async function handleApprove(formData: FormData) {
    "use server";
    const adminCheck = await requireAdmin();
    const verificationId = String(formData.get("verificationId") ?? "");
    const displayName = formData.get("displayName");
    const override = typeof displayName === "string" && displayName.trim().length > 0
      ? displayName.trim()
      : undefined;
    const result = await approveVerification({
      verificationId,
      adminUserId: adminCheck.id,
      approvedDisplayNameOverride: override,
    });
    if (!result.ok) {
      throw new Error(`Approve failed: ${result.error}`);
    }
    revalidatePath(`/admin/profesionales/${verificationId}`);
    revalidatePath("/admin/profesionales");
    redirect("/admin/profesionales");
  }

  async function handleReject(formData: FormData) {
    "use server";
    const adminCheck = await requireAdmin();
    const verificationId = String(formData.get("verificationId") ?? "");
    const reason = String(formData.get("reason") ?? "");
    const result = await rejectVerification({
      verificationId,
      adminUserId: adminCheck.id,
      reason,
    });
    if (!result.ok) {
      throw new Error(`Reject failed: ${result.error}`);
    }
    revalidatePath(`/admin/profesionales/${verificationId}`);
    revalidatePath("/admin/profesionales");
    redirect("/admin/profesionales");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/admin/profesionales"
        className="inline-flex text-sm font-medium text-stone-600 underline underline-offset-4"
      >
        {t("detail_back")}
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[verification.status] ?? "bg-stone-200 text-stone-700"}`}
          >
            {verification.status}
          </span>
          <span className="text-xs text-stone-500">
            {t("submitted_at", { date: formatDate(verification.submittedAt, locale) ?? "" })}
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {verification.fullLegalName}
        </h1>
        <p className="text-sm text-stone-600">
          {tType(verification.professionalType)}
          {verification.specialty ? ` · ${verification.specialty}` : ""}
          {" · "}
          <span className="font-mono text-xs">
            {verification.licenseNumber} ({verification.licenseCountry})
          </span>
        </p>
        {verification.userEmail ? (
          <p className="text-xs text-stone-500">{verification.userEmail}</p>
        ) : null}
      </header>

      {verification.bio ? (
        <section className="rounded-[1.25rem] border border-stone-200 bg-white p-5 text-sm leading-6 text-stone-700">
          {verification.bio}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        {verification.linkedinUrl ? (
          <a
            href={verification.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-800 transition hover:bg-stone-50"
          >
            LinkedIn → {verification.linkedinUrl}
          </a>
        ) : null}
        {verification.websiteUrl ? (
          <a
            href={verification.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-800 transition hover:bg-stone-50"
          >
            Web → {verification.websiteUrl}
          </a>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          {t("detail_documents_title")}
        </h2>
        {signedDocs.length === 0 ? (
          <p className="text-sm text-stone-500">{t("detail_no_documents")}</p>
        ) : (
          <ul className="space-y-3">
            {signedDocs.map((doc) => (
              <li
                key={doc.path}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                {doc.signedUrl ? (
                  isImagePath(doc.path) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={doc.signedUrl}
                      alt=""
                      className="max-h-[480px] w-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={doc.signedUrl}
                      title={doc.path}
                      className="h-[480px] w-full"
                    />
                  )
                ) : (
                  <p className="px-4 py-3 text-sm text-rose-600">
                    Signed URL unavailable for: {doc.path}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2 border-t border-stone-100 px-4 py-2">
                  <span className="truncate font-mono text-[11px] text-stone-500">
                    {doc.path}
                  </span>
                  {doc.signedUrl ? (
                    <a
                      href={doc.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Abrir
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {archivedSignedDocs.length > 0 ? (
          <details className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <summary className="cursor-pointer text-xs font-medium text-stone-600">
              {t("detail_archived_title")} ({archivedSignedDocs.length})
            </summary>
            <ul className="mt-3 space-y-2">
              {archivedSignedDocs.map((doc) => (
                <li
                  key={doc.path}
                  className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2"
                >
                  <span className="truncate font-mono text-[11px] text-stone-500">
                    {doc.path}
                  </span>
                  {doc.signedUrl ? (
                    <a
                      href={doc.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Abrir
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      {/* Approve / reject actions only when pending or rejected (allow re-decisioning) */}
      {(verification.status === "pending" || verification.status === "rejected") && (
        <section className="grid gap-4 md:grid-cols-2">
          <form
            action={handleApprove}
            className="rounded-[1.25rem] border border-emerald-200/70 bg-emerald-50/40 p-5"
          >
            <input type="hidden" name="verificationId" value={verification.id} />
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
              {t("approve_display_name_label")}
            </label>
            <input
              type="text"
              name="displayName"
              defaultValue={
                verification.approvedDisplayName ?? verification.fullLegalName
              }
              className="mt-2 w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-emerald-700 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-emerald-800"
            >
              {t("action_approve")}
            </button>
          </form>

          <form
            action={handleReject}
            className="rounded-[1.25rem] border border-rose-200/70 bg-rose-50/40 p-5"
          >
            <input type="hidden" name="verificationId" value={verification.id} />
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-rose-700">
              {t("reject_reason_label")}
            </label>
            <textarea
              name="reason"
              required
              minLength={4}
              maxLength={500}
              rows={4}
              className="mt-2 w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-rose-500"
            />
            <p className="mt-1 text-[11px] text-stone-500">{t("reject_reason_help")}</p>
            <button
              type="submit"
              className="mt-3 w-full rounded-full bg-rose-700 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-rose-800"
            >
              {t("action_reject")}
            </button>
          </form>
        </section>
      )}

      {(audit ?? []).length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            {t("detail_audit_title")}
          </h2>
          <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
            {(audit ?? []).map((row) => (
              <li key={row.id} className="px-4 py-2.5 text-xs text-stone-600">
                <span className="font-medium text-stone-800">{row.action}</span>
                {" — "}
                <span className="text-stone-400">
                  {formatDate(row.created_at as string, locale)}
                </span>
                {row.admin_user_id ? (
                  <span className="ml-2 font-mono text-[10px] text-stone-400">
                    {String(row.admin_user_id).slice(0, 8)}
                  </span>
                ) : null}
                {row.notes ? (
                  <p className="mt-1 text-stone-700">{row.notes as string}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Suppress unused-var lint for admin handle in non-action paths */}
      <span className="hidden">{admin.id}</span>
    </div>
  );
}
