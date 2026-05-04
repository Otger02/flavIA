import "server-only";

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Flavia <noreply@flavia.app>";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://flavia.app").replace(/\/$/, "");

export async function sendWelcomeEmail(to: string): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured, skipping welcome email");
    return;
  }

  await resend.emails
    .send({
      from: FROM,
      to,
      subject: "Bienvenida a Flavia",
      html: buildWelcomeHtml(),
    })
    .catch((error) => {
      console.warn("[email] welcome send failed", error);
    });
}

function buildWelcomeHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#fef6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.3em;color:#a8a29e;margin:0;">Compañamiento íntimo</p>
      <h1 style="font-size:30px;color:#1c1917;margin:8px 0 0;font-weight:400;">Flavia</h1>
    </div>

    <div style="background:white;border-radius:24px;padding:32px;border:1px solid rgba(231,200,190,0.4);box-shadow:0 8px 24px rgba(180,120,100,0.06);">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#c4605a;margin:0 0 16px;">Bienvenida</p>
      <h2 style="font-size:22px;color:#1c1917;font-weight:400;margin:0 0 16px;">Me alegra que estés aquí</h2>
      <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0 0 12px;">
        Flavia es un espacio seguro para explorar tu vida íntima y emocional a tu ritmo, sin juicios.
      </p>
      <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0 0 12px;">
        Puedes empezar una conversación con la IA en cualquier momento, explorar la biblioteca de contenido o leer las experiencias de otras personas en la comunidad.
      </p>
      <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0;">
        Todo lo que compartas aquí es tuyo y solo tuyo.
      </p>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <a href="${APP_URL}/chat"
         style="display:inline-block;background:linear-gradient(135deg,#fb7185,#f43f5e);color:white;text-decoration:none;padding:13px 32px;border-radius:9999px;font-size:14px;font-weight:500;box-shadow:0 8px 20px rgba(220,100,100,0.22);">
        Empezar mi primera conversación
      </a>
    </div>

    <div style="margin-top:24px;text-align:center;">
      <a href="${APP_URL}/library"
         style="display:inline-block;color:#c4605a;text-decoration:none;font-size:13px;border:1px solid rgba(196,96,90,0.3);padding:10px 24px;border-radius:9999px;">
        Explorar la biblioteca
      </a>
    </div>

    <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(231,200,190,0.3);">
      <p style="font-size:12px;color:#a8a29e;margin:0;">Recibiste este correo porque te registraste en flavia.app.</p>
      <p style="font-size:12px;color:#a8a29e;margin:4px 0 0;">
        <a href="${APP_URL}/account" style="color:#a8a29e;">Gestionar notificaciones</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
