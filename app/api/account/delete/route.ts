import "server-only";

import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Flavia <noreply@flavia.app>";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://flavia.app").replace(/\/$/, "");

export const runtime = "nodejs";

export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email;

  // Delete via admin client (bypasses RLS — auth.users cascade deletes profiles + all data)
  const admin = createAdminSupabaseClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("[account-delete] Failed to delete user:", error.message);
    return NextResponse.json({ error: "No se pudo eliminar la cuenta. Inténtalo de nuevo o contacta con soporte." }, { status: 500 });
  }

  // Sign out the current session (best-effort — user is already deleted)
  await supabase.auth.signOut().catch(() => {});

  // Send confirmation email (best-effort)
  if (resend && email) {
    void resend.emails
      .send({
        from: FROM,
        to: email,
        subject: "Tu cuenta de Flavia ha sido eliminada",
        html: `
          <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,sans-serif;background:#fef6ee;">
            <h1 style="font-size:22px;color:#1c1917;font-weight:400;margin:0 0 16px;">Tu cuenta ha sido eliminada</h1>
            <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0 0 12px;">
              Confirmamos que tu cuenta y todos tus datos han sido eliminados de Flavia de forma permanente.
            </p>
            <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0 0 24px;">
              Si tienes alguna pregunta, puedes escribirnos a <a href="mailto:hola@flavia.app" style="color:#c4605a;">hola@flavia.app</a>.
            </p>
            <p style="font-size:13px;color:#a8a29e;margin:0;">Gracias por haber formado parte de Flavia.</p>
          </div>
        `.trim(),
      })
      .catch((err) => console.warn("[account-delete] confirmation email failed:", err));
  }

  return NextResponse.json({ ok: true });
}
