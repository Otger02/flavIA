import "server-only";

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type SendSessionSummaryEmailParams = {
  to: string;
  summary: string;
  sessionTopic: string | null;
};

const TOPIC_LABELS: Record<string, string> = {
  desire: "Deseo",
  communication: "Comunicación",
  couple_connection: "Conexión en pareja",
  jealousy: "Celos",
  boundaries: "Límites",
  pleasure: "Placer",
  self_connection: "Conexión contigo",
  routine: "Rutina",
  body_confidence: "Cuerpo",
  curiosity: "Curiosidad",
};

export async function sendSessionSummaryEmail({
  to,
  summary,
  sessionTopic,
}: SendSessionSummaryEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured, skipping email");
    return false;
  }

  const topicLabel = sessionTopic ? TOPIC_LABELS[sessionTopic] ?? sessionTopic : null;
  const subject = topicLabel
    ? `Tu conversación con Flavia — ${topicLabel}`
    : "Tu conversación con Flavia";

  try {
    await resend.emails.send({
      from: "Flavia <flavia@updates.flavia.app>",
      to,
      subject,
      html: buildEmailHtml({ summary, topicLabel }),
    });

    return true;
  } catch (error) {
    console.error("[email] Failed to send session summary:", error);
    return false;
  }
}

function buildEmailHtml({
  summary,
  topicLabel,
}: {
  summary: string;
  topicLabel: string | null;
}) {
  const topicLine = topicLabel
    ? `<p style="color:#c4605a;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">${topicLabel}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#fef6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.3em;color:#a8a29e;">Acompañamiento íntimo</p>
      <h1 style="font-size:28px;color:#1c1917;margin:8px 0 0;font-weight:400;">Flavia</h1>
    </div>

    <div style="background:white;border-radius:24px;padding:32px;border:1px solid rgba(231,200,190,0.4);box-shadow:0 8px 24px rgba(180,120,100,0.06);">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#c4605a;margin:0 0 16px;">Resumen de tu sesión</p>
      ${topicLine}
      <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0;white-space:pre-wrap;">${summary}</p>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <a href="https://flavia.app/chat" style="display:inline-block;background:linear-gradient(135deg,#fb7185,#f43f5e);color:white;text-decoration:none;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:500;">Continuar la conversación</a>
    </div>

    <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(231,200,190,0.3);">
      <p style="font-size:12px;color:#a8a29e;margin:0;">Recibes este email porque usaste Flavia.</p>
      <p style="font-size:12px;color:#a8a29e;margin:4px 0 0;">
        <a href="https://flavia.app/account" style="color:#a8a29e;">Gestionar preferencias</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
