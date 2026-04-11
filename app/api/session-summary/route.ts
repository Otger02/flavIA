import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { getChatHistory } from "@/features/chat/server/get-chat-history";
import { generateSessionSummary } from "@/features/chat/server/generate-session-summary";
import { sendSessionSummaryEmail } from "@/lib/email/send-session-summary";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, sendEmail } = body as Record<string, unknown>;

  if (typeof sessionId !== "string" || sessionId.trim().length === 0) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  // Verify the session belongs to the user
  const supabase = await createServerSupabaseClient();
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id, user_id, active_topic")
    .eq("id", sessionId)
    .single();

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Get messages and generate summary
  const messages = await getChatHistory({ sessionId });
  const summary = await generateSessionSummary(messages);

  if (!summary) {
    return NextResponse.json(
      { error: "Conversation too short to summarize" },
      { status: 400 },
    );
  }

  // Optionally send the summary via email
  let emailSent = false;
  if (sendEmail && user.email) {
    emailSent = await sendSessionSummaryEmail({
      to: user.email,
      summary,
      sessionTopic: session.active_topic,
    });
  }

  return NextResponse.json({ summary, emailSent });
}
