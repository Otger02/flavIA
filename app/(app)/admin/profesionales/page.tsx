import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/features/professional-verification/server/admin-guard";
import { listAllVerifications } from "@/features/professional-verification/server/list-all";
import { formatDate, getLocale } from "@/lib/locale";
import {
  PROFESSIONAL_TYPES,
  VERIFICATION_STATUSES,
  type ProfessionalType,
  type VerificationStatus,
} from "@/features/professional-verification/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("verification.admin");
  return { title: t("page_title") };
}

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string; type?: string }>;
};

const STATUS_BADGE: Record<VerificationStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  revoked: "bg-stone-200 text-stone-600",
};

function isStatus(v: string | undefined): VerificationStatus | null {
  return v && (VERIFICATION_STATUSES as readonly string[]).includes(v)
    ? (v as VerificationStatus)
    : null;
}

function isType(v: string | undefined): ProfessionalType | null {
  return v && (PROFESSIONAL_TYPES as readonly string[]).includes(v)
    ? (v as ProfessionalType)
    : null;
}

export default async function AdminVerificationsListPage({ searchParams }: Props) {
  await requireAdmin();
  const t = await getTranslations("verification.admin");
  const tType = await getTranslations("verification.professional_type");
  const locale = await getLocale();
  const params = await searchParams;
  const status = isStatus(params.status);
  const type = isType(params.type);

  const rows = await listAllVerifications({
    status: status ?? null,
    professionalType: type ?? null,
  });

  function buildHref(next: { status?: string | null; type?: string | null }) {
    const sp = new URLSearchParams();
    const s = next.status === undefined ? status : next.status;
    const tp = next.type === undefined ? type : next.type;
    if (s) sp.set("status", s);
    if (tp) sp.set("type", tp);
    const q = sp.toString();
    return `/admin/profesionales${q ? `?${q}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
          {t("page_eyebrow")}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {t("page_title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{t("page_subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
          {t("filter_status")}:
        </span>
        <FilterChip href={buildHref({ status: null })} active={!status}>
          {t("filter_all")}
        </FilterChip>
        {VERIFICATION_STATUSES.map((s) => (
          <FilterChip key={s} href={buildHref({ status: s })} active={status === s}>
            <span
              className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${STATUS_BADGE[s].split(" ")[0]}`}
            />
            {s}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
          {t("filter_type")}:
        </span>
        <FilterChip href={buildHref({ type: null })} active={!type}>
          {t("filter_all")}
        </FilterChip>
        {PROFESSIONAL_TYPES.map((tp) => (
          <FilterChip key={tp} href={buildHref({ type: tp })} active={type === tp}>
            {tType(tp)}
          </FilterChip>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/70 p-8 text-sm leading-6 text-stone-600">
          {t("empty_state")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.5rem] border border-stone-200/60 bg-white/80 shadow-[0_4px_16px_rgba(180,120,100,0.04)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-100 text-[10px] uppercase tracking-[0.12em] text-stone-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t("col_user")}</th>
                <th className="px-4 py-3 font-medium">{t("col_type")}</th>
                <th className="px-4 py-3 font-medium">{t("col_name")}</th>
                <th className="px-4 py-3 font-medium">{t("col_license")}</th>
                <th className="px-4 py-3 font-medium">{t("col_submitted")}</th>
                <th className="px-4 py-3 font-medium">{t("col_status")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rows.map((row) => {
                const masked = row.userEmail
                  ? `${row.userEmail.slice(0, 3)}***@${row.userEmail.split("@")[1] ?? "?"}`
                  : "—";
                return (
                  <tr key={row.id} className="text-stone-700">
                    <td className="px-4 py-3 font-mono text-xs">{masked}</td>
                    <td className="px-4 py-3">{tType(row.professionalType)}</td>
                    <td className="px-4 py-3">{row.fullLegalName}</td>
                    <td className="px-4 py-3 text-xs text-stone-500">
                      {row.licenseNumber} ({row.licenseCountry})
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500">
                      {formatDate(row.submittedAt, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/profesionales/${row.id}`}
                        className="text-xs font-medium text-rose-600 hover:underline"
                      >
                        {t("review_cta")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip(props: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={props.href}
      className={`rounded-full px-3 py-1.5 text-xs transition ${
        props.active
          ? "bg-rose-500 text-white"
          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
      }`}
    >
      {props.children}
    </Link>
  );
}
