import "server-only";

import { Resend } from "resend";

import type { ProfessionalVerification } from "@/features/professional-verification/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Flavia <noreply@flavia.app>";
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
  if (!resend) {
    console.warn("[verification-email] RESEND_API_KEY not configured, skipping");
    return;
  }

  const { userEmail, verification, adminEmails } = params;
  const typeLabel = professionalTypeLabel(verification.professionalType);

  const sends: Promise<unknown>[] = [];

  if (userEmail) {
    sends.push(
      resend.emails.send({
        from: FROM,
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
      }),
    );
  }

  for (const adminEmail of adminEmails) {
    sends.push(
      resend.emails.send({
        from: FROM,
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
      }),
    );
  }

  await Promise.allSettled(sends);
}

export async function sendVerificationApprovedEmail(params: {
  userEmail: string;
  verification: ProfessionalVerification;
}): Promise<void> {
  if (!resend) {
    console.warn("[verification-email] RESEND_API_KEY not configured, skipping");
    return;
  }

  const { userEmail, verification } = params;
  const typeLabel = professionalTypeLabel(verification.professionalType);

  await resend.emails
    .send({
      from: FROM,
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
    })
    .catch((error) => {
      console.warn("[verification-email] approved send failed", error);
    });
}

export async function sendVerificationRejectedEmail(params: {
  userEmail: string;
  verification: ProfessionalVerification;
}): Promise<void> {
  if (!resend) {
    console.warn("[verification-email] RESEND_API_KEY not configured, skipping");
    return;
  }

  const { userEmail, verification } = params;

  await resend.emails
    .send({
      from: FROM,
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
    })
    .catch((error) => {
      console.warn("[verification-email] rejected send failed", error);
    });
}
