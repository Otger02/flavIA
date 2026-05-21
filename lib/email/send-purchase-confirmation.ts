import "server-only";

import { getDefaultFrom, sendEmailWithRetry } from "@/lib/email/resend-client";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://flavia.app").replace(/\/$/, "");

type SendPurchaseConfirmationParams = {
  to: string;
  planName: string;
};

export async function sendPurchaseConfirmationEmail({
  to,
  planName,
}: SendPurchaseConfirmationParams): Promise<void> {
  await sendEmailWithRetry(
    {
      from: getDefaultFrom(),
      to,
      subject: `Tu suscripción a ${planName} está activa`,
      html: buildPurchaseHtml({ planName }),
    },
    { label: "purchase_confirmation" },
  );
}

function buildPurchaseHtml({ planName }: { planName: string }): string {
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
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#c4605a;margin:0 0 16px;">Confirmación de pago</p>
      <h2 style="font-size:22px;color:#1c1917;font-weight:400;margin:0 0 16px;">Tu ${planName} está activo</h2>
      <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0 0 12px;">
        Gracias por confiar en Flavia. Tu suscripción está activa y ya tienes acceso completo a todas las funcionalidades.
      </p>
      <div style="background:#fef6ee;border-radius:16px;padding:20px;margin:20px 0;">
        <p style="font-size:13px;color:#78716c;margin:0 0 8px;">Lo que tienes disponible:</p>
        <ul style="font-size:14px;line-height:1.9;color:#44403c;margin:0;padding-left:20px;">
          <li>Conversaciones ilimitadas con Flavia IA</li>
          <li>Acceso completo a la biblioteca</li>
          <li>Participación en la comunidad</li>
          <li>Invitar a Flavia a hilos de la comunidad</li>
        </ul>
      </div>
      <p style="font-size:13px;line-height:1.7;color:#78716c;margin:0;">
        Puedes gestionar o cancelar tu suscripción en cualquier momento desde tu cuenta.
      </p>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <a href="${APP_URL}/chat"
         style="display:inline-block;background:linear-gradient(135deg,#fb7185,#f43f5e);color:white;text-decoration:none;padding:13px 32px;border-radius:9999px;font-size:14px;font-weight:500;box-shadow:0 8px 20px rgba(220,100,100,0.22);">
        Empezar a usar Flavia Plus
      </a>
    </div>

    <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(231,200,190,0.3);">
      <p style="font-size:12px;color:#a8a29e;margin:0;">Recibirás un recibo separado de Stripe con los detalles de facturación.</p>
      <p style="font-size:12px;color:#a8a29e;margin:4px 0 0;">
        <a href="${APP_URL}/account" style="color:#a8a29e;">Gestionar suscripción</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
