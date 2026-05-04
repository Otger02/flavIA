"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  PROFESSIONAL_DOCUMENT_ALLOWED_MIME,
  PROFESSIONAL_DOCUMENT_MAX_BYTES,
  PROFESSIONAL_TYPES,
  type ProfessionalType,
  type ProfessionalVerification,
} from "@/features/professional-verification/types";

const TOTAL_STEPS = 6;

type FileRowState =
  | { status: "uploading"; localKey: string; name: string }
  | {
      status: "uploaded";
      localKey: string;
      name: string;
      storagePath: string;
    }
  | { status: "failed"; localKey: string; name: string; error: string };

type Props = {
  userId: string;
  initial?: ProfessionalVerification | null;
};

export function VerificationForm({ userId, initial }: Props) {
  const t = useTranslations("verification.form");
  const tType = useTranslations("verification.professional_type");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state — pre-filled when re-editing a rejected/pending submission.
  const [professionalType, setProfessionalType] = useState<ProfessionalType>(
    initial?.professionalType ?? "psychologist",
  );
  const [specialty, setSpecialty] = useState(initial?.specialty ?? "");
  const [fullLegalName, setFullLegalName] = useState(initial?.fullLegalName ?? "");
  const [licenseNumber, setLicenseNumber] = useState(initial?.licenseNumber ?? "");
  const [licenseCountry, setLicenseCountry] = useState(
    initial?.licenseCountry ?? "CO",
  );
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedinUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? "");
  const [approvedDisplayName, setApprovedDisplayName] = useState(
    initial?.approvedDisplayName ?? initial?.fullLegalName ?? "",
  );
  const [files, setFiles] = useState<FileRowState[]>(() =>
    (initial?.documentStoragePaths ?? []).map((path, index) => ({
      status: "uploaded" as const,
      localKey: `prefilled-${index}`,
      name: path.split("/").pop() ?? path,
      storagePath: path,
    })),
  );
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default the public name to the legal name as it changes, unless the
  // user has already touched it.
  const displayNameTouchedRef = useRef(Boolean(initial?.approvedDisplayName));
  useEffect(() => {
    if (!displayNameTouchedRef.current) {
      setApprovedDisplayName(fullLegalName);
    }
  }, [fullLegalName]);

  const uploadedPaths = useMemo(
    () =>
      files
        .filter((f): f is Extract<FileRowState, { status: "uploaded" }> => f.status === "uploaded")
        .map((f) => f.storagePath),
    [files],
  );

  function validateStep(current: number): Record<string, string> {
    const errors: Record<string, string> = {};
    if (current === 2) {
      if (fullLegalName.trim().length < 2) errors.fullLegalName = t("validation_required");
      if (licenseNumber.trim().length < 1) errors.licenseNumber = t("validation_required");
      const country = licenseCountry.trim().toUpperCase();
      if (country.length !== 2) errors.licenseCountry = t("validation_country");
    }
    if (current === 3) {
      if (linkedinUrl && !isValidUrl(linkedinUrl)) errors.linkedinUrl = t("validation_url");
      if (websiteUrl && !isValidUrl(websiteUrl)) errors.websiteUrl = t("validation_url");
    }
    if (current === 4) {
      if (approvedDisplayName.trim().length < 2)
        errors.approvedDisplayName = t("validation_required");
    }
    if (current === 5) {
      if (uploadedPaths.length === 0) errors.documents = t("validation_no_documents");
    }
    return errors;
  }

  function handleNext() {
    const errors = validateStep(step);
    setStepErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  }

  function handlePrev() {
    setStepErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleFileSelect(selected: FileList | null) {
    if (!selected) return;
    const supabase = createBrowserSupabaseClient();

    for (const file of Array.from(selected)) {
      if (files.length >= 8) break;
      if (!PROFESSIONAL_DOCUMENT_ALLOWED_MIME.includes(file.type as (typeof PROFESSIONAL_DOCUMENT_ALLOWED_MIME)[number])) {
        continue;
      }
      if (file.size > PROFESSIONAL_DOCUMENT_MAX_BYTES) {
        continue;
      }

      const localKey = crypto.randomUUID();
      setFiles((prev) => [
        ...prev,
        { status: "uploading", localKey, name: file.name },
      ]);

      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const storagePath = `${userId}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from("professional-documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.localKey === localKey
              ? { status: "failed", localKey, name: file.name, error: error.message }
              : f,
          ),
        );
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.localKey === localKey
              ? { status: "uploaded", localKey, name: file.name, storagePath }
              : f,
          ),
        );
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemoveFile(row: FileRowState) {
    if (row.status === "uploaded") {
      const supabase = createBrowserSupabaseClient();
      await supabase.storage.from("professional-documents").remove([row.storagePath]).catch(() => null);
    }
    setFiles((prev) => prev.filter((f) => f.localKey !== row.localKey));
  }

  function handleSubmit() {
    const errors = validateStep(5);
    setStepErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStep(5);
      return;
    }
    setSubmitError(null);

    startTransition(async () => {
      const response = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalType,
          specialty: specialty.trim() || null,
          fullLegalName: fullLegalName.trim(),
          licenseNumber: licenseNumber.trim(),
          licenseCountry: licenseCountry.trim().toUpperCase(),
          bio: bio.trim() || null,
          linkedinUrl: linkedinUrl.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
          approvedDisplayName: approvedDisplayName.trim(),
          documentStoragePaths: uploadedPaths,
        }),
      });

      if (!response.ok) {
        setSubmitError(t("submit_error"));
        return;
      }

      router.push("/perfil/verificacion/success");
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400">
        {t("step_label", { current: step, total: TOTAL_STEPS })}
      </p>

      {step === 1 ? (
        <Step1
          professionalType={professionalType}
          setProfessionalType={setProfessionalType}
          specialty={specialty}
          setSpecialty={setSpecialty}
        />
      ) : null}

      {step === 2 ? (
        <Step2
          fullLegalName={fullLegalName}
          setFullLegalName={setFullLegalName}
          licenseNumber={licenseNumber}
          setLicenseNumber={setLicenseNumber}
          licenseCountry={licenseCountry}
          setLicenseCountry={setLicenseCountry}
          errors={stepErrors}
        />
      ) : null}

      {step === 3 ? (
        <Step3
          bio={bio}
          setBio={setBio}
          linkedinUrl={linkedinUrl}
          setLinkedinUrl={setLinkedinUrl}
          websiteUrl={websiteUrl}
          setWebsiteUrl={setWebsiteUrl}
          errors={stepErrors}
        />
      ) : null}

      {step === 4 ? (
        <Step4
          approvedDisplayName={approvedDisplayName}
          setApprovedDisplayName={(v) => {
            displayNameTouchedRef.current = true;
            setApprovedDisplayName(v);
          }}
          errors={stepErrors}
        />
      ) : null}

      {step === 5 ? (
        <Step5
          files={files}
          onFiles={handleFileSelect}
          onRemove={handleRemoveFile}
          inputRef={fileInputRef}
          errors={stepErrors}
        />
      ) : null}

      {step === 6 ? (
        <Step6
          professionalType={professionalType}
          professionalTypeLabel={tType(professionalType)}
          specialty={specialty}
          fullLegalName={fullLegalName}
          licenseNumber={licenseNumber}
          licenseCountry={licenseCountry}
          bio={bio}
          linkedinUrl={linkedinUrl}
          websiteUrl={websiteUrl}
          approvedDisplayName={approvedDisplayName}
          documentCount={uploadedPaths.length}
        />
      ) : null}

      {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 1 || isPending}
          className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
        >
          {t("prev_cta")}
        </button>
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isPending}
            className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition hover:-translate-y-0.5"
          >
            {t("next_cta")}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isPending ? t("submit_pending") : t("submit_cta")}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step components ─────────────────────────────────────────────────

function Step1(props: {
  professionalType: ProfessionalType;
  setProfessionalType: (v: ProfessionalType) => void;
  specialty: string;
  setSpecialty: (v: string) => void;
}) {
  const t = useTranslations("verification.form");
  const tType = useTranslations("verification.professional_type");
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("step1_title")}
        </h2>
        <p className="mt-1 text-sm text-stone-600">{t("step1_subtitle")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {PROFESSIONAL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => props.setProfessionalType(type)}
            className={`rounded-2xl border p-4 text-left transition ${
              props.professionalType === type
                ? "border-rose-400 bg-rose-50/60 shadow-[0_8px_20px_rgba(220,100,100,0.12)]"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <span className="font-[family-name:var(--font-display)] text-lg text-stone-900">
              {tType(type)}
            </span>
          </button>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">{t("specialty_label")}</label>
        <input
          type="text"
          value={props.specialty}
          onChange={(e) => props.setSpecialty(e.target.value)}
          placeholder={t("specialty_placeholder")}
          maxLength={80}
          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-rose-300"
        />
      </div>
    </div>
  );
}

function Step2(props: {
  fullLegalName: string;
  setFullLegalName: (v: string) => void;
  licenseNumber: string;
  setLicenseNumber: (v: string) => void;
  licenseCountry: string;
  setLicenseCountry: (v: string) => void;
  errors: Record<string, string>;
}) {
  const t = useTranslations("verification.form");
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("step2_title")}
        </h2>
        <p className="mt-1 text-sm text-stone-600">{t("step2_subtitle")}</p>
      </div>
      <FieldText
        label={t("full_name_label")}
        help={t("full_name_help")}
        value={props.fullLegalName}
        onChange={props.setFullLegalName}
        error={props.errors.fullLegalName}
      />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <FieldText
          label={t("license_number_label")}
          value={props.licenseNumber}
          onChange={props.setLicenseNumber}
          error={props.errors.licenseNumber}
        />
        <FieldText
          label={t("license_country_label")}
          help={t("license_country_help")}
          value={props.licenseCountry}
          onChange={(v) => props.setLicenseCountry(v.toUpperCase().slice(0, 2))}
          error={props.errors.licenseCountry}
          maxLength={2}
        />
      </div>
    </div>
  );
}

function Step3(props: {
  bio: string;
  setBio: (v: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (v: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (v: string) => void;
  errors: Record<string, string>;
}) {
  const t = useTranslations("verification.form");
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("step3_title")}
        </h2>
        <p className="mt-1 text-sm text-stone-600">{t("step3_subtitle")}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">{t("bio_label")}</label>
        <textarea
          value={props.bio}
          onChange={(e) => props.setBio(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder={t("bio_placeholder")}
          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-rose-300"
        />
        <p className="mt-1 text-xs text-stone-500">
          {t("bio_help")} · {props.bio.length}/500
        </p>
      </div>
      <FieldText
        label={t("linkedin_label")}
        value={props.linkedinUrl}
        onChange={props.setLinkedinUrl}
        error={props.errors.linkedinUrl}
        type="url"
      />
      <FieldText
        label={t("website_label")}
        value={props.websiteUrl}
        onChange={props.setWebsiteUrl}
        error={props.errors.websiteUrl}
        type="url"
      />
    </div>
  );
}

function Step4(props: {
  approvedDisplayName: string;
  setApprovedDisplayName: (v: string) => void;
  errors: Record<string, string>;
}) {
  const t = useTranslations("verification.form");
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("step4_title")}
        </h2>
        <p className="mt-1 text-sm text-stone-600">{t("step4_subtitle")}</p>
      </div>
      <FieldText
        label={t("display_name_label")}
        value={props.approvedDisplayName}
        onChange={props.setApprovedDisplayName}
        error={props.errors.approvedDisplayName}
      />
    </div>
  );
}

function Step5(props: {
  files: FileRowState[];
  onFiles: (files: FileList | null) => void;
  onRemove: (row: FileRowState) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  errors: Record<string, string>;
}) {
  const t = useTranslations("verification.form");
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("step5_title")}
        </h2>
        <p className="mt-1 text-sm text-stone-600">{t("step5_subtitle")}</p>
      </div>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          props.onFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-rose-300/60 bg-rose-50/40 px-6 py-10 text-center transition hover:bg-rose-50/70"
      >
        <input
          ref={props.inputRef}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => props.onFiles(e.target.files)}
          className="sr-only"
        />
        <span className="font-[family-name:var(--font-display)] text-lg text-stone-900">
          {t("upload_drop")}
        </span>
        <span className="mt-1 text-xs text-stone-500">{t("upload_constraints")}</span>
      </label>

      {props.files.length > 0 ? (
        <ul className="space-y-2">
          {props.files.map((row) => (
            <li
              key={row.localKey}
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-stone-800">{row.name}</p>
                <p className="text-[11px] text-stone-500">
                  {row.status === "uploading"
                    ? t("upload_pending")
                    : row.status === "uploaded"
                      ? t("upload_uploaded")
                      : t("upload_failed")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => props.onRemove(row)}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                {t("upload_remove")}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {props.errors.documents ? (
        <p className="text-sm text-rose-600">{props.errors.documents}</p>
      ) : null}
    </div>
  );
}

function Step6(props: {
  professionalType: ProfessionalType;
  professionalTypeLabel: string;
  specialty: string;
  fullLegalName: string;
  licenseNumber: string;
  licenseCountry: string;
  bio: string;
  linkedinUrl: string;
  websiteUrl: string;
  approvedDisplayName: string;
  documentCount: number;
}) {
  const t = useTranslations("verification.form");
  const rows: Array<[string, string]> = [
    [t("step1_title"), `${props.professionalTypeLabel}${props.specialty ? ` · ${props.specialty}` : ""}`],
    [t("full_name_label"), props.fullLegalName],
    [t("license_number_label"), `${props.licenseNumber} (${props.licenseCountry})`],
    [t("display_name_label"), props.approvedDisplayName],
    [t("bio_label"), props.bio || "—"],
    ["LinkedIn", props.linkedinUrl || "—"],
    [t("website_label"), props.websiteUrl || "—"],
    [t("step5_title"), `${props.documentCount}`],
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("step6_title")}
        </h2>
        <p className="mt-1 text-sm text-stone-600">{t("step6_subtitle")}</p>
      </div>
      <dl className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
            <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">{label}</dt>
            <dd className="text-right text-sm text-stone-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

function FieldText(props: {
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700">{props.label}</label>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        maxLength={props.maxLength}
        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-rose-300"
      />
      {props.help ? <p className="mt-1 text-xs text-stone-500">{props.help}</p> : null}
      {props.error ? <p className="mt-1 text-xs text-rose-600">{props.error}</p> : null}
    </div>
  );
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
