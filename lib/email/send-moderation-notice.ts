import "server-only";

import { getDefaultFrom, sendEmailWithRetry } from "@/lib/email/resend-client";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://flavia.app").replace(/\/$/, "");

type ModerationAction = "hide" | "remove";
type ContentType = "thread" | "comment" | "story";

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  thread: "publicación",
  comment: "comentario",
  story: "historia",
};

const ACTION_COPY: Record<ModerationAction, { subject: string; headline: string; body: string }> = {
  hide: {
    subject: "Tu contenido en Flavia ha sido revisado",
    headline: "Tu contenido no está visible temporalmente",
    body: "Hemos revisado tu contenido y, de momento, no es visible para otras usuarias. Esto puede deberse a que está pendiente de revisión adicional o no cumple totalmente las normas de nuestra comunidad.",
  },
  remove: {
    subject: "Tu contenido en Flavia ha sido eliminado",
    headline: "Tu contenido ha sido retirado",
    body: "Hemos retirado tu contenido porque no cumple las normas de nuestra comunidad. Te invitamos a leer nuestra política de comunidad antes de publicar de nuevo.",
  },
};

export async function sendModerationNoticeEmail({
  to,
  contentType,
  action,
}: {
  to: string;
  contentType: ContentType;
  action: ModerationAction;
}): Promise<void> {
  const copy = ACTION_COPY[action];
  const label = CONTENT_TYPE_LABELS[contentType];

  await sendEmailWithRetry(
    {
      from: getDefaultFrom(),
      to,
      subject: copy.subject,
      html: buildHtml({ headline: copy.headline, body: copy.body, label }),
    },
    { label: "moderation-notice" },
  );
}

function buildHtml({ headline, body, label }: { headline: string; body: string; label: string }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#fef6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.3em;color:#a8a29e;margin:0;">Comunidad Flavia</p>
      <h1 style="font-size:30px;color:#1c1917;margin:8px 0 0;font-weight:400;">Flavia</h1>
    </div>

    <div style="background:white;border-radius:24px;padding:32px;border:1px solid rgba(231,200,190,0.4);box-shadow:0 8px 24px rgba(180,120,100,0.06);">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#c4605a;margin:0 0 16px;">Aviso sobre tu ${label}</p>
      <h2 style="font-size:22px;color:#1c1917;font-weight:400;margin:0 0 16px;">${headline}</h2>
      <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0 0 16px;">${body}</p>
      <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0;">
        Si tienes alguna duda, puedes contactarnos respondiendo a este correo.
      </p>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <a href="${APP_URL}/politica-comunidad"
         style="display:inline-block;color:#c4605a;text-decoration:none;font-size:13px;border:1px solid rgba(196,96,90,0.3);padding:10px 24px;border-radius:9999px;">
        Ver política de comunidad
      </a>
    </div>

    <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(231,200,190,0.3);">
      <p style="font-size:12px;color:#a8a29e;margin:0;">Recibiste este correo porque tienes una cuenta en flavia.app.</p>
      <p style="font-size:12px;color:#a8a29e;margin:4px 0 0;">
        <a href="${APP_URL}/account" style="color:#a8a29e;">Gestionar notificaciones</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
