import "server-only";

import { getDefaultFrom, sendEmailWithRetry } from "@/lib/email/resend-client";
import type { ProfessionalVerification } from "@/features/professional-verification/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://flavia.app";

function appUrl(path: string): string {
  return `${APP_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function professionalTypeLabel(type: ProfessionalVerification["professionalType"]): string {
  switch (type) {
    case "psychologist":
      return "Psicóloga/o";
    case "sexologist":
      return "Sexóloga/o";
    case "doctor":
      return "Médica/o";
  }
}

/**
 * Two emails fire on submit:
 *   1. To the user — "we received your request"
 *   2. To each admin — "new request to review"
 *
 * Both are best-effort. Failures are caught and logged — submission
 * succeeds either way.
 */
export async function sendVerificationSubmittedEmails(params: {
  userEmail: string | null;
  verification: ProfessionalVerification;
  adminEmails: readonly string[];
}): Promise<void> {
  const { userEmail, verification, adminEmails } = params;
  const typeLabel = professionalTypeLabel(verification.professionalType);

  const sends: Promise<unknown>[] = [];

  if (userEmail) {
    sends.push(
      sendEmailWithRetry(
        {
          from: getDefaultFrom(),
          to: userEmail,
          subject: "Recibimos tu solicitud de verificación",
          html: `
            <p>Hola,</p>
            <p>Recibimos tu solicitud para verificarte como <strong>${typeLabel}</strong> en Flavia.</p>
            <p>Vamos a revisar tu documentación. Te avisaremos por correo en cuanto haya una decisión.</p>
            <p>Mientras tanto, no aparece todavía la marca de profesional verificada en tus respuestas en la comunidad.</p>
            <p>Puedes ver el estado en cualquier momento aquí:<br>
              <a href="${appUrl("/perfil/verificacion/estado")}">Estado de mi solicitud</a>
            </p>
            <p>Gracias,<br>El equipo de Flavia</p>
          `.trim(),
        },
        { label: "verification_submitted_user" },
      ),
    );
  }

  for (const adminEmail of adminEmails) {
    sends.push(
      sendEmailWithRetry(
        {
          from: getDefaultFrom(),
          to: adminEmail,
          subject: "[Flavia] Nueva solicitud de verificación profesional",
          html: `
            <p>Una persona acaba de pedir verificación profesional.</p>
            <ul>
              <li>Tipo: <strong>${typeLabel}</strong></li>
              <li>Especialidad: ${verification.specialty ?? "(sin especificar)"}</li>
              <li>Nombre legal: ${verification.fullLegalName}</li>
              <li>Licencia: ${verification.licenseNumber} (${verification.licenseCountry})</li>
              <li>Documentos subidos: ${verification.documentStoragePaths.length}</li>
            </ul>
            <p>
              <a href="${appUrl(`/admin/profesionales/${verification.id}`)}">Revisar en el panel</a>
            </p>
          `.trim(),
        },
        { label: "verification_submitted_admin" },
      ),
    );
  }

  // sendEmailWithRetry never throws, so Promise.allSettled is redundant
  // — but keeping the parallel send shape preserves throughput. Each
  // wrapper call already reports its own failures to Sentry.
  await Promise.all(sends);
}

export async function sendVerificationApprovedEmail(params: {
  userEmail: string;
  verification: ProfessionalVerification;
}): Promise<void> {
  const { userEmail, verification } = params;
  const typeLabel = professionalTypeLabel(verification.professionalType);

  await sendEmailWithRetry(
    {
      from: getDefaultFrom(),
      to: userEmail,
      subject: "✓ Has sido verificada en Flavia",
      html: `
        <p>Hola,</p>
        <p>Tu solicitud de verificación como <strong>${typeLabel}</strong> ha sido aprobada.</p>
        <p>A partir de ahora, tu marca de <strong>Profesional verificada</strong> aparece junto a tu nombre en la comunidad. Tus respuestas tienen un tratamiento visual distinto y puedes marcarlas como "Respuesta oficial" cuando quieras.</p>
        <p>
          <a href="${appUrl("/perfil/verificacion/estado")}">Ver tu estado</a>
        </p>
        <p>Gracias por sumarte,<br>El equipo de Flavia</p>
      `.trim(),
    },
    { label: "verification_approved" },
  );
}

export async function sendVerificationRejectedEmail(params: {
  userEmail: string;
  verification: ProfessionalVerification;
}): Promise<void> {
  const { userEmail, verification } = params;

  await sendEmailWithRetry(
    {
      from: getDefaultFrom(),
      to: userEmail,
      subject: "Tu solicitud de verificación necesita ajustes",
      html: `
        <p>Hola,</p>
        <p>Revisamos tu solicitud y necesitamos algunos ajustes antes de aprobarla.</p>
        <blockquote style="border-left:3px solid #c4605a;padding-left:12px;color:#555;">
          ${(verification.rejectionReason ?? "").replace(/\n/g, "<br>")}
        </blockquote>
        <p>Puedes editar y reenviar la solicitud aquí:<br>
          <a href="${appUrl("/perfil/verificacion")}">Editar mi solicitud</a>
        </p>
        <p>Gracias,<br>El equipo de Flavia</p>
      `.trim(),
    },
    { label: "verification_rejected" },
  );
}
