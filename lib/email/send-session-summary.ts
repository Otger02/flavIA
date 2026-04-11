import "server-only";

import { Resend } from "resend";
import { getLocale, getTranslations } from "next-intl/server";
import { isTopicSlug } from "@/lib/topic-config";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type SendSessionSummaryEmailParams = {
  to: string;
  summary: string;
  sessionTopic: string | null;
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

  const [tShared, tEmail, locale] = await Promise.all([
    getTranslations("shared"),
    getTranslations("emails"),
    getLocale(),
  ]);

  const topicLabel = sessionTopic && isTopicSlug(sessionTopic)
    ? tShared(`topics.${sessionTopic}`)
    : null;
  const subject = topicLabel
    ? tEmail("session_summary.subject_with_topic", { topic: topicLabel })
    : tEmail("session_summary.subject_default");

  try {
    await resend.emails.send({
      from: "Flavia <flavia@updates.flavia.app>",
      to,
      subject,
      html: buildEmailHtml({
        summary,
        topicLabel,
        locale,
        intimateLabel: tEmail("session_summary.intimate_label"),
        brand: tEmail("session_summary.brand"),
        summaryEyebrow: tEmail("session_summary.summary_eyebrow"),
        continueCta: tEmail("session_summary.continue_cta"),
        footerReason: tEmail("session_summary.footer_reason"),
        footerManage: tEmail("session_summary.footer_manage"),
      }),
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
  locale,
  intimateLabel,
  brand,
  summaryEyebrow,
  continueCta,
  footerReason,
  footerManage,
}: {
  summary: string;
  topicLabel: string | null;
  locale: string;
  intimateLabel: string;
  brand: string;
  summaryEyebrow: string;
  continueCta: string;
  footerReason: string;
  footerManage: string;
}) {
  const topicLine = topicLabel
    ? `<p style="color:#c4605a;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">${topicLabel}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#fef6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.3em;color:#a8a29e;">${intimateLabel}</p>
      <h1 style="font-size:28px;color:#1c1917;margin:8px 0 0;font-weight:400;">${brand}</h1>
    </div>

    <div style="background:white;border-radius:24px;padding:32px;border:1px solid rgba(231,200,190,0.4);box-shadow:0 8px 24px rgba(180,120,100,0.06);">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#c4605a;margin:0 0 16px;">${summaryEyebrow}</p>
      ${topicLine}
      <p style="font-size:15px;line-height:1.8;color:#44403c;margin:0;white-space:pre-wrap;">${summary}</p>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <a href="https://flavia.app/chat" style="display:inline-block;background:linear-gradient(135deg,#fb7185,#f43f5e);color:white;text-decoration:none;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:500;">${continueCta}</a>
    </div>

    <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(231,200,190,0.3);">
      <p style="font-size:12px;color:#a8a29e;margin:0;">${footerReason}</p>
      <p style="font-size:12px;color:#a8a29e;margin:4px 0 0;">
        <a href="https://flavia.app/account" style="color:#a8a29e;">${footerManage}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
